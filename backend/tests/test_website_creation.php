<?php
// backend/test_website_creation.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/WebsiteModel.php';

$pdo = getPDO();

// Test creating a website and pages directly
$websiteModel = new WebsiteModel($pdo);

// Create test website
$testWebsiteData = [
    'name' => 'Direct Test Website',
    'client' => 'Test Client',
    'domain' => 'directtest.localhost',
    'status' => 'published',
    'defaultLanguage' => 'en',
    'languages' => ['en'],
    'theme' => 'minimal'
];

echo "Creating website...\n";
try {
    $websiteId = $websiteModel->createWebsite($testWebsiteData, '00000000-0000-0000-0000-000000000001');
    echo "Website created: $websiteId\n\n";
    
    // Now try to create pages directly
    echo "Creating pages...\n";
    $defaultPages = [
        [
            'title' => 'Home',
            'slug' => 'home',
            'content' => '<h1>Welcome to Direct Test</h1>',
            'language' => 'en',
            'status' => 'published',
            'is_homepage' => true
        ],
        [
            'title' => 'About',
            'slug' => 'about',
            'content' => '<h1>About Us</h1>',
            'language' => 'en',
            'status' => 'published',
            'is_homepage' => false
        ]
    ];
    
    foreach ($defaultPages as $page) {
        try {
            echo "Creating page: " . $page['slug'] . "...\n";
            $websiteModel->createDefaultPage($websiteId, $page);
            echo "Page created: " . $page['slug'] . "\n";
        } catch (Exception $e) {
            echo "Error creating page: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nChecking pages in database...\n";
    $stmt = $pdo->prepare("SELECT id, title, slug, language, status FROM pages WHERE website_id = ?");
    $stmt->execute([$websiteId]);
    $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Pages found: " . count($pages) . "\n";
    echo json_encode($pages, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString();
}
?>
