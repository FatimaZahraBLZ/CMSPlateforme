<?php
require_once __DIR__ . '/config.php';
$pdo = getPDO();

$stmt = $pdo->query('SELECT website_id, slug, language, COUNT(*) as cnt FROM pages GROUP BY website_id, slug, language ORDER BY cnt DESC');
echo "Current pages by website/slug/language:\n\n";
foreach ($stmt->fetchAll() as $row) {
    echo $row['website_id'] . " | " . $row['slug'] . " | " . $row['language'] . " => " . $row['cnt'] . " pages\n";
}

echo "\n\nAll pages:\n";
$stmt = $pdo->query('SELECT id, website_id, slug, language, title, status FROM pages ORDER BY website_id, slug, language, created_at DESC');
foreach ($stmt->fetchAll() as $row) {
    echo $row['id'] . " | " . $row['website_id'] . " | " . $row['slug'] . " | " . $row['language'] . " | " . $row['title'] . " | " . $row['status'] . "\n";
}
