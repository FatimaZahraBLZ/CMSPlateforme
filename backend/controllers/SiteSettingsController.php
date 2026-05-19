<?php
// backend/controllers/SiteSettingsController.php

require_once __DIR__ . '/../services/AuthService.php';

class SiteSettingsController
{
    private PDO $pdo;
    private AuthService $authService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
    }

    public function getSettings(): void
    {
        $userId = $this->requireUser();
        if (!$userId) return;

        $websiteId = $_GET['website_id'] ?? null;

        if (!$websiteId) {
            $this->badRequest('website_id is required');
            return;
        }

        if (!$this->canManageWebsite($userId, $websiteId)) {
            $this->forbidden('Access denied for this website');
            return;
        }

        $settings = $this->findOrCreateSettings($websiteId, $userId);

        echo json_encode([
            'status' => 'success',
            'settings' => $settings
        ]);
    }

    public function updateSettings(): void
    {
        $userId = $this->requireUser();
        if (!$userId) return;

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || empty($data['website_id'])) {
            $this->badRequest('website_id is required');
            return;
        }

        $websiteId = $data['website_id'];

        if (!$this->canManageWebsite($userId, $websiteId)) {
            $this->forbidden('Access denied for this website');
            return;
        }

        $siteName = trim($data['site_name'] ?? '');
        if ($siteName === '') {
            $this->badRequest('Site name is required');
            return;
        }

        $socialLinks = [
            'facebook' => $data['facebook'] ?? '',
            'twitter' => $data['twitter'] ?? '',
            'instagram' => $data['instagram'] ?? '',
            'linkedin' => $data['linkedin'] ?? '',
            'youtube' => $data['youtube'] ?? '',
        ];

        $stmt = $this->pdo->prepare("
            INSERT INTO website_settings (
                id,
                website_id,
                site_name,
                logo,
                favicon,
                email,
                phone,
                address,
                social_links,
                updated_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                site_name = VALUES(site_name),
                logo = VALUES(logo),
                favicon = VALUES(favicon),
                email = VALUES(email),
                phone = VALUES(phone),
                address = VALUES(address),
                social_links = VALUES(social_links),
                updated_by = VALUES(updated_by),
                updated_at = CURRENT_TIMESTAMP
        ");

        $stmt->execute([
            $this->generateUuid(),
            $websiteId,
            $siteName,
            $data['logo'] ?? null,
            $data['favicon'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null,
            json_encode($socialLinks, JSON_UNESCAPED_UNICODE),
            $userId,
        ]);

        $this->pdo->prepare("UPDATE websites SET name = ? WHERE id = ?")
            ->execute([$siteName, $websiteId]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Site settings updated successfully'
        ]);
    }

    public function publicSettings(): void
    {
        $websiteId = $_GET['website_id'] ?? null;

        if (!$websiteId) {
            $this->badRequest('website_id is required');
            return;
        }

        $settings = $this->getSettingsRow($websiteId);

        echo json_encode([
            'status' => 'success',
            'settings' => $settings
        ]);
    }

    private function findOrCreateSettings(string $websiteId, string $userId): array
    {
        $settings = $this->getSettingsRow($websiteId);

        if ($settings) {
            return $settings;
        }

        $stmt = $this->pdo->prepare("SELECT name FROM websites WHERE id = ?");
        $stmt->execute([$websiteId]);
        $website = $stmt->fetch(PDO::FETCH_ASSOC);

        $siteName = $website['name'] ?? 'Website';

        $stmt = $this->pdo->prepare("
            INSERT INTO website_settings (
                id,
                website_id,
                site_name,
                social_links,
                updated_by
            )
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $this->generateUuid(),
            $websiteId,
            $siteName,
            json_encode([
                'facebook' => '',
                'twitter' => '',
                'instagram' => '',
                'linkedin' => '',
                'youtube' => '',
            ]),
            $userId,
        ]);

        return $this->getSettingsRow($websiteId);
    }

    private function getSettingsRow(string $websiteId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT *
            FROM website_settings
            WHERE website_id = ?
            LIMIT 1
        ");

        $stmt->execute([$websiteId]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) return null;

        $settings['social_links'] = !empty($settings['social_links'])
            ? json_decode($settings['social_links'], true)
            : [];

        return $settings;
    }

    private function canManageWebsite(string $userId, string $websiteId): bool
    {
        $stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) return false;
        if ($user['role'] === 'super_admin') return true;

        $stmt = $this->pdo->prepare("
            SELECT role
            FROM user_website_access
            WHERE user_id = ?
              AND website_id = ?
              AND role IN ('owner', 'admin', 'editor')
            LIMIT 1
        ");

        $stmt->execute([$userId, $websiteId]);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function requireUser(): ?string
    {
        $token = $this->getBearerToken();

        if (!$token) {
            $this->unauthorized('Authorization token is required');
            return null;
        }

        $payload = $this->authService->validateJwt($token);

        if (!$payload || empty($payload['sub'])) {
            $this->unauthorized('Invalid or expired token');
            return null;
        }

        return $payload['sub'];
    }

    private function getBearerToken(): ?string
    {
        $authorization = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if (!$authorization && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        if ($authorization && preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    private function badRequest(string $message): void
    {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function unauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function forbidden(string $message): void
    {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
}