<?php
// backend/controllers/DashboardController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/DashboardModel.php';

class DashboardController
{
    private PDO $pdo;
    private AuthService $authService;
    private DashboardModel $dashboardModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->dashboardModel = new DashboardModel($pdo);
    }

    public function stats(): void
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

            $stats = $this->dashboardModel->getDashboardStats($payload['sub']);

            echo json_encode([
                'status' => 'success',
                'stats' => $stats,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to load dashboard stats',
                'details' => $e->getMessage(),
            ]);
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
        echo json_encode([
            'status' => 'error',
            'message' => $message,
        ]);
    }
}