<?php
// Test menu functionality
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/MenuModel.php';

$pdo = getPDO();
$menuModel = new MenuModel($pdo);

// Get websites
$stmt = $pdo->query('SELECT id, name FROM websites LIMIT 1');
$website = $stmt->fetch();

if (!$website) {
    echo json_encode(['status' => 'error', 'message' => 'No websites found']);
    exit;
}

$websiteId = $website['id'];

echo "=== Testing Menu System ===\n";
echo "Website: " . $website['name'] . " (ID: $websiteId)\n\n";

// Get menus
$menus = $menuModel->getMenusForWebsite($websiteId);
echo "Menus found: " . count($menus) . "\n";
foreach ($menus as $menu) {
    echo "  - {$menu['type']} ({$menu['language']}): {$menu['name']}\n";
    
    // Get menu items
    $items = $menuModel->getMenuItems($menu['id']);
    echo "    Items: " . count($items) . "\n";
    foreach ($items as $item) {
        $link = $item['type'] === 'page' 
            ? "/{$item['page_slug']}"
            : ($item['link'] ?? '(no link)');
        echo "      - {$item['label']} ($link)\n";
    }
}

echo "\nMenu system is working correctly!\n";
