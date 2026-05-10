<?php
// backend/migrate_add_language_to_pages.php
// Adds language column to pages table

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    echo "🔧 Starting pages language migration...\n\n";

    // Step 1: Check if language column exists
    echo "📝 Step 1: Checking if language column exists...\n";

    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pages' AND COLUMN_NAME = 'language'
    ");
    $stmt->execute();
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        echo "📝 Adding language column...\n";
        $pdo->exec("
            ALTER TABLE pages
            ADD COLUMN language VARCHAR(10) DEFAULT 'en' AFTER content
        ");
        echo "✅ Language column added\n";

        // Update unique key
        echo "📝 Updating unique key...\n";
        try {
            $pdo->exec("DROP INDEX unique_website_slug ON pages");
        } catch (Exception $e) {
            // Index might not exist, continue
        }

        $pdo->exec("
            ALTER TABLE pages
            ADD UNIQUE KEY unique_website_slug_language (website_id, slug, language)
        ");
        echo "✅ Unique key updated\n";

        // Set default language for existing pages
        echo "📝 Setting default language for existing pages...\n";
        $pdo->exec("
            UPDATE pages SET language = 'en' WHERE language IS NULL OR language = ''
        ");
        echo "✅ Default language set\n";

    } else {
        echo "ℹ️  Language column already exists\n";
    }

    echo "\n✅ Migration completed successfully!\n";

} catch (PDOException $e) {
    echo "\n❌ Migration error: " . $e->getMessage() . "\n";
    exit(1);
}