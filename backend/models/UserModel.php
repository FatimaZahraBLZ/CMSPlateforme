<?php
// backend/models/UserModel.php

// no composer autoload required in this simple demo
class UserModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function updateLastLogin(string $userId): bool
    {
        $stmt = $this->pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?');
        return $stmt->execute([$userId]);
    }
}
