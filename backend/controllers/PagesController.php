<?php
// backend/controllers/PagesController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/PageModel.php';
require_once __DIR__ . '/../models/MenuModel.php';
require_once __DIR__ . '/../models/PublishHistoryModel.php';

class PagesController
{
    private PDO $pdo;
    private AuthService $authService;
    private PageModel $pageModel;
    private MenuModel $menuModel;

    private PublishHistoryModel $publishHistoryModel;



    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->pageModel = new PageModel($pdo);
        $this->menuModel = new MenuModel($pdo);
        $this->publishHistoryModel = new PublishHistoryModel($pdo);
    }

    public function index(): void
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

        if (!$this->pageModel->getUserRoleForWebsite($payload['sub'], $websiteId)) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $language = $_GET['language'] ?? null;
        $pages = $this->pageModel->getPagesForWebsite($websiteId, $language ?: null);

        echo json_encode(['status' => 'success', 'pages' => $pages]);
    }

    public function create(): void
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
        if (empty($data['website_id']) || empty($data['title']) || empty($data['slug']) || empty($data['language']) || empty($data['status'])) {
            $this->respondBadRequest('website_id, title, slug, language, and status are required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        try {
            $page = $this->pageModel->createPage($data, $payload['sub']);
            if (!$page) {
                $this->respondServerError('Could not create page');
                return;
            }

            // Auto-create menu item for published pages
            if ($page['status'] === 'published') {
                $this->autoCreateMenuItemForPage($page);
            }

            $this->publishHistoryModel->insert(
                $data['website_id'],
                $payload['sub'],
                [
                    'action' => 'create',
                    'module' => 'pages',
                    'item_id' => $page['id'],
                    'item_name' => $data['title'] ?? 'Page',
                ],
                'success'
            );

            echo json_encode(['status' => 'success', 'page' => $page]);
        } catch (PDOException $e) {
            error_log('Create page error: ' . $e->getMessage());
            $this->respondBadRequest($e->getMessage());
            return;
        }
    }

    public function update(string $pageId): void
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

        $existingPage = $this->pageModel->getPageById($pageId);
        if (!$existingPage) {
            $this->respondBadRequest('Page not found');
            return;
        }

        if (!$this->pageModel->getUserRoleForWebsite($payload['sub'], $existingPage['website_id'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['title']) || empty($data['slug']) || empty($data['language']) || empty($data['status'])) {
            $this->respondBadRequest('title, slug, language, and status are required');
            return;
        }

        $success = $this->pageModel->updatePage($pageId, $data, $payload['sub']);
        if (!$success) {
            $this->respondServerError('Could not update page');
            return;
        }

        $action = ($data['status'] ?? '') === 'published' ? 'publish' : 'update';
        $this->publishHistoryModel->insert(
            $existingPage['website_id'],
            $payload['sub'],
            [
                'action' => $action,
                'module' => 'pages',
                'item_id' => $pageId,
                'item_name' => $data['title'] ?? 'Page',
                'status' => $data['status'] ?? null,
            ],
            'success'
        );

        $page = $this->pageModel->getPageById($pageId);
        echo json_encode(['status' => 'success', 'page' => $page]);
    }

    public function delete(string $pageId): void
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

        $existingPage = $this->pageModel->getPageById($pageId);
        if (!$existingPage) {
            $this->respondBadRequest('Page not found');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite(
        $payload['sub'],
        $existingPage['website_id']
        );

        if (!$role || !in_array($role, ['admin', 'editor'])) {
        $this->respondUnauthorized('Access denied for this website');
        return;
        }
        try {
            // ✅ SOFT DELETE: Mark page as deleted (not physically removed)
            // This hides page from:
            // - Admin panel
            // - Public website
            // - Menus (auto-filtered via status check)
            // But preserves data for recovery
            $success = $this->pageModel->softDeletePage($pageId, $payload['sub']);

            if (!$success) {
                $this->respondServerError('Could not delete page');
                return;
            }

            $this->publishHistoryModel->insert(
                $existingPage['website_id'],
                $payload['sub'],
                [
                    'action' => 'delete',
                    'module' => 'pages',
                    'item_id' => $pageId,
                ],
                'success'
            );

            // Optional: Delete menu items linked to this page
            // (Or leave them as orphaned, they won't appear in public menus anyway)
            // $this->menuModel->deleteMenuItemsByPageId($pageId);

            echo json_encode([
                'status' => 'success',
                'message' => 'Page soft deleted successfully',
                'note' => 'Page data preserved. Use restore to recover.'
            ]);
        } catch (PDOException $e) {
            error_log('Delete page error: ' . $e->getMessage());
            $this->respondServerError('Could not delete page');
        }
    }

    /**
     * Restore a soft-deleted page
     * POST /api/pages/:id/restore
     */
    public function restore(string $pageId): void
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

        $existingPage = $this->pageModel->getPageById($pageId);
        if (!$existingPage) {
            $this->respondBadRequest('Page not found');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $existingPage['website_id']);

        if (!$role || !in_array($role, ['admin', 'editor'])) {
        $this->respondUnauthorized('Access denied for this website');
        return;
        }

        try {
            $success = $this->pageModel->restorePage($pageId);

            if (!$success) {
                $this->respondServerError('Could not restore page');
                return;
            }

            $page = $this->pageModel->getPageById($pageId);
            echo json_encode([
                'status' => 'success',
                'message' => 'Page restored successfully',
                'page' => $page
            ]);
        } catch (PDOException $e) {
            error_log('Restore page error: ' . $e->getMessage());
            $this->respondServerError('Could not restore page');
        }
    }

    public function checkSlug(): void
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
        $slug = $_GET['slug'] ?? null;
        $language = $_GET['language'] ?? 'en';
        $pageId = $_GET['exclude_id'] ?? null; // For updates, exclude current page

        if (!$websiteId || !$slug) {
            $this->respondBadRequest('website_id and slug are required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $websiteId);
        if (!$role) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $exists = $this->pageModel->slugExists($websiteId, $slug, $language, $pageId);
        echo json_encode(['status' => 'success', 'exists' => $exists, 'slug' => $slug]);
    }

    /**
     * Auto-create menu item when a page is created
     */
    private function autoCreateMenuItemForPage(array $page): void
    {
        try {
            // Find the header menu for this website and language
            $menu = $this->menuModel->getMenuByType($page['website_id'], 'header', $page['language']);

            if (!$menu) {
                // If no header menu exists, create one
                $menuId = $this->menuModel->createMenu(
                    $page['website_id'],
                    'header',
                    'Main Menu',
                    $page['language']
                );
                if (!$menuId) {
                    error_log('Could not create header menu for page: ' . $page['id']);
                    return;
                }
            } else {
                $menuId = $menu['id'];
            }

            // Create menu item linked to the page
            $this->menuModel->createMenuItem(
                $menuId,
                $page['title'],
                'page',
                null, // Auto-assign order position
                $page['id'],
                null, // No custom link
                true // is_active
            );

            error_log('Auto-created menu item for page: ' . $page['id']);
        } catch (Exception $e) {
            error_log('Error auto-creating menu item: ' . $e->getMessage());
            // Don't fail the page creation if menu item creation fails
        }
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
