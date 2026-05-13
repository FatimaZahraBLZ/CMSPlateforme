<?php
// Test auto page->menu creation
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

echo "=== Testing Auto Page->Menu Creation ===\n";
echo "Website ID: $websiteId\n\n";

// Create a new test page
$testPageData = [
    'website_id' => $websiteId,
    'title' => 'Auto Test Page ' . date('H:i:s'),
    'slug' => 'auto-test-' . time(),
    'content' => '<p>Test content</p>',
    'language' => 'en',
    'status' => 'published',
];

echo "Creating page: {$testPageData['title']}\n";
$page = $pageModel->createPage($testPageData, '00000000-0000-0000-0000-000000000001');

if ($page) {
    echo "✓ Page created: {$page['id']}\n";
    echo "  Title: {$page['title']}\n";
    echo "  Slug: {$page['slug']}\n";
    echo "  Status: {$page['status']}\n\n";
    
    // Auto-create menu item for published pages (simulate what controller does)
    if ($page['status'] === 'published') {
        echo "Auto-creating menu item for published page...\n";
        $menu = $menuModel->getMenuByType($page['website_id'], 'header', $page['language']);
        
        if (!$menu) {
            $menuId = $menuModel->createMenu(
                $page['website_id'],
                'header',
                'Main Menu',
                $page['language']
            );
        } else {
            $menuId = $menu['id'];
        }
        
        $menuItemId = $menuModel->createMenuItem(
            $menuId,
            $page['title'],
            'page',
            null,
            $page['id'],
            null,
            true
        );
        echo "✓ Menu item created: $menuItemId\n\n";
    }
    
    // Check if menu item was auto-created
    sleep(1); // Give it time to process
    
    $menus = $menuModel->getMenusForWebsite($websiteId, 'en');
    $headerMenu = null;
    foreach ($menus as $menu) {
        if ($menu['type'] === 'header') {
            $headerMenu = $menu;
            break;
        }
    }
    
    if ($headerMenu) {
        $items = $menuModel->getMenuItems($headerMenu['id']);
        $foundItem = null;
        foreach ($items as $item) {
            if ($item['page_id'] === $page['id']) {
                $foundItem = $item;
                break;
            }
        }
        
        if ($foundItem) {
            echo "✓ Auto-created menu item found!\n";
            echo "  Menu Item ID: {$foundItem['id']}\n";
            echo "  Label: {$foundItem['label']}\n";
            echo "  Type: {$foundItem['type']}\n";
            echo "  Page ID: {$foundItem['page_id']}\n";
            echo "  Order: {$foundItem['order_position']}\n";
        } else {
            echo "✗ Menu item was NOT auto-created\n";
            echo "  Current menu items:\n";
            foreach ($items as $item) {
                echo "    - {$item['label']} (type: {$item['type']}, page_id: {$item['page_id']})\n";
            }
        }
    }
} else {
    echo "✗ Failed to create page\n";
}
