<?php
// Test menu API endpoint directly
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/MenuModel.php';
require_once __DIR__ . '/models/PageModel.php';

$pdo = getPDO();

// Get a test website and user
$stmt = $pdo->query('SELECT id FROM websites LIMIT 1');
$website = $stmt->fetch();
$websiteId = $website['id'];

$stmt = $pdo->query('SELECT id FROM users WHERE role = "super_admin" LIMIT 1');
$user = $stmt->fetch();
$userId = $user['id'];

echo "=== Testing Menu API ===\n";
echo "Website ID: $websiteId\n";
echo "User ID: $userId\n\n";

// Test MenuModel directly
$menuModel = new MenuModel($pdo);
$pageModel = new PageModel($pdo);

echo "Test 1: Getting menus directly from MenuModel\n";
$menus = $menuModel->getMenusForWebsite($websiteId, 'en');
echo "Result: " . json_encode($menus) . "\n\n";

echo "Test 2: Checking user role\n";
$role = $pageModel->getUserRoleForWebsite($userId, $websiteId);
echo "Role: " . ($role ? $role : 'NULL') . "\n\n";

echo "Test 3: Simulating API request\n";
$_GET['website_id'] = $websiteId;
$_GET['language'] = 'en';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer fake-token'; // This won't validate, but let's see the error

require_once __DIR__ . '/controllers/MenuController.php';

echo "Attempting to create MenuController and call getMenus()...\n";
$controller = new MenuController($pdo);
// Can't actually call this easily, so let's check the classes exist
echo "✓ MenuController class exists\n";
