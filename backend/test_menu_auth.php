<?php
// Test the menu API with a valid auth token
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/models/UserModel.php';

$pdo = getPDO();
$authService = new AuthService($pdo);
$userModel = new UserModel($pdo);

// Get a test user
$users = $userModel->getAllUsers();
if (empty($users)) {
    echo "No users found in database\n";
    exit;
}

$user = $users[0];
$userId = $user['id'];

echo "Creating test token for user: {$user['email']}\n";

// Create a JWT token
$payload = [
    'sub' => $userId,
    'email' => $user['email'],
    'iat' => time(),
    'exp' => time() + 3600,
];

// Use the same secret as the JWT signing
$secret = 'your-secret-key'; // This should match the AuthService
$token = $authService->createJwt($payload);

echo "Token created: " . substr($token, 0, 50) . "...\n\n";

// Now simulate an HTTP request to the API
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = "/api/menus?website_id=test&language=en";
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";

// Get a website
$stmt = $pdo->query('SELECT id FROM websites LIMIT 1');
$website = $stmt->fetch();
if (!$website) {
    echo "No websites found\n";
    exit;
}

$_GET['website_id'] = $website['id'];
$_GET['language'] = 'en';

echo "Testing API call:\n";
echo "  Website ID: {$website['id']}\n";
echo "  Method: GET\n";
echo "  Path: /api/menus\n";
echo "  Auth: Bearer token\n\n";

// Now let's manually test the controller logic
require_once __DIR__ . '/controllers/MenuController.php';

echo "Attempting to call MenuController->getMenus()...\n";
echo "---\n";

ob_start();
$controller = new MenuController($pdo);
$controller->getMenus();
$output = ob_get_clean();

echo $output;
echo "---\n";

// Parse the response
$response = json_decode($output, true);
if ($response) {
    echo "\n✓ JSON Response received\n";
    echo "Status: " . ($response['status'] ?? 'unknown') . "\n";
} else {
    echo "\n✗ Not valid JSON\n";
    echo "First 100 chars: " . substr($output, 0, 100) . "\n";
}
