<?php
require 'config.php';

// Connect to DB
$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get a valid user
$stmt = $pdo->query('SELECT id, email FROM users LIMIT 1');
$user = $stmt->fetch();

if (!$user) {
    echo "No users found in database\n";
    exit(1);
}

echo "Testing with user: " . $user['email'] . "\n\n";

// Get a website
$stmt = $pdo->query('SELECT id FROM websites LIMIT 1');
$website = $stmt->fetch();

if (!$website) {
    echo "No websites found in database\n";
    exit(1);
}

$websiteId = $website['id'];
echo "Testing with website: " . $websiteId . "\n";

// Get menus for this website
echo "\n=== FETCHING MENUS DIRECTLY ===\n";
try {
    $stmt = $pdo->prepare('SELECT id, website_id, type, language, name FROM menus WHERE website_id = ?');
    $stmt->execute([$websiteId]);
    $menus = $stmt->fetchAll();
    echo "Menus found: " . count($menus) . "\n";
    foreach ($menus as $menu) {
        echo json_encode($menu) . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// Try to call the API endpoint
echo "\n=== TESTING API ENDPOINT ===\n";
echo "GET /api/menus?website_id=" . $websiteId . "&language=en\n";

// Simulate the API call
try {
    $menus = [];
    $sql = 'SELECT id, website_id, type, language, name FROM menus WHERE website_id = ?';
    $params = [$websiteId];
    $sql .= ' AND language = ?';
    $params[] = 'en';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $menus = $stmt->fetchAll() ?: [];
    
    echo "API Response: " . json_encode(['status' => 'success', 'menus' => $menus]) . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
