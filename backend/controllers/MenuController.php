<?php
// backend/controllers/MenuController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/MenuModel.php';
require_once __DIR__ . '/../models/PageModel.php';

class MenuController
{
    private PDO $pdo;
    private AuthService $authService;
    private MenuModel $menuModel;
    private PageModel $pageModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->menuModel = new MenuModel($pdo);
        $this->pageModel = new PageModel($pdo);
    }

    /**
     * GET /api/menus - Get all menus for a website
     */
    public function getMenus(): void
    {
        try {
            $token = $this->getBearerToken();
            if (!$token) {
                $this->respondUnauthorized('Authorization token is required');
                return;
            }

            $payload = $this->authService->validateJwt($token);
            if (!$payload || empty($payload['sub'])) {
                $this->respondUnauthorized('Invalid or expired token');
                return;
            }

            $websiteId = $_GET['website_id'] ?? null;
            $language = $_GET['language'] ?? null;

            if (!$websiteId) {
                $this->respondBadRequest('website_id is required');
                return;
            }

            $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $websiteId);
            if (!$role) {
                $this->respondUnauthorized('Access denied for this website');
                return;
            }

            $menus = $this->menuModel->getMenusForWebsite($websiteId, $language);
            echo json_encode(['status' => 'success', 'menus' => $menus]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/menu-items - Get menu items for a menu
     */
    public function getMenuItems(): void
    {
        try {
            $menuId = $_GET['menu_id'] ?? null;
            $websiteId = $_GET['website_id'] ?? null;

            if (!$menuId || !$websiteId) {
                $this->respondBadRequest('menu_id and website_id are required');
                return;
            }

            // Public endpoint - no authentication required for public menus
            $menu = $this->menuModel->getMenuById($menuId);
            if (!$menu) {
                $this->respondBadRequest('Menu not found');
                return;
            }

            // Verify menu belongs to the requested website
            if ($menu['website_id'] !== $websiteId) {
                $this->respondBadRequest('Menu does not belong to this website');
                return;
            }

            $menuItems = $this->menuModel->getMenuItems($menuId);
            echo json_encode(['status' => 'success', 'items' => $menuItems]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /api/menu-items - Create a menu item
     */
    public function createMenuItem(): void
    {
        $token = $this->getBearerToken();
        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);
        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['menu_id']) || empty($data['label']) || empty($data['type']) || empty($data['website_id'])) {
            $this->respondBadRequest('menu_id, label, type, and website_id are required');
            return;
        }

        // Validate that page menu items have page_id
        if ($data['type'] === 'page' && empty($data['page_id'])) {
            $this->respondBadRequest('page_id is required for page menu items');
            return;
        }

        // Validate that external/custom menu items have link
        if (in_array($data['type'], ['external', 'custom']) && empty($data['link'])) {
            $this->respondBadRequest('link is required for external/custom menu items');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $menu = $this->menuModel->getMenuById($data['menu_id']);
        if (!$menu) {
            $this->respondBadRequest('Menu not found');
            return;
        }

        if ($menu['website_id'] !== $data['website_id']) {
            $this->respondBadRequest('Menu does not belong to this website');
            return;
        }

        $menuItemId = $this->menuModel->createMenuItem(
            $data['menu_id'],
            $data['label'],
            $data['type'],
            $data['order_position'] ?? null,
            $data['page_id'] ?? null,
            $data['link'] ?? null,
            $data['is_active'] ?? true
        );

        if (!$menuItemId) {
            $this->respondServerError('Could not create menu item');
            return;
        }

        echo json_encode(['status' => 'success', 'menu_item_id' => $menuItemId]);
    }

    /**
     * PUT /api/menu-items/:id - Update a menu item
     */
    public function updateMenuItem(string $menuItemId): void
    {
        $token = $this->getBearerToken();
        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);
        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['website_id'])) {
            $this->respondBadRequest('website_id is required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $success = $this->menuModel->updateMenuItem($menuItemId, $data);
        if (!$success) {
            $this->respondServerError('Could not update menu item');
            return;
        }

        echo json_encode(['status' => 'success']);
    }

    /**
     * DELETE /api/menu-items/:id - Delete a menu item
     */
    public function deleteMenuItem(string $menuItemId): void
    {
        $token = $this->getBearerToken();
        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);
        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $websiteId = $_GET['website_id'] ?? null;
        if (!$websiteId) {
            $this->respondBadRequest('website_id is required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $websiteId);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $success = $this->menuModel->deleteMenuItem($menuItemId);
        if (!$success) {
            $this->respondServerError('Could not delete menu item');
            return;
        }

        echo json_encode(['status' => 'success']);
    }

    /**
     * POST /api/menus/reorder - Reorder menu items
     */
    public function reorderMenuItems(): void
    {
        $token = $this->getBearerToken();
        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);
        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['menu_id']) || empty($data['item_ids']) || empty($data['website_id'])) {
            $this->respondBadRequest('menu_id, item_ids (array), and website_id are required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $success = $this->menuModel->reorderMenuItems($data['menu_id'], $data['item_ids']);
        if (!$success) {
            $this->respondServerError('Could not reorder menu items');
            return;
        }

        echo json_encode(['status' => 'success']);
    }

    private function getBearerToken(): ?string
    {
        $authorization = null;

        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authorization = trim($headers['Authorization']);
            } elseif (isset($headers['authorization'])) {
                $authorization = trim($headers['authorization']);
            }
        }

        if (!$authorization) {
            return null;
        }

        if (preg_match('/^Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function respondUnauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondBadRequest(string $message): void
    {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondServerError(string $message): void
    {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
}