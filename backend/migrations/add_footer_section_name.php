<?php

/**
 * Migration: Add section_name field to menu_items for footer grouping
 * 
 * Allows footer menu items to be grouped by section:
 * - Company
 * - Services
 * - Legal
 * - Resources
 * etc.
 * 
 * This enables professional multi-column footers.
 */

require_once __DIR__ . '/../config.php';

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM menu_items LIKE 'section_name'");
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Column section_name already exists'
        ]);
        exit;
    }

    // Add section_name column
    $pdo->exec("
        ALTER TABLE menu_items
        ADD COLUMN section_name VARCHAR(255) NULL DEFAULT NULL
        COMMENT 'Optional: Groups footer items into sections (Company, Services, Legal, etc.)'
        AFTER label
    ");

    echo json_encode([
        'status' => 'success',
        'message' => 'Migration completed: Added section_name column to menu_items'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
