<?php
require_once 'config.php';
$pdo = getPDO();
$stmt = $pdo->query('SELECT id, title, slug, status FROM pages WHERE website_id = "2193fe79-cdf2-46ce-a83b-1cf78623e472"');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['id'] . ': ' . $row['title'] . ' (' . $row['slug'] . ') - Status: ' . $row['status'] . "\n";
}
?>