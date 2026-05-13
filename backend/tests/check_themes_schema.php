<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=cms_platform;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

// Check themes table structure
$result = $pdo->query('DESCRIBE themes');
$columns = $result->fetchAll();
echo "=== THEMES TABLE STRUCTURE ===\n";
foreach ($columns as $col) {
    echo "{$col['Field']}: {$col['Type']} (Null: {$col['Null']}, Key: {$col['Key']})\n";
}

// Check if all required columns exist
$requiredColumns = ['id', 'website_id', 'name', 'version', 'template_type', 'description', 'settings', 'created_at', 'updated_at'];
$existingColumns = array_column($columns, 'Field');
$missing = array_diff($requiredColumns, $existingColumns);

if ($missing) {
    echo "\n⚠️ MISSING COLUMNS: " . implode(', ', $missing) . "\n";
} else {
    echo "\n✅ All required columns present\n";
}

// Check for empty IDs
$emptyIds = $pdo->query("SELECT COUNT(*) as count FROM themes WHERE id = '' OR id IS NULL")->fetch();
if ($emptyIds['count'] > 0) {
    echo "⚠️ Found {$emptyIds['count']} themes with empty/null IDs\n";
}
?>
