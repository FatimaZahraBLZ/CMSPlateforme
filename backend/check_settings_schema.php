<?php
require_once __DIR__ . '/config.php';

$pdo = getPDO();

echo "=== WEBSITE_SETTINGS TABLE STRUCTURE ===\n";
try {
    $stmt = $pdo->query('DESCRIBE website_settings');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Table does not exist: " . $e->getMessage();
}
?>
