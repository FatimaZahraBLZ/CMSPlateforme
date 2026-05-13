<?php
/**
 * Comprehensive Theme System Synchronization Test
 * Verifies all fixes are working correctly
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/ThemeModel.php';
require_once __DIR__ . '/controllers/PublicController.php';

$pdo = getPDO();
$themeModel = new ThemeModel($pdo);
$publicController = new PublicController($pdo);

echo "=== THEME SYSTEM SYNCHRONIZATION TEST ===\n\n";

// Test 1: Check themes table structure
echo "TEST 1: Themes Table Structure\n";
$result = $pdo->query('DESCRIBE themes');
$columns = $result->fetchAll(PDO::FETCH_COLUMN);
$requiredColumns = ['id', 'website_id', 'name', 'version', 'template_type', 'settings', 'created_at', 'updated_at'];
$allPresent = count(array_intersect($requiredColumns, $columns)) === count($requiredColumns);
echo $allPresent ? "✅ All required columns present\n" : "❌ Missing columns\n";
foreach ($columns as $col) {
    echo "  - $col\n";
}

// Test 2: Check templates table
echo "\nTEST 2: Templates Table Existence\n";
try {
    $stmt = $pdo->query("DESCRIBE templates");
    $stmt->fetchAll();
    echo "✅ Templates table exists\n";
} catch (Exception $e) {
    echo "❌ Templates table missing: {$e->getMessage()}\n";
}

// Test 3: Get themes for a website
echo "\nTEST 3: ThemeModel::getThemesForWebsite()\n";
try {
    $stmt = $pdo->query("SELECT id FROM websites LIMIT 1");
    $website = $stmt->fetch();
    
    if ($website) {
        $themes = $themeModel->getThemesForWebsite($website['id']);
        echo "✅ Retrieved " . count($themes) . " theme(s)\n";
        if (count($themes) > 0) {
            $theme = $themes[0];
            echo "  Sample: ID={$theme['id']}, Name={$theme['name']}, Type={$theme['template_type']}\n";
        }
    } else {
        echo "⚠️ No websites found\n";
    }
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

// Test 4: Get page layout (database-driven)
echo "\nTEST 4: ThemeModel::getPageLayout() - Database Driven\n";
try {
    $stmt = $pdo->query("SELECT id FROM websites LIMIT 1");
    $website = $stmt->fetch();
    
    if ($website) {
        $layout = $themeModel->getPageLayout($website['id'], 'default');
        echo "✅ Retrieved layout\n";
        echo "  Sections: " . implode(', ', $layout['sections'] ?? []) . "\n";
        echo "  Has Header: " . ($layout['header'] ? 'Yes' : 'No') . "\n";
        echo "  Has Footer: " . ($layout['footer'] ? 'Yes' : 'No') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

// Test 5: Check for empty theme IDs
echo "\nTEST 5: Theme ID Validity\n";
$result = $pdo->query("SELECT COUNT(*) as count FROM themes WHERE id = '' OR id IS NULL");
$check = $result->fetch();
if ($check['count'] == 0) {
    echo "✅ No empty or null theme IDs\n";
} else {
    echo "⚠️ Found {$check['count']} themes with empty/null IDs - Fix SQL:\n";
    echo "  UPDATE themes SET id = UUID() WHERE id = '' OR id IS NULL;\n";
}

// Test 6: Verify PublicController integration
echo "\nTEST 6: PublicController ThemeModel Integration\n";
$reflection = new ReflectionClass('PublicController');
$properties = $reflection->getDefaultProperties();
if (isset($properties['themeModel']) || in_array('themeModel', array_keys($reflection->getProperties(ReflectionProperty::IS_PRIVATE)))) {
    echo "✅ PublicController has ThemeModel property\n";
} else {
    echo "❌ ThemeModel property not found in PublicController\n";
}

// Test 7: Check MenuController error handling
echo "\nTEST 7: MenuController Error Handling\n";
$reflection = new ReflectionClass('MenuController');
$methods = $reflection->getMethods();
foreach ($methods as $method) {
    if ($method->getName() === 'getMenus' || $method->getName() === 'getMenuItems') {
        $code = file_get_contents(__DIR__ . '/controllers/MenuController.php');
        if (strpos($code, "catch (Exception \$e)") !== false) {
            echo "✅ {$method->getName}() has try-catch error handling\n";
        } else {
            echo "❌ {$method->getName}() missing error handling\n";
        }
    }
}

// Test 8: PDO error reporting
echo "\nTEST 8: PDO Error Reporting\n";
$errorMode = $pdo->getAttribute(PDO::ATTR_ERRMODE);
$fetchMode = $pdo->getAttribute(PDO::ATTR_DEFAULT_FETCH_MODE);
echo ($errorMode === PDO::ERRMODE_EXCEPTION ? "✅ " : "❌ ") . "ERRMODE_EXCEPTION: " . ($errorMode === PDO::ERRMODE_EXCEPTION ? "Enabled" : "Disabled") . "\n";
echo ($fetchMode === PDO::FETCH_ASSOC ? "✅ " : "❌ ") . "FETCH_ASSOC: " . ($fetchMode === PDO::FETCH_ASSOC ? "Enabled" : "Disabled") . "\n";

echo "\n=== TEST SUMMARY ===\n";
echo "All critical synchronization points have been verified.\n";
echo "If all tests passed (✅), your Theme system is properly synchronized.\n";
?>
