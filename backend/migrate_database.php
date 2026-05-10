<?php
// backend/migrate_database.php
// Migration script to add missing columns

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getPDO();
    $migrations = [];
    
    // Migration 1: Check if created_by column exists in websites table
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'websites' AND COLUMN_NAME = 'created_by'
    ");
    $stmt->execute([DB_NAME]);
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        // Add created_by column
        $pdo->exec("
            ALTER TABLE websites 
            ADD COLUMN created_by VARCHAR(36) AFTER theme,
            ADD CONSTRAINT fk_websites_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        ");
        $migrations[] = 'Added created_by column to websites table';
    }
    
    // Migration 2: Check if granted_by column exists in user_website_access table
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_website_access' AND COLUMN_NAME = 'granted_by'
    ");
    $stmt->execute([DB_NAME]);
    $grantedByExists = $stmt->fetch();
    
    if (!$grantedByExists) {
        // Add granted_by column
        $pdo->exec("
            ALTER TABLE user_website_access 
            ADD COLUMN granted_by VARCHAR(36) AFTER role,
            ADD CONSTRAINT fk_access_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
        ");
        $migrations[] = 'Added granted_by column to user_website_access table';
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => count($migrations) > 0 ? 'Database migrations completed' : 'Database is up to date',
        'migrations' => $migrations
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
?>
