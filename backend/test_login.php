<?php
// Test login API
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/controllers/AuthController.php';

$pdo = getPDO();

// Test data
$loginData = [
    'email' => 'admin@cms.com',
    'password' => 'admin'
];

echo "Testing login with:\n";
echo json_encode($loginData, JSON_PRETTY_PRINT) . "\n\n";

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

ob_start();
file_put_contents('php://input', json_encode($loginData));
$controller = new AuthController($pdo);
$controller->login();
$output = ob_get_clean();

echo "Response:\n";
echo $output . "\n";

// Parse response
$response = json_decode($output, true);
if ($response && isset($response['token'])) {
    echo "\n✓ Login successful!\n";
    echo "Token: " . substr($response['token'], 0, 50) . "...\n";
} else {
    echo "\n✗ Login failed\n";
}
