<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/controllers/MenuController.php';
require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/models/MenuModel.php';
require_once __DIR__ . '/models/PageModel.php';

$pdo = getPDO();

// Generate a valid JWT token for super admin
$authService = new AuthService($pdo);

// Get super admin user
$stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1");
$stmt->execute();
$superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$superAdmin) {
    echo "No super admin user found!\n";
    exit(1);
}

$userId = $superAdmin['id'];
echo "Using user: $userId\n";

// Create a valid JWT token
$token = $authService->createJwt([
    'sub' => $userId,
    'email' => 'admin@cms.com',
    'role' => 'super_admin'
]);

echo "Generated token: " . substr($token, 0, 50) . "...\n\n";

// Get a website ID
$stmt = $pdo->prepare("SELECT id FROM websites LIMIT 1");
$stmt->execute();
$website = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$website) {
    echo "No websites found!\n";
    exit(1);
}

$websiteId = $website['id'];
echo "Using website: $websiteId\n\n";

// Simulate the API request
$_GET['website_id'] = $websiteId;
$_GET['language'] = 'en';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$_SERVER['REQUEST_METHOD'] = 'GET';

echo "=== Testing MenuController->getMenus() ===\n\n";

try {
    $controller = new MenuController($pdo);
    
    // Capture output
    ob_start();
    $controller->getMenus();
    $output = ob_get_clean();
    
    echo "Response:\n";
    echo $output . "\n\n";
    
    // Parse and validate JSON
    $response = json_decode($output, true);
    if ($response) {
        echo "Parsed JSON successfully\n";
        echo "Status: " . $response['status'] . "\n";
        echo "Menus count: " . count($response['menus'] ?? []) . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
