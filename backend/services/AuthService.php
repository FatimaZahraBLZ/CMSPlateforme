<?php
// backend/services/AuthService.php

require_once __DIR__ . '/../config.php';

class AuthService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function verifyPassword(string $plainPassword, string $hash): bool
    {
        return password_verify($plainPassword, $hash);
    }

    public function createJwt(array $payload): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGO]);

        // Extend JWT expiration to 7 days to match session expiration
        $payload = array_merge($payload, [
            'iat' => time(),
            'exp' => time() + (7 * 24 * 3600), // 7 days
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }

    public function validateJwt(string $jwt): ?array
    {
        $parts = explode('.', $jwt);

        if (count($parts) !== 3) {
            return null;
        }

        list($header64, $payload64, $signature64) = $parts;

        $signature = $this->base64UrlDecode($signature64);
        $expected = hash_hmac('sha256', $header64 . '.' . $payload64, JWT_SECRET, true);

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payload64), true);

        if (!$payload || !empty($payload['exp']) && time() > $payload['exp']) {
            return null;
        }

        return $payload;
    }

    public function createSession(string $userId, ?string $ip = null, ?string $agent = null): ?string
    {
        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

        $stmt = $this->pdo->prepare(
            'INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)'
        );

        $success = $stmt->execute([$sessionId, $userId, $ip, $agent, $expiresAt]);

        return $success ? $sessionId : null;
    }

    public function getSession(string $sessionId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()');
        $stmt->execute([$sessionId]);
        $s = $stmt->fetch();

        return $s ?: null;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
