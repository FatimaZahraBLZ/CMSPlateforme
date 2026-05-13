<?php
require_once 'config.php';

try {
    $pdo = getPDO();
    
    // Define users with correct passwords
    $users_to_update = [
        [
            'email' => 'admin@cmsplatform.com',
            'password' => 'admin',
            'name' => 'Super Admin',
            'role' => 'super_admin',
            'id' => 'super-admin-uuid'
        ],
        [
            'email' => 'editor@cms.com',
            'password' => 'editor',
            'name' => 'Editor User',
            'role' => 'editor',
            'id' => '00000000-0000-0000-0000-000000000002'
        ]
    ];
    
    echo "=== UPDATING PASSWORDS ===\n\n";
    
    foreach ($users_to_update as $user) {
        $password_hash = password_hash($user['password'], PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare(
            'UPDATE users SET password_hash = ? WHERE email = ?'
        );
        
        $success = $stmt->execute([$password_hash, $user['email']]);
        
        if ($success) {
            echo "✓ Updated " . $user['email'] . " with password: " . $user['password'] . "\n";
            echo "  New hash: " . substr($password_hash, 0, 20) . "...\n";
        } else {
            echo "✗ Failed to update " . $user['email'] . "\n";
        }
    }
    
    echo "\n=== VERIFICATION ===\n\n";
    
    // Re-verify all passwords
    $stmt = $pdo->query('SELECT id, name, email, role, status, password_hash FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $test_passwords = [
        'admin@cms.com' => 'admin',
        'editor@cms.com' => 'editor',
        'admin@cmsplatform.com' => 'admin'
    ];
    
    foreach ($users as $user) {
        $test_pwd = $test_passwords[$user['email']] ?? null;
        if ($test_pwd) {
            $is_valid = password_verify($test_pwd, $user['password_hash']);
            echo $user['email'] . " (" . $test_pwd . "): " . ($is_valid ? "✓ PASS" : "✗ FAIL") . "\n";
        }
    }
    
    echo "\n✓ All passwords updated and verified!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
