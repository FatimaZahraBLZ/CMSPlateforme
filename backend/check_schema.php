<?php
require_once __DIR__ . '/config.php';

$pdo = getPDO();

echo "=== MENUS TABLE STRUCTURE ===\n";
$stmt = $pdo->query('DESCRIBE menus');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($columns, JSON_PRETTY_PRINT) . "\n\n";

echo "=== MENU_ITEMS TABLE STRUCTURE ===\n";
$stmt = $pdo->query('DESCRIBE menu_items');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($columns, JSON_PRETTY_PRINT);
?>
