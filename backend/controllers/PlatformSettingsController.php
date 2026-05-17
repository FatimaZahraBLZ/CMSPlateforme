<?php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../models/PlatformSettingsModel.php';

class PlatformSettingsController
{
    private PDO $pdo;
    private AuthService $authService;
    private UserModel $userModel;
    private PlatformSettingsModel $settingsModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->userModel = new UserModel($pdo);
        $this->settingsModel = new PlatformSettingsModel($pdo);
    }

    public function getSettings(): void
    {
        $user = $this->requireSuperAdmin();
        if (!$user) return;

        echo json_encode([
            'status' => 'success',
            'settings' => $this->settingsModel->getAll(),
        ]);
    }

    public function updateSettings(): void
    {
        $user = $this->requireSuperAdmin();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['settings'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'settings object is required']);
            return;
        }

        $this->settingsModel->updateMany($input['settings'], $user['id']);

        echo json_encode([
            'status' => 'success',
            'message' => 'Platform settings updated successfully',
        ]);
    }

    private function requireSuperAdmin(): ?array
    {
        $token = $this->getBearerToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Authorization token is required']);
            return null;
        }

        $payload = $this->authService->validateJwt($token);

        if (!$payload || empty($payload['sub'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
            return null;
        }

        $user = $this->userModel->findById($payload['sub']);

        if (!$user || $user['role'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Only super admins can manage global settings']);
            return null;
        }

        return $user;
    }

    private function getBearerToken(): ?string
    {
        $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

        if (!$authorization && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        if ($authorization && preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }
    public function publicIndex(): void
{
    try {
        $stmt = $this->pdo->query("
            SELECT setting_key, setting_value, setting_type
            FROM platform_settings
        ");

        $settings = [];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $value = $row['setting_value'];

            if ($row['setting_type'] === 'boolean') {
                $value = $value == '1';
            } elseif ($row['setting_type'] === 'number') {
                $value = is_numeric($value) ? $value + 0 : $value;
            } elseif ($row['setting_type'] === 'json') {
                $value = json_decode($value, true);
            }

            $settings[$row['setting_key']] = $value;
        }

        echo json_encode([
            'status' => 'success',
            'settings' => $settings
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch platform settings'
        ]);
    }
}
}