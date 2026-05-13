<?php
/**
 * Seed themes and templates for testing
 * This ensures the Theme system has data to work with
 */

require_once __DIR__ . '/config.php';

$pdo = getPDO();

echo "=== SEEDING THEMES & TEMPLATES ===\n\n";

// Get all websites
$stmt = $pdo->query("SELECT id, name FROM websites");
$websites = $stmt->fetchAll();

if (empty($websites)) {
    echo "❌ No websites found. Please create a website first.\n";
    exit(1);
}

echo "Found " . count($websites) . " website(s). Seeding themes...\n\n";

foreach ($websites as $website) {
    $websiteId = $website['id'];
    $websiteName = $website['name'];

    // Check if themes already exist
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM themes WHERE website_id = ?");
    $stmt->execute([$websiteId]);
    $existing = $stmt->fetch();

    if ($existing['count'] > 0) {
        echo "⏭️  {$websiteName}: Already has " . $existing['count'] . " theme(s)\n";
        continue;
    }

    // Create default theme
    $themeId = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $defaultSettings = json_encode([
        'header' => true,
        'footer' => true,
        'sidebar' => false,
        'breadcrumbs' => true,
        'metadata' => true,
        'featured_image' => true,
        'sections' => ['content']
    ]);

    $stmt = $pdo->prepare("
        INSERT INTO themes (
            id,
            website_id,
            name,
            version,
            template_type,
            description,
            settings,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    try {
        $stmt->execute([
            $themeId,
            $websiteId,
            'Default',
            '1.0.0',
            'default',
            'Default theme for standard pages',
            $defaultSettings
        ]);
        echo "✅ {$websiteName}: Created default theme\n";
    } catch (Exception $e) {
        echo "❌ {$websiteName}: " . $e->getMessage() . "\n";
        continue;
    }

    // Create default template
    $templateId = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $stmt = $pdo->prepare("
        INSERT INTO templates (
            id,
            website_id,
            name,
            slug,
            layout_type,
            description,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    try {
        $stmt->execute([
            $templateId,
            $websiteId,
            'Standard Page',
            'standard-page',
            'standard-page',
            'Standard page layout with header, content, and footer',
        ]);
        echo "✅ {$websiteName}: Created standard page template\n";
    } catch (Exception $e) {
        echo "❌ {$websiteName}: " . $e->getMessage() . "\n";
    }
}

echo "\n=== SEEDING COMPLETE ===\n";
echo "Themes and templates are now ready.\n";
echo "Run 'php test_integration.php' to verify.\n";
?>
