<?php
require_once 'config.php';
$pdo = getPDO();
$stmt = $pdo->query('SELECT id, name, subdomain, status FROM websites');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['id'] . ': ' . $row['name'] . ' (' . $row['subdomain'] . ') - Status: ' . $row['status'] . "\n";
}
?>