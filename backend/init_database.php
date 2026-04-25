<?php
// backend/init_database.php
// This script initializes the database and creates necessary tables

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getPDO();
    
    // Test connection
    $pdo->query('SELECT 1');
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'database' => DB_NAME
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'details' => $e->getMessage()
    ]);
}
?>
