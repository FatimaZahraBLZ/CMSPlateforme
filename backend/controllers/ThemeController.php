<?php
// backend/controllers/ThemeController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/ThemeModel.php';
require_once __DIR__ . '/../models/PageModel.php';

class ThemeController
{
    private PDO $pdo;
    private AuthService $authService;
    private ThemeModel $themeModel;
    private PageModel $pageModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->themeModel = new ThemeModel($pdo);
        $this->pageModel = new PageModel($pdo);
    }

    public function getTheme(): void
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

        $themes = $this->themeModel->getThemesForWebsite($websiteId);
        $theme = null;

        foreach ($themes as $item) {
            if ((int)$item['is_default'] === 1) {
                $theme = $item;
                break;
            }
        }

        if (!$theme && count($themes) > 0) {
            $theme = $themes[0];
        }

        if (!$theme) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Theme not found'
            ]);
            return;
        }

        $theme['is_default'] = (bool)$theme['is_default'];
        $theme['settings'] = !empty($theme['settings'])
            ? json_decode($theme['settings'], true)
            : [];

        echo json_encode([
            'status' => 'success',
            'theme' => $theme
        ]);
    }

    public function updateTheme(string $themeId): void
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

        if (empty($data['website_id']) || empty($data['settings'])) {
            $this->respondBadRequest('website_id and settings are required');
            return;
        }

        $role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);
        if (!$role || !in_array($role, ['admin', 'editor'])) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        $updateData = [
            'settings' => $data['settings'],
        ];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }

        $success = $this->themeModel->updateTheme($themeId, $updateData);

        if (!$success) {
            $this->respondServerError('Failed to update theme');
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Theme updated successfully'
        ]);
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
            $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        if ($authorization && preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public function getPublicTheme(): void
{
    $websiteId = $_GET['website_id'] ?? null;

    if (!$websiteId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'website_id is required']);
        return;
    }

    $themes = $this->themeModel->getThemesForWebsite($websiteId);
    $theme = null;

    foreach ($themes as $item) {
        if ((int)$item['is_default'] === 1) {
            $theme = $item;
            break;
        }
    }

    if (!$theme && count($themes) > 0) {
        $theme = $themes[0];
    }

    if (!$theme) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Theme not found']);
        return;
    }

    $theme['is_default'] = (bool)$theme['is_default'];
    $theme['settings'] = !empty($theme['settings'])
        ? json_decode($theme['settings'], true)
        : [];

    echo json_encode([
        'status' => 'success',
        'theme' => $theme
    ]);
}

    private function respondBadRequest(string $message): void
    {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondUnauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondServerError(string $message): void
    {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
}