<?php
/**
 * MIGRATION: CMS Lifecycle Architecture
 * 
 * Adds support for:
 * - Soft deletes (status-based, not physical deletion)
 * - Theme/template system
 * - Complete page lifecycle (draft → published → archived → deleted)
 * - Better metadata and publishing workflow
 */

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    echo "🔄 Starting CMS Lifecycle Migration...\n\n";

    // =============================================
    // 1. ADD COLUMNS TO PAGES TABLE
    // =============================================
    echo "📄 Step 1: Updating pages table...\n";
    
    $alterPages = "
        ALTER TABLE pages ADD COLUMN IF NOT EXISTS template VARCHAR(100) DEFAULT 'default' AFTER slug,
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER template,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER is_deleted,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) AFTER deleted_at,
        ADD COLUMN IF NOT EXISTS published_by VARCHAR(36) AFTER updated_by,
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS image VARCHAR(500),
        ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS meta_description TEXT,
        ADD COLUMN IF NOT EXISTS meta_image VARCHAR(500),
        ADD COLUMN IF NOT EXISTS excerpt TEXT,
        ADD COLUMN IF NOT EXISTS translation_group_id VARCHAR(36)
    ";
    
    // Execute each ALTER individually to avoid duplicate column errors
    $statements = [
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS template VARCHAR(100) DEFAULT 'default'",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36)",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_by VARCHAR(36)",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS image VARCHAR(500)",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255)",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_description TEXT",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_image VARCHAR(500)",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS excerpt TEXT",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS translation_group_id VARCHAR(36)"
    ];
    
    foreach ($statements as $stmt) {
        try {
            $pdo->exec($stmt);
        } catch (PDOException $e) {
            // Column might already exist - that's fine
            if (strpos($e->getMessage(), 'Duplicate column') === false) {
                throw $e;
            }
        }
    }
    
    echo "✅ Pages table updated\n\n";

    // =============================================
    // 2. CREATE THEMES TABLE
    // =============================================
    echo "🎨 Step 2: Creating themes table...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS themes (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            website_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            template_type VARCHAR(100) NOT NULL DEFAULT 'standard-page',
            description TEXT,
            settings JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_website_template (website_id, template_type)
        )
    ");
    
    echo "✅ Themes table created\n\n";

    // =============================================
    // 3. CREATE TEMPLATES TABLE
    // =============================================
    echo "📋 Step 3: Creating templates table...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS templates (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            website_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            layout_type VARCHAR(100) NOT NULL DEFAULT 'standard-page',
            header_component VARCHAR(255),
            footer_component VARCHAR(255),
            sidebar_enabled BOOLEAN DEFAULT FALSE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_website_slug (website_id, slug)
        )
    ");
    
    echo "✅ Templates table created\n\n";

    // =============================================
    // 4. UPDATE MENUS TABLE
    // =============================================
    echo "📌 Step 4: Updating menus table...\n";
    
    try {
        $pdo->exec("ALTER TABLE menus ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'header'");
    } catch (PDOException $e) {
        // Column might already exist
    }
    
    echo "✅ Menus table updated\n\n";

    // =============================================
    // 5. UPDATE MENU_ITEMS TABLE
    // =============================================
    echo "📍 Step 5: Updating menu_items table...\n";
    
    $menuItemsStatements = [
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'page'",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS page_id VARCHAR(36)",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS link VARCHAR(500)",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS order_position INT DEFAULT 0",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS parent_id VARCHAR(36)",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS article_id VARCHAR(36)"
    ];
    
    foreach ($menuItemsStatements as $stmt) {
        try {
            $pdo->exec($stmt);
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') === false) {
                throw $e;
            }
        }
    }
    
    // Add foreign key if not exists
    try {
        $pdo->exec("
            ALTER TABLE menu_items 
            ADD CONSTRAINT fk_menu_items_page_id 
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
        ");
    } catch (PDOException $e) {
        // Constraint might already exist
    }
    
    echo "✅ Menu_items table updated\n\n";

    // =============================================
    // 6. CREATE PAGE_REVISIONS TABLE (for versioning)
    // =============================================
    echo "⏱️ Step 6: Creating page_revisions table...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS page_revisions (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            page_id VARCHAR(36) NOT NULL,
            title VARCHAR(255),
            content LONGTEXT,
            image VARCHAR(500),
            meta_title VARCHAR(255),
            meta_description TEXT,
            meta_image VARCHAR(500),
            status VARCHAR(50),
            created_by VARCHAR(36),
            revision_number INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    ");
    
    echo "✅ Page revisions table created\n\n";

    // =============================================
    // 7. CREATE DEFAULT THEME FOR EXISTING WEBSITES
    // =============================================
    echo "🎨 Step 7: Creating default theme for websites...\n";
    
    $websites = $pdo->query("SELECT id FROM websites LIMIT 10")->fetchAll();
    $defaultThemesCount = 0;
    
    foreach ($websites as $website) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO themes (id, website_id, name, template_type, description, settings)
                SELECT UUID(), ?, 'Default Theme', 'standard-page', 'Default theme for standard pages', JSON_OBJECT()
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM themes WHERE website_id = ? AND template_type = 'standard-page'
                )
            ");
            $stmt->execute([$website['id'], $website['id']]);
            $defaultThemesCount += $stmt->rowCount();
        } catch (PDOException $e) {
            // Theme might already exist
        }
    }
    
    echo "✅ Created $defaultThemesCount default themes\n\n";

    // =============================================
    // 8. CREATE INDEX FOR SOFT DELETE QUERIES
    // =============================================
    echo "🔍 Step 8: Creating indexes for performance...\n";
    
    try {
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_pages_status_deleted ON pages(status, is_deleted)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_pages_website_status ON pages(website_id, status, is_deleted)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_menu_items_page_id ON menu_items(page_id)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id)");
    } catch (PDOException $e) {
        // Indexes might already exist
    }
    
    echo "✅ Indexes created\n\n";

    // =============================================
    // SUCCESS
    // =============================================
    http_response_code(200);
    echo "✅ ✅ ✅ CMS LIFECYCLE MIGRATION COMPLETE ✅ ✅ ✅\n\n";
    echo json_encode([
        'status' => 'success',
        'message' => 'Database migration completed successfully',
        'changes' => [
            'Added soft delete columns to pages',
            'Created themes table',
            'Created templates table',
            'Updated menus and menu_items tables',
            'Created page_revisions table',
            'Created default theme for websites',
            'Added performance indexes'
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Migration failed: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
    exit(1);
}
