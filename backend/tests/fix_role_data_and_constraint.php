<?php
// backend/fix_role_data_and_constraint.php
// 
// This script:
// 1. Fixes existing empty/null roles in user_website_access based on user's global role
// 2. Adds NOT NULL DEFAULT 'editor' constraint to prevent empty roles in future
// 3. Updates role ENUM to only use 'admin' and 'editor' (no 'super_admin' in user_website_access)

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    echo "🔧 Starting role data and constraint fixes...\n\n";

    // Fix 1: Populate empty roles based on user's global role
    echo "📝 Step 1: Fixing empty roles in user_website_access...\n";
    
    $stmt = $pdo->prepare("
        UPDATE user_website_access uwa
        JOIN users u ON u.id = uwa.user_id
        SET uwa.role = CASE
            WHEN u.role = 'super_admin' THEN 'admin'
            WHEN u.role = 'admin' THEN 'admin'
            WHEN u.role = 'editor' THEN 'editor'
            ELSE 'editor'
        END
        WHERE uwa.role IS NULL OR uwa.role = ''
    ");
    
    $success = $stmt->execute();
    $affectedRows = $stmt->rowCount();
    
    if ($success) {
        echo "✅ Fixed $affectedRows rows with empty roles\n";
    } else {
        echo "❌ Failed to fix empty roles\n";
        throw new Exception("Failed to update empty roles");
    }

    // Fix 2: Add NOT NULL DEFAULT constraint and update ENUM
    echo "\n📝 Step 2: Adding NOT NULL DEFAULT constraint...\n";
    
    try {
        $pdo->exec("
            ALTER TABLE user_website_access
            MODIFY role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor'
        ");
        echo "✅ Successfully updated role column constraint\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            echo "⚠️  Constraint already exists, skipping\n";
        } else {
            throw $e;
        }
    }

    // Verify the fixes
    echo "\n📊 Verification:\n";
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count, role
        FROM user_website_access
        GROUP BY role
        ORDER BY role
    ");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nRole distribution in user_website_access:\n";
    foreach ($results as $row) {
        echo "  • {$row['role']}: {$row['count']} records\n";
    }

    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM user_website_access
        WHERE role IS NULL OR role = ''
    ");
    $stmt->execute();
    $emptyCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "\nEmpty roles remaining: $emptyCount\n";

    echo "\n✅ All fixes completed successfully!\n";
    echo "\n🎯 Next steps:\n";
    echo "1. Test page creation/update with editor user\n";
    echo "2. Test page deletion with admin user (should work)\n";
    echo "3. Test page deletion with editor user (should fail)\n";
    echo "4. Test super admin access override\n";

} catch (Exception $e) {
    error_log('Fix role data error: ' . $e->getMessage());
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
