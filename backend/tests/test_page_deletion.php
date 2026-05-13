<?php
// Test page deletion -> menu item deletion
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

echo "=== Testing Page Deletion -> Menu Item Deletion ===\n\n";

// Create a test page
$testPageData = [
    'website_id' => $websiteId,
    'title' => 'Delete Test Page ' . date('H:i:s'),
    'slug' => 'delete-test-' . time(),
    'content' => '<p>Test content</p>',
    'language' => 'en',
    'status' => 'published',
];

echo "Step 1: Creating test page\n";
$page = $pageModel->createPage($testPageData, '00000000-0000-0000-0000-000000000001');
echo "✓ Page created: {$page['id']}\n";

// Auto-create menu item
$menu = $menuModel->getMenuByType($websiteId, 'header', 'en');
$menuItemId = $menuModel->createMenuItem(
    $menu['id'],
    $page['title'],
    'page',
    null,
    $page['id'],
    null,
    true
);
echo "✓ Menu item created: $menuItemId\n\n";

// Verify menu item exists
$items = $menuModel->getMenuItems($menu['id']);
$itemCount = count($items);
echo "Step 2: Verify menu item exists\n";
echo "✓ Menu now has $itemCount items\n\n";

// Delete page
echo "Step 3: Deleting page\n";
$deleted = $pageModel->deletePage($page['id']);
if ($deleted) {
    echo "✓ Page deleted\n";
} else {
    echo "✗ Failed to delete page\n";
}

// Now manually delete the menu items (simulating what controller does)
$menuModel->deleteMenuItemsByPageId($page['id']);
echo "✓ Menu items deleted\n\n";

// Verify menu items are gone
$items = $menuModel->getMenuItems($menu['id']);
$newItemCount = count($items);
echo "Step 4: Verify menu items deleted\n";
echo "✓ Menu now has $newItemCount items (was $itemCount)\n";

if ($newItemCount < $itemCount) {
    echo "✓ Menu item was successfully deleted!\n";
} else {
    echo "✗ Menu item still exists\n";
}
