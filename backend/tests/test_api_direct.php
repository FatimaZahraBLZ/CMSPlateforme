<?php
require 'config.php';

// Connect to DB
$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get a user and website
$stmt = $pdo->query('SELECT u.id, u.email, u.id as user_id FROM users u LIMIT 1');
$user = $stmt->fetch();

$stmt = $pdo->query('SELECT id FROM websites LIMIT 1');
$website = $stmt->fetch();

if (!$user || !$website) {
    echo "No users or websites found\n";
    exit(1);
}

$userId = $user['id'];
$websiteId = $website['id'];

// Check what menus exist for this website
echo "=== CHECKING MENUS FOR WEBSITE ===\n";
$stmt = $pdo->prepare('SELECT id, type, language, name FROM menus WHERE website_id = ?');
$stmt->execute([$websiteId]);
$menus = $stmt->fetchAll();
echo "Found " . count($menus) . " menus:\n";
foreach ($menus as $menu) {
    echo "  - Type: " . $menu['type'] . ", Language: " . $menu['language'] . ", Name: " . $menu['name'] . "\n";
}

// Create JWT token
$secretKey = getenv('JWT_SECRET') ?: 'your-secret-key';

$header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
$payload = json_encode(['sub' => $userId, 'email' => $user['email'], 'iat' => time(), 'exp' => time() + 3600]);

$headerEncoded = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
$payloadEncoded = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

$signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secretKey, true);
$signatureEncoded = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

$token = $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;

echo "\n=== API TEST WITH JWT ===\n";
echo "User ID: " . $userId . "\n";
echo "Website ID: " . $websiteId . "\n";
echo "Token: " . substr($token, 0, 20) . "...\n\n";

// Test the API endpoint
$url = "http://localhost:8000/api/menus?website_id=" . $websiteId . "&language=en";
echo "Testing: GET " . $url . "\n\n";

$context = stream_context_create([
    'http' => [
        'header' => 'Authorization: Bearer ' . $token,
        'method' => 'GET'
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    echo "ERROR: Could not connect to API\n";
    print_r($http_response_header ?? []);
} else {
    echo "Response:\n";
    echo $response . "\n";
}
?>
