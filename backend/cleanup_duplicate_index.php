<?php
// Drop duplicate unique index on pages table
require_once __DIR__ . '/config.php';

echo "🧹 Removing duplicate unique index...\n\n";

try {
    $pdo = getPDO();

    // Check what indexes exist
    $stmt = $pdo->query("
        SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_NAME = 'pages'
        AND INDEX_NAME LIKE 'unique%'
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
    ");
    
    $indexes = $stmt->fetchAll();
    
    echo "📋 Current unique indexes on pages table:\n";
    foreach ($indexes as $idx) {
        echo "  • " . $idx['INDEX_NAME'] . " (" . $idx['COLUMN_NAME'] . ")\n";
    }
    
    echo "\n";
    
    // Check if unique_page_slug exists
    $stmt = $pdo->prepare("
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_NAME = 'pages' AND INDEX_NAME = 'unique_page_slug'
    ");
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "🗑️  Dropping duplicate index: unique_page_slug\n";
        $pdo->exec("ALTER TABLE pages DROP INDEX unique_page_slug");
        echo "✅ Dropped successfully\n";
    } else {
        echo "✅ No duplicate index found\n";
    }
    
    echo "\n📋 Remaining unique indexes:\n";
    $stmt = $pdo->query("
        SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_NAME = 'pages'
        AND INDEX_NAME LIKE 'unique%'
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
    ");
    
    foreach ($stmt->fetchAll() as $idx) {
        echo "  • " . $idx['INDEX_NAME'] . " (" . $idx['COLUMN_NAME'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
