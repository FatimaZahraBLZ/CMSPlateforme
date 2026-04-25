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
        try {
            $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            return $user ?: null;
        } catch (Exception $e) {
            error_log('findByEmail exception: ' . $e->getMessage());
            return null;
        }
    }

    public function findById(string $userId): ?array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            return $user ?: null;
        } catch (Exception $e) {
            error_log('findById exception: ' . $e->getMessage());
            return null;
        }
    }

    public function updateLastLogin(string $userId): bool
    {
        $stmt = $this->pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?');
        return $stmt->execute([$userId]);
    }

    public function getAllUsers(): array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC');
            $result = $stmt->execute();
            
            if (!$result) {
                error_log('getAllUsers execute failed: ' . json_encode($stmt->errorInfo()));
                return [];
            }
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('getAllUsers result count: ' . count($users));
            return $users ?: [];
        } catch (Exception $e) {
            error_log('getAllUsers exception: ' . $e->getMessage());
            throw $e;
        }
    }

    public function createUser(array $userData): ?string
    {
        try {
            $stmt = $this->pdo->prepare('INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())');
            
            $params = [
                $userData['id'],
                $userData['name'],
                $userData['email'],
                $userData['password_hash'],
                $userData['role'],
                $userData['status']
            ];
            
            error_log('Attempting to create user: ' . json_encode(['email' => $userData['email'], 'name' => $userData['name']]));
            
            $success = $stmt->execute($params);
            
            error_log('Insert result: ' . ($success ? 'SUCCESS' : 'FAILED'));
            if ($success) {
                error_log('Insert succeeded, returning user ID');
            }
            
            return $success ? $userData['id'] : null;
        } catch (Exception $e) {
            error_log('Exception in createUser: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateUser(string $userId, array $userData): bool
    {
        $fields = [];
        $values = [];

        if (isset($userData['name'])) {
            $fields[] = 'name = ?';
            $values[] = $userData['name'];
        }

        if (isset($userData['email'])) {
            $fields[] = 'email = ?';
            $values[] = $userData['email'];
        }

        if (isset($userData['role'])) {
            $fields[] = 'role = ?';
            $values[] = $userData['role'];
        }

        if (isset($userData['status'])) {
            $fields[] = 'status = ?';
            $values[] = $userData['status'];
        }

        if (isset($userData['password_hash'])) {
            $fields[] = 'password_hash = ?';
            $values[] = $userData['password_hash'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = NOW()';
        $values[] = $userId;

        $stmt = $this->pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function deleteUser(string $userId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM users WHERE id = ?');
        return $stmt->execute([$userId]);
    }
}
