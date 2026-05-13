<?php
/**
 * Migration: Add button fields to menus table
 * Date: 2026-05-12
 * 
 * This migration adds support for optional buttons on menus.
 * Each menu can have a button that links to a page, custom URL, or phone number.
 */

require_once __DIR__ . '/../config.php';

try {
    $pdo = getPDO();
    
    // Check if columns already exist
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'menus' AND COLUMN_NAME = 'has_button'
    ");
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'info',
            'message' => 'Button fields already exist in menus table'
        ]);
        exit;
    }
    
    // Add button fields to menus table
    $alterTableSql = "
        ALTER TABLE menus ADD COLUMN (
            has_button BOOLEAN DEFAULT FALSE,
            button_label VARCHAR(255) DEFAULT NULL,
            button_type ENUM('page', 'link', 'phone') DEFAULT NULL,
            button_page_id CHAR(36) DEFAULT NULL,
            button_link VARCHAR(500) DEFAULT NULL,
            button_phone VARCHAR(20) DEFAULT NULL,
            button_color VARCHAR(50) DEFAULT 'primary'
        );
    ";
    
    $pdo->exec($alterTableSql);
    
    // Add foreign key constraint for button_page_id
    $fkSql = "
        ALTER TABLE menus 
        ADD CONSTRAINT fk_menus_button_page 
        FOREIGN KEY (button_page_id) REFERENCES pages(id) ON DELETE SET NULL
    ";
    
    try {
        $pdo->exec($fkSql);
    } catch (Exception $e) {
        // Foreign key might already exist, log but don't fail
        error_log('Warning: Could not add foreign key constraint: ' . $e->getMessage());
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Menu button fields added successfully'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
    http_response_code(500);
}
?>
