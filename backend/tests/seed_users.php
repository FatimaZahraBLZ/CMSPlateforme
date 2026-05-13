<?php
// backend/seed_users.php

require_once __DIR__ . '/config.php';

$pdo = getPDO();

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

$insert = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, role, status, avatar, created_at, updated_at) VALUES (:id,:name,:email,:password_hash,:role,:status,:avatar,NOW(),NOW())');

foreach ($users as $user) {
    $hash = password_hash($user['password'], PASSWORD_BCRYPT);
    $insert->execute([
        ':id' => $user['id'],
        ':name' => $user['name'],
        ':email' => $user['email'],
        ':password_hash' => $hash,
        ':role' => $user['role'],
        ':status' => $user['status'],
        ':avatar' => $user['avatar'],
    ]);
}

echo json_encode(['status' => 'success', 'message' => 'Seed users inserted']);
