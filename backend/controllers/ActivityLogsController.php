<?php
// backend/controllers/ActivityLogsController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/UserModel.php';

class ActivityLogsController
{
    private PDO $pdo;
    private AuthService $authService;
    private UserModel $userModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->userModel = new UserModel($pdo);
    }

    /**
     * GET /api/activity-logs?search=&module=&action=&status=
     */
    public function index(): void
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

            $currentUser = $this->userModel->findById($payload['sub']);

            if (!$currentUser || $currentUser['role'] !== 'super_admin') {
                $this->respondForbidden('Only super admins can view activity logs');
                return;
            }

            $search = trim($_GET['search'] ?? '');
            $module = trim($_GET['module'] ?? '');
            $action = trim($_GET['action'] ?? '');

            $where = [];
            $params = [];

            if ($search !== '') {
                $where[] = "(
                    al.user_name LIKE ?
                    OR u.name LIKE ?
                    OR al.action LIKE ?
                    OR al.target_type LIKE ?
                    OR al.target_name LIKE ?
                    OR al.details LIKE ?
                )";

                $searchTerm = '%' . $search . '%';
                array_push(
                    $params,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm
                );
            }

            if ($module !== '') {
                $where[] = 'al.target_type = ?';
                $params[] = $module;
            }

            if ($action !== '') {
                $where[] = 'al.action = ?';
                $params[] = $action;
            }

            $whereSql = count($where) > 0
                ? 'WHERE ' . implode(' AND ', $where)
                : '';

            $stmt = $this->pdo->prepare("
                SELECT
                    al.id,
                    al.user_id,
                    COALESCE(NULLIF(al.user_name, ''), u.name, 'Unknown User') AS user_name,
                    al.action,
                    COALESCE(NULLIF(al.target_type, ''), 'system') AS target_type,
                    al.target_id,
                    COALESCE(NULLIF(al.target_name, ''), al.target_type, 'System activity') AS target_name,
                    al.details,
                    al.ip_address,
                    al.user_agent,
                    al.created_at
                FROM activity_logs al
                LEFT JOIN users u ON u.id = al.user_id
                $whereSql
                ORDER BY al.created_at DESC
                LIMIT 200
            ");

            $stmt->execute($params);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stats = $this->getStats();
            $modules = $this->getModules();
            $actions = $this->getActions();

            echo json_encode([
                'status' => 'success',
                'logs' => $logs,
                'stats' => $stats,
                'modules' => $modules,
                'actions' => $actions,
            ]);
        } catch (Exception $e) {
            error_log('Activity logs error: ' . $e->getMessage());

            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch activity logs',
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function getStats(): array
{
    $stmt = $this->pdo->prepare("
        SELECT
            COUNT(*) AS total_logs,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today_logs,
            COUNT(DISTINCT NULLIF(user_id, '')) AS active_users,
            COUNT(DISTINCT NULLIF(target_type, '')) AS modules_count
        FROM activity_logs
    ");

    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

    return [
        'total' => (int)($row['total_logs'] ?? 0),
        'today' => (int)($row['today_logs'] ?? 0),
        'users' => (int)($row['active_users'] ?? 0),
        'modules' => (int)($row['modules_count'] ?? 0),
    ];
}

    private function getModules(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT DISTINCT target_type
            FROM activity_logs
            WHERE target_type IS NOT NULL AND target_type != ''
            ORDER BY target_type ASC
        ");

        $stmt->execute();

        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'target_type');
    }

    private function getActions(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT DISTINCT action
            FROM activity_logs
            WHERE action IS NOT NULL AND action != ''
            ORDER BY action ASC
        ");

        $stmt->execute();

        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'action');
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

    private function respondForbidden(string $message): void
    {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => $message,
        ]);
    }
}