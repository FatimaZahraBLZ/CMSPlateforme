<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/MenuModel.php';
require_once __DIR__ . '/models/PageModel.php';

$pdo = getPDO();

echo "=== MENU DEBUG ===\n\n";

// Test 1: Check if menus exist
echo "Step 1: All menus in database\n";
$stmt = $pdo->prepare("SELECT id, website_id, type, language, name FROM menus LIMIT 5");
$stmt->execute();
$menus = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Found " . count($menus) . " menus\n";
var_dump($menus);

// Test 2: Try MenuModel
echo "\n\nStep 2: Testing MenuModel\n";
try {
    $menuModel = new MenuModel($pdo);
    
    // Get a website ID from the first website
    $websiteStmt = $pdo->prepare("SELECT id FROM websites LIMIT 1");
    $websiteStmt->execute();
    $website = $websiteStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($website) {
        $websiteId = $website['id'];
        echo "Testing with website: $websiteId\n";
        
        $result = $menuModel->getMenusForWebsite($websiteId, 'en');
        echo "Result from getMenusForWebsite:\n";
        var_dump($result);
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

// Test 3: Check menu items
echo "\n\nStep 3: Menu Items Structure\n";
$describeStmt = $pdo->prepare("DESCRIBE menu_items");
$describeStmt->execute();
$columns = $describeStmt->fetchAll(PDO::FETCH_ASSOC);
var_dump($columns);

echo "\n\nStep 4: Sample menu items query\n";
$stmt = $pdo->prepare("SELECT mi.id, mi.menu_id, mi.label, mi.type FROM menu_items mi LIMIT 3");
$stmt->execute();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
var_dump($items);
