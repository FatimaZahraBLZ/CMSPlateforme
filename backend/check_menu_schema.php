<?php
require 'config.php';

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "=== MENUS TABLE SCHEMA ===\n";
    $result = $pdo->query('DESCRIBE menus');
    foreach ($result as $row) {
        echo $row['Field'] . " | " . $row['Type'] . " | " . $row['Null'] . " | " . $row['Key'] . "\n";
    }

    echo "\n=== MENU_ITEMS TABLE SCHEMA ===\n";
    $result = $pdo->query('DESCRIBE menu_items');
    foreach ($result as $row) {
        echo $row['Field'] . " | " . $row['Type'] . " | " . $row['Null'] . " | " . $row['Key'] . "\n";
    }

    echo "\n=== SAMPLE MENUS DATA ===\n";
    $result = $pdo->query('SELECT * FROM menus LIMIT 3');
    foreach ($result as $row) {
        echo json_encode($row) . "\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
