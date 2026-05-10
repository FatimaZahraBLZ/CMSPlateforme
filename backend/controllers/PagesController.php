<?php
// backend/controllers/PagesController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/PageModel.php';

class PagesController
{
    private PDO $pdo;
    private AuthService $authService;
    private PageModel $pageModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->pageModel = new PageModel($pdo);
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

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $existingPage['website_id']);
        if ($role !== 'admin') {
            $this->respondUnauthorized('Only admins can delete pages');
            return;
        }

        $success = $this->pageModel->deletePage($pageId);
        if (!$success) {
            $this->respondServerError('Could not delete page');
            return;
        }

        echo json_encode(['status' => 'success']);
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
