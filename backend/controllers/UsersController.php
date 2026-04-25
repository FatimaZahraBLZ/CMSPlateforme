<?php
// backend/controllers/UsersController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/UserModel.php';

class UsersController
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

            // Only super_admin and admin can list users
            $currentUser = $this->userModel->findById($payload['sub']);
            if (!$currentUser || !in_array($currentUser['role'], ['super_admin', 'admin'])) {
                $this->respondForbidden('Insufficient permissions');
                return;
            }

            error_log('Fetching users for user: ' . $payload['sub'] . ' with role: ' . $currentUser['role']);
            $users = $this->userModel->getAllUsers();
            error_log('Users fetched count: ' . count($users));

            echo json_encode([
                'status' => 'success',
                'users' => $users,
            ]);
        } catch (Exception $e) {
            error_log('Users index error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
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

        // Only super_admin can create users
        $currentUser = $this->userModel->findById($payload['sub']);
        if (!$currentUser || $currentUser['role'] !== 'super_admin') {
            $this->respondForbidden('Only super admin can create users');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Name, email, password, and role are required']);
            return;
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
            return;
        }

        // Check if email already exists
        $existingUser = $this->userModel->findByEmail($data['email']);
        if ($existingUser) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
            return;
        }

        // Validate role
        $validRoles = ['super_admin', 'admin', 'editor', 'visitor'];
        if (!in_array($data['role'], $validRoles)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid role']);
            return;
        }

        // Generate UUID for user ID
        $userId = $this->generateUuid();

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

        $userData = [
            'id' => $userId,
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'password_hash' => $passwordHash,
            'role' => $data['role'],
            'status' => $data['status'] ?? 'active'
        ];

        try {
            $createdUserId = $this->userModel->createUser($userData);

            if (!$createdUserId) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to create user']);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'User created successfully',
                'user' => [
                    'id' => $createdUserId,
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'role' => $userData['role'],
                    'status' => $userData['status']
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
            return;
        }
    }

    public function update(string $userId): void
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

        // Only super_admin can update users
        $currentUser = $this->userModel->findById($payload['sub']);
        if (!$currentUser || $currentUser['role'] !== 'super_admin') {
            $this->respondForbidden('Only super admin can update users');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Check if user exists
        $existingUser = $this->userModel->findById($userId);
        if (!$existingUser) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }

        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = trim($data['name']);
        }

        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
                return;
            }

            // Check if email is already taken by another user
            $emailUser = $this->userModel->findByEmail($data['email']);
            if ($emailUser && $emailUser['id'] !== $userId) {
                http_response_code(409);
                echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
                return;
            }

            $updateData['email'] = trim($data['email']);
        }

        if (isset($data['role'])) {
            $validRoles = ['super_admin', 'admin', 'editor', 'visitor'];
            if (!in_array($data['role'], $validRoles)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid role']);
                return;
            }
            $updateData['role'] = $data['role'];
        }

        if (isset($data['status'])) {
            $validStatuses = ['active', 'inactive'];
            if (!in_array($data['status'], $validStatuses)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
                return;
            }
            $updateData['status'] = $data['status'];
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No valid fields to update']);
            return;
        }

        $success = $this->userModel->updateUser($userId, $updateData);

        if (!$success) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to update user']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'User updated successfully'
        ]);
    }

    public function delete(string $userId): void
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

        // Only super_admin can delete users
        $currentUser = $this->userModel->findById($payload['sub']);
        if (!$currentUser || $currentUser['role'] !== 'super_admin') {
            $this->respondForbidden('Only super admin can delete users');
            return;
        }

        // Prevent deleting self
        if ($payload['sub'] === $userId) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Cannot delete your own account']);
            return;
        }

        // Check if user exists
        $existingUser = $this->userModel->findById($userId);
        if (!$existingUser) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }

        $success = $this->userModel->deleteUser($userId);

        if (!$success) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete user']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }

    public function getUserCountsByRole(): void
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

            // Only super_admin and admin can view user statistics
            $currentUser = $this->userModel->findById($payload['sub']);
            if (!$currentUser || !in_array($currentUser['role'], ['super_admin', 'admin'])) {
                $this->respondForbidden('Insufficient permissions');
                return;
            }

            $stmt = $this->pdo->prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role');
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Initialize counts for all roles
            $roleCounts = [
                'super_admin' => 0,
                'admin' => 0,
                'editor' => 0,
                'visitor' => 0,
            ];

            // Fill in the counts from the query results
            foreach ($results as $result) {
                if (isset($roleCounts[$result['role']])) {
                    $roleCounts[$result['role']] = (int)$result['count'];
                }
            }

            error_log('User counts by role: ' . json_encode($roleCounts));

            echo json_encode([
                'status' => 'success',
                'roleCounts' => $roleCounts,
            ]);
        } catch (Exception $e) {
            error_log('Get user counts error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function getBearerToken(): ?string
    {
        $authorization = null;

        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $authorization = isset($requestHeaders['Authorization']) ? trim($requestHeaders['Authorization']) : null;
        }

        if (!empty($authorization) && preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function respondUnauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondForbidden(string $message): void
    {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}