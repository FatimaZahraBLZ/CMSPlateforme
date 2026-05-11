<?php
// Debug menu item deletion
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/PageModel.php';
require_once __DIR__ . '/models/MenuModel.php';

$pdo = getPDO();
$pageModel = new PageModel($pdo);
$menuModel = new MenuModel($pdo);

// Get a website
$stmt = $pdo->query('SELECT id FROM websites LIMIT 1');
$website = $stmt->fetch();
$websiteId = $website['id'];

echo "=== Debug Menu Item Deletion ===\n\n";

// Get existing menu items
$menu = $menuModel->getMenuByType($websiteId, 'header', 'en');
$itemsBeforeCreate = $menuModel->getMenuItems($menu['id']);

echo "Menu items before creation:\n";
foreach ($itemsBeforeCreate as $item) {
    echo "  - {$item['id']}: {$item['label']} (page_id: {$item['page_id']})\n";
}
echo "Total: " . count($itemsBeforeCreate) . "\n\n";

// Create a test page
$testPageData = [
    'website_id' => $websiteId,
    'title' => 'Debug Delete Page ' . date('H:i:s'),
    'slug' => 'debug-delete-' . time(),
    'content' => '<p>Test</p>',
    'language' => 'en',
    'status' => 'published',
];

$page = $pageModel->createPage($testPageData, '00000000-0000-0000-0000-000000000001');
echo "Created page: {$page['id']} - {$page['title']}\n\n";

// Create menu item
$menuItemId = $menuModel->createMenuItem(
    $menu['id'],
    $page['title'],
    'page',
    null,
    $page['id'],
    null,
    true
);
echo "Created menu item: $menuItemId\n\n";

// Get items after creation
$itemsAfterCreate = $menuModel->getMenuItems($menu['id']);
echo "Menu items after creation:\n";
foreach ($itemsAfterCreate as $item) {
    echo "  - {$item['id']}: {$item['label']} (page_id: {$item['page_id']})\n";
}
echo "Total: " . count($itemsAfterCreate) . "\n\n";

// Delete menu items by page ID
echo "Deleting menu items for page: {$page['id']}\n";
$menuModel->deleteMenuItemsByPageId($page['id']);
echo "Deletion executed\n\n";

// Get items after deletion
$itemsAfterDelete = $menuModel->getMenuItems($menu['id']);
echo "Menu items after deletion:\n";
foreach ($itemsAfterDelete as $item) {
    echo "  - {$item['id']}: {$item['label']} (page_id: {$item['page_id']})\n";
}
echo "Total: " . count($itemsAfterDelete) . "\n";

if (count($itemsAfterDelete) === count($itemsAfterCreate) - 1) {
    echo "\n✓ Menu item successfully deleted!\n";
} else {
    echo "\n✗ Menu item count didn't change as expected\n";
}
