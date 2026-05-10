<?php
// backend/migrations/add_domain_unique_constraint.php

require_once __DIR__ . '/../config.php';

echo "🔧 Adding UNIQUE constraint to domain column...\n\n";

try {
    $pdo = getPDO();

    // Check if constraint already exists
    $stmt = $pdo->prepare("
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'websites' AND COLUMN_NAME = 'domain' AND CONSTRAINT_NAME LIKE 'UNIQUE%'
    ");
    $stmt->execute();
    $existing = $stmt->fetch();

    if ($existing) {
        echo "✅ UNIQUE constraint already exists: " . $existing['CONSTRAINT_NAME'] . "\n";
        exit(0);
    }

    // Check if domain column has duplicate values
    $stmt = $pdo->query("
        SELECT domain, COUNT(*) as cnt FROM websites 
        WHERE domain IS NOT NULL AND domain != '' 
        GROUP BY domain HAVING cnt > 1
    ");
    $duplicates = $stmt->fetchAll();

    if (!empty($duplicates)) {
        echo "⚠️  Found duplicate domains:\n";
        foreach ($duplicates as $dup) {
            echo "   - '" . $dup['domain'] . "' appears " . $dup['cnt'] . " times\n";
        }
        echo "\n❌ Cannot add UNIQUE constraint until duplicates are removed.\n";
        echo "   Please manually delete duplicate websites or update their domains.\n";
        exit(1);
    }

    // Add UNIQUE constraint
    $pdo->exec("
        ALTER TABLE websites 
        ADD CONSTRAINT unique_domain UNIQUE (domain)
    ");

    echo "✅ UNIQUE constraint added to domain column\n";
    echo "✅ Domain values must now be unique across all websites\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
