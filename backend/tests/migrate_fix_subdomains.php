<?php
// backend/migrate_fix_subdomains.php
// Adds subdomain column to websites table and populates it from domain

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    echo "🔧 Starting subdomain migration...\n\n";

    // Step 1: Check if subdomain column exists
    echo "📝 Step 1: Checking if subdomain column exists...\n";
    
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'websites' AND COLUMN_NAME = 'subdomain'
    ");
    $dbName = getenv('DB_NAME') ?? 'cms_platform';
    echo "Checking in database: $dbName\n";
    $stmt->execute([$dbName]);
    $columnExists = $stmt->fetch();
    echo "Column exists result: " . ($columnExists ? 'YES' : 'NO') . "\n";

    if (!$columnExists) {
        echo "📝 Adding subdomain column...\n";
        $pdo->exec("
            ALTER TABLE websites
            ADD COLUMN subdomain VARCHAR(255) NOT NULL AFTER name
        ");
        echo "✅ Subdomain column added\n";
    } else {
        echo "ℹ️  Subdomain column already exists\n";
    }

    // Step 2: Populate empty subdomains from domain
    echo "\n📝 Step 2: Populating empty subdomains from domain...\n";
    
    $stmt = $pdo->prepare("
        SELECT id, domain, subdomain FROM websites WHERE subdomain IS NULL OR subdomain = ''
    ");
    $stmt->execute();
    $websites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($websites) . " websites with empty subdomains\n";

    foreach ($websites as $website) {
        // Extract subdomain from domain (everything before first dot)
        $subdomain = explode('.', $website['domain'])[0];
        
        $updateStmt = $pdo->prepare("UPDATE websites SET subdomain = ? WHERE id = ?");
        $updateStmt->execute([$subdomain, $website['id']]);
        echo "  ✓ Updated: {$website['domain']} → subdomain: {$subdomain}\n";
    }

    if (empty($websites)) {
        echo "  ℹ️  No websites with empty subdomains found\n";
    }

    // Step 3: Verify the fixes
    echo "\n📊 Verification:\n";
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count FROM websites WHERE subdomain IS NULL OR subdomain = ''
    ");
    $stmt->execute();
    $emptyCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  • Websites with empty subdomains: $emptyCount\n";

    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count FROM websites
    ");
    $stmt->execute();
    $totalCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  • Total websites: $totalCount\n";

    echo "\n✅ Subdomain migration completed successfully!\n";
    echo "\n🎯 Next steps:\n";
    echo "1. Test creating a new website with domain 'mysite.cms'\n";
    echo "2. Subdomain should auto-fill as 'mysite'\n";
    echo "3. Test updating a website's domain\n";
    echo "4. Subdomain should auto-update\n";

} catch (Exception $e) {
    error_log('Subdomain migration error: ' . $e->getMessage());
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
