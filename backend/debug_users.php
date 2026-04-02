<?php
require_once 'config.php';

try {
    $pdo = getPDO();
    
    // Get all users
    $stmt = $pdo->query('SELECT id, name, email, role, status, password_hash FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "=== ALL USERS IN DATABASE ===\n\n";
    
    foreach ($users as $user) {
        echo "ID: " . $user['id'] . "\n";
        echo "Name: " . $user['name'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Role: " . $user['role'] . "\n";
        echo "Status: " . $user['status'] . "\n";
        echo "Password Hash: " . substr($user['password_hash'], 0, 20) . "...\n";
        echo "---\n\n";
    }
    
    // Test password verification
    echo "=== PASSWORD VERIFICATION TEST ===\n\n";
    
    $test_password = "admin";
    echo "Testing password: '$test_password'\n\n";
    
    foreach ($users as $user) {
        $is_valid = password_verify($test_password, $user['password_hash']);
        echo $user['email'] . ": " . ($is_valid ? "✓ PASSWORD MATCHES" : "✗ PASSWORD DOES NOT MATCH") . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
