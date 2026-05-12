<?php
require 'config.php';

$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$websiteId = '0e2fed92-0cda-470b-a375-8ae56816390f';

// Create header menus for all languages that have footer menus
$stmt = $pdo->prepare('SELECT DISTINCT language FROM menus WHERE website_id = ?');
$stmt->execute([$websiteId]);
$languages = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Creating missing header menus for website: " . $websiteId . "\n";
echo "Languages found: " . implode(', ', $languages) . "\n\n";

foreach ($languages as $lang) {
    // Check if header menu already exists
    $check = $pdo->prepare('SELECT id FROM menus WHERE website_id = ? AND type = ? AND language = ?');
    $check->execute([$websiteId, 'header', $lang]);
    
    if (!$check->fetch()) {
        // Create header menu
        $insert = $pdo->prepare('INSERT INTO menus (id, website_id, type, language, name) VALUES (UUID(), ?, ?, ?, ?)');
        $insert->execute([$websiteId, 'header', $lang, 'Main Header Menu']);
        echo "✓ Created header menu for language: " . $lang . "\n";
    } else {
        echo "- Header menu already exists for language: " . $lang . "\n";
    }
}

echo "\nDone!\n";
?>
