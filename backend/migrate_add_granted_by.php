<?php
// backend/migrate_add_granted_by.php
// Adds missing granted_by column to user_website_access table

require_once __DIR__ . '/config.php';

try {
    $pdo = getPDO();
    
    // Check if granted_by column already exists
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'user_website_access' 
        AND COLUMN_NAME = 'granted_by'
    ");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'granted_by column already exists'
        ]);
        exit;
    }
    
    // Add granted_by column
    $pdo->exec("
        ALTER TABLE user_website_access 
        ADD COLUMN granted_by VARCHAR(36) AFTER role,
        ADD CONSTRAINT fk_access_granted_by 
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
    ");
    
    echo json_encode([
        'status' => 'success',
        'message' => 'granted_by column added successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
