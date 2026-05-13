<?php
// backend/setup_database.php

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    // Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            avatar VARCHAR(500),
            last_login_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");

    // Create websites table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS websites (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            subdomain VARCHAR(255),
            client VARCHAR(255),
            domain VARCHAR(255),
            status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
            default_language VARCHAR(10) DEFAULT 'en',
            languages JSON,
            theme ENUM('minimal', 'business', 'blog') DEFAULT 'minimal',
            created_by VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    ");

    // Create user_website_access table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_website_access (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            user_id VARCHAR(36) NOT NULL,
            website_id VARCHAR(36) NOT NULL,
            role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
            granted_by VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
            FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE KEY unique_user_website (user_id, website_id)
        )
    ");

    // Create pages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            website_id VARCHAR(36) NOT NULL,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            content LONGTEXT,
            language VARCHAR(10) DEFAULT 'en',
            status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
            is_homepage BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_website_slug_language (website_id, slug, language)
        )
    ");

    // Create menus table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS menus (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            website_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
        )
    ");

    // Create menu_items table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS menu_items (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            menu_id VARCHAR(36) NOT NULL,
            title VARCHAR(255) NOT NULL,
            url VARCHAR(500) NOT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
        )
    ");

    // Create website_settings table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS website_settings (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            website_id VARCHAR(36) NOT NULL,
            setting_key VARCHAR(255) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_website_setting (website_id, setting_key)
        )
    ");

    // Create activity_logs table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36),
            user_name VARCHAR(255),
            action VARCHAR(100) NOT NULL,
            target_type VARCHAR(100),
            target_id VARCHAR(36),
            target_name VARCHAR(255),
            details TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ");

    // Create sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    echo json_encode([
        'status' => 'success',
        'message' => 'Database schema created successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database setup failed: ' . $e->getMessage()
    ]);
}