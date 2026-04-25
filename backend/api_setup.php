<?php
// backend/api_setup.php
// This endpoint will setup the database and seed initial users

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getPDO();
    
    // 1. Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('super_admin', 'admin', 'editor', 'visitor') DEFAULT 'editor',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            avatar VARCHAR(500),
            last_login_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // 2. Check if seed users exist
    $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM users');
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $userCount = $result['count'] ?? 0;
    
    if ($userCount === 0) {
        // 3. Seed initial users
        $users = [
            [
                'id' => '00000000-0000-0000-0000-000000000001',
                'name' => 'Super Admin',
                'email' => 'admin@cms.com',
                'password' => 'admin',
                'role' => 'super_admin',
                'status' => 'active',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000002',
                'name' => 'Editor User',
                'email' => 'editor@cms.com',
                'password' => 'editor',
                'role' => 'editor',
                'status' => 'active',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Editor',
            ],
        ];

        $insert = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, role, status, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');

        foreach ($users as $user) {
            $hash = password_hash($user['password'], PASSWORD_BCRYPT);
            $insert->execute([
                $user['id'],
                $user['name'],
                $user['email'],
                $hash,
                $user['role'],
                $user['status'],
                $user['avatar'],
            ]);
        }
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Database initialized and seed users created',
            'users_created' => count($users),
            'test_credentials' => [
                ['email' => 'admin@cms.com', 'password' => 'admin', 'role' => 'super_admin'],
                ['email' => 'editor@cms.com', 'password' => 'editor', 'role' => 'editor']
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'message' => 'Database already initialized',
            'user_count' => $userCount
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Setup failed: ' . $e->getMessage()
    ]);
}
?>
