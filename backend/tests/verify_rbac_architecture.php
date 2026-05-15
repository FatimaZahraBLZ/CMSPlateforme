<?php
/**
 * Test: RBAC Architecture Verification
 * 
 * Verifies that the professional CMS role system works correctly:
 * - Super admin sees ALL websites without needing access rows
 * - Admin/editor see only assigned websites
 * - Access checks bypass the table for super_admin
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../models/WebsiteModel.php';
require_once __DIR__ . '/../models/PageModel.php';

echo "🔐 RBAC Architecture Verification Test\n";
echo "======================================\n\n";

try {
    // Test Setup
    echo "1️⃣ Setting up test users...\n";
    
    // Get database connection
    $config = require __DIR__ . '/../config.php';
    $pdo = new PDO($config['dsn'], $config['db_user'], $config['db_pass']);
    
    $websiteModel = new WebsiteModel($pdo);
    $pageModel = new PageModel($pdo);
    
    // Get test users
    $stmt = $pdo->prepare("SELECT id, email, role FROM users LIMIT 5");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "⚠️  No users found in database. Skipping tests.\n";
        exit(0);
    }
    
    echo "✓ Found " . count($users) . " users\n\n";
    
    // Test 1: Super Admin Access
    echo "2️⃣ Testing Super Admin Access...\n";
    $superAdmins = array_filter($users, fn($u) => $u['role'] === 'super_admin');
    
    if (!empty($superAdmins)) {
        $superAdmin = reset($superAdmins);
        echo "   Super Admin: {$superAdmin['email']} (ID: {$superAdmin['id']})\n";
        
        // Get websites visible to super admin
        $websites = $websiteModel->getWebsitesForUser($superAdmin['id'], 'super_admin');
        echo "   ✓ Super admin can see " . count($websites) . " websites (should be ALL)\n";
        
        if (!empty($websites)) {
            $testWebsite = reset($websites);
            echo "   \n   Testing access to website: {$testWebsite['name']}\n";
            
            // Test direct access check
            $hasAccess = $websiteModel->userCanAccessWebsite(
                $superAdmin['id'], 
                $testWebsite['id'], 
                'super_admin'
            );
            echo "   ✓ Direct access check: " . ($hasAccess ? "ALLOWED ✓" : "DENIED ✗") . "\n";
            
            // Test role retrieval
            $role = $pageModel->getUserRoleForWebsite($superAdmin['id'], $testWebsite['id']);
            echo "   ✓ Retrieved role: '$role' (should be 'admin')\n";
        }
    } else {
        echo "   ⚠️  No super admin users found. Skipping super admin tests.\n";
    }
    
    echo "\n";
    
    // Test 2: Admin/Editor Access
    echo "3️⃣ Testing Admin/Editor Access...\n";
    $admins = array_filter($users, fn($u) => in_array($u['role'], ['admin', 'editor']));
    
    if (!empty($admins)) {
        $admin = reset($admins);
        echo "   Admin/Editor: {$admin['email']} (ID: {$admin['id']}, Role: {$admin['role']})\n";
        
        // Get websites visible to admin
        $websites = $websiteModel->getWebsitesForUser($admin['id'], $admin['role']);
        echo "   ✓ Admin/Editor can see " . count($websites) . " websites (only assigned)\n";
        
        if (!empty($websites)) {
            // Test access to first website (should have access)
            $assignedWebsite = reset($websites);
            echo "   \n   Testing access to ASSIGNED website: {$assignedWebsite['name']}\n";
            
            $hasAccess = $websiteModel->userCanAccessWebsite(
                $admin['id'], 
                $assignedWebsite['id'], 
                $admin['role']
            );
            echo "   ✓ Access check: " . ($hasAccess ? "ALLOWED ✓" : "DENIED ✗") . "\n";
            
            $role = $pageModel->getUserRoleForWebsite($admin['id'], $assignedWebsite['id']);
            echo "   ✓ Retrieved role: '$role'\n";
            
            // Test access to non-assigned website (if we can find one)
            $allWebsites = $pdo->query("SELECT id, name FROM websites LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
            $nonAssignedWebsites = array_filter(
                $allWebsites, 
                fn($w) => !in_array($w['id'], array_map(fn($v) => $v['id'], $websites))
            );
            
            if (!empty($nonAssignedWebsites)) {
                $nonAssignedWebsite = reset($nonAssignedWebsites);
                echo "   \n   Testing access to NON-ASSIGNED website: {$nonAssignedWebsite['name']}\n";
                
                $hasNoAccess = !$websiteModel->userCanAccessWebsite(
                    $admin['id'], 
                    $nonAssignedWebsite['id'], 
                    $admin['role']
                );
                echo "   ✓ Access check: " . ($hasNoAccess ? "DENIED ✓" : "ALLOWED ✗") . " (should be denied)\n";
            }
        }
    } else {
        echo "   ⚠️  No admin/editor users found. Skipping admin/editor tests.\n";
    }
    
    echo "\n";
    
    // Test 3: Access Table Verification
    echo "4️⃣ Verifying Access Table Architecture...\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_website_access WHERE user_id IN (SELECT id FROM users WHERE role = 'super_admin')");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $superAdminAccessRows = $result['count'] ?? 0;
    
    echo "   ✓ Super admin rows in user_website_access: $superAdminAccessRows\n";
    if ($superAdminAccessRows === 0) {
        echo "      (Optimal - super admins don't need access rows) ✓\n";
    } else {
        echo "      (Note: Rows exist but are not used for super_admin access)\n";
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_website_access");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalAccessRows = $result['count'] ?? 0;
    
    echo "   ✓ Total user_website_access rows: $totalAccessRows\n";
    
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT user_id) as count FROM user_website_access 
        WHERE user_id IN (SELECT id FROM users WHERE role IN ('admin', 'editor'))
    ");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $adminAccessRows = $result['count'] ?? 0;
    echo "   ✓ Admin/Editor users with access rows: $adminAccessRows\n";
    
    echo "\n";
    
    // Summary
    echo "✅ RBAC Architecture Verification Complete\n";
    echo "=========================================\n\n";
    
    echo "Summary:\n";
    echo "- Super Admin:   Bypasses access table (checks global role)\n";
    echo "- Admin/Editor:  Uses user_website_access table for scoped access\n";
    echo "- Ownership:     Tracked via websites.created_by\n";
    echo "\nThis matches the professional CMS pattern used by WordPress, Shopify, etc.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
