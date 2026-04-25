<?php
// backend/controllers/AuthController.php

require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../services/AuthService.php';

class AuthController
{
    private PDO $pdo;
    private UserModel $userModel;
    private AuthService $authService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->userModel = new UserModel($pdo);
        $this->authService = new AuthService($pdo);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email and password required']);
            return;
        }

        $email = trim($data['email']);
        $password = $data['password'];

        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            $this->debug('not found: ' . $email);
            $this->respondInvalid();
            return;
        }

        if (!$this->authService->verifyPassword($password, $user['password_hash'])) {
            $this->debug('wrong password for: ' . $email);
            $this->respondInvalid();
            return;
        }

        if ($user['status'] !== 'active') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Account is inactive']);
            return;
        }

        $this->userModel->updateLastLogin($user['id']);

        $jwt = $this->authService->createJwt([
            'sub' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]);

        $sessionId = $this->authService->createSession(
            $user['id'],
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );

        $this->saveActivity($user, 'login', 'authentication', null, 'User logged in');

        echo json_encode([
            'status' => 'success',
            'token' => $jwt,
            'sessionId' => $sessionId,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'status' => $user['status']
            ],
        ]);
    }

    public function validate(): void
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'No token provided']);
            return;
        }

        $token = $matches[1];
        $payload = $this->authService->validateJwt($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
            return;
        }

        $user = $this->userModel->findById($payload['sub']);

        if (!$user || $user['status'] !== 'active') {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'User not found or inactive']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'status' => $user['status']
            ],
        ]);
    }

    private function respondInvalid(): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }

    private function debug(string $message): void
    {
        file_put_contents(__DIR__ . '/../debug.log', '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n", FILE_APPEND);
    }

    private function saveActivity(array $user, string $action, string $targetType, ?string $targetId, string $targetName): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO activity_logs (id, user_id, user_name, action, target_type, target_id, target_name, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $this->generateUuid(),
            $user['id'],
            $user['name'],
            $action,
            $targetType,
            $targetId,
            $targetName,
            json_encode(['ip' => $_SERVER['REMOTE_ADDR'] ?? null]),
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
        ]);
    }

    private function generateUuid(): string
    {
        if (function_exists('random_bytes')) {
            $data = random_bytes(16);
            $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
            $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
            return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
        }

        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
