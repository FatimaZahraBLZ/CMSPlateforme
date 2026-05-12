<?php
require 'config.php';

// Connect to DB
$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$targetWebsiteId = '0e2fed92-0cda-470b-a375-8ae56816390f';

echo "=== CHECKING MENUS FOR WEBSITE: " . $targetWebsiteId . " ===\n";
$stmt = $pdo->prepare('SELECT id, type, language, name FROM menus WHERE website_id = ?');
$stmt->execute([$targetWebsiteId]);
$menus = $stmt->fetchAll();

if (empty($menus)) {
    echo "NO MENUS FOUND FOR THIS WEBSITE!\n";
    echo "\nThis is the problem. The website has no menus at all.\n";
} else {
    echo "Found " . count($menus) . " menus:\n";
    foreach ($menus as $menu) {
        echo "  - Type: " . $menu['type'] . ", Language: " . $menu['language'] . ", Name: " . $menu['name'] . "\n";
    }
}

echo "\n=== ALL WEBSITES IN DATABASE ===\n";
$stmt = $pdo->query('SELECT id, domain, name FROM websites LIMIT 5');
$websites = $stmt->fetchAll();
foreach ($websites as $w) {
    echo "ID: " . $w['id'] . " | Domain: " . $w['domain'] . " | Name: " . $w['name'] . "\n";
}

// Check if the target website even exists
echo "\n=== CHECKING IF TARGET WEBSITE EXISTS ===\n";
$stmt = $pdo->prepare('SELECT id, domain, name FROM websites WHERE id = ?');
$stmt->execute([$targetWebsiteId]);
$website = $stmt->fetch();

if (!$website) {
    echo "Website ID NOT FOUND in database!\n";
    echo "The user might be trying to access a website that doesn't exist.\n";
} else {
    echo "Website found: " . $website['name'] . " (" . $website['domain'] . ")\n";
}
?>
