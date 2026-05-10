<?php
// backend/models/WebsiteModel.php

class WebsiteModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function createWebsite(array $websiteData, string $userId): string
    {
        $this->pdo->beginTransaction();

        try {
            // Generate UUID for website ID
            $websiteId = $this->generateUuid();

            // Extract subdomain from domain
            $subdomain = $this->extractSubdomain($websiteData['domain']);

            // Insert website
            $stmt = $this->pdo->prepare(
                'INSERT INTO websites (id, name, subdomain, client, domain, status, default_language, languages, theme, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );

            $languagesJson = json_encode($websiteData['languages']);

            $stmt->execute([
                $websiteId,
                $websiteData['name'],
                $subdomain,
                $websiteData['client'],
                $websiteData['domain'],
                $websiteData['status'],
                $websiteData['defaultLanguage'],
                $languagesJson,
                $websiteData['theme'],
                $userId
            ]);

            // Grant access to creator using their global role
            $this->grantAccessToWebsite($userId, $websiteId, $userId);

            $this->pdo->commit();
            return $websiteId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log('Website creation error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function extractSubdomain(string $domain): string
    {
        // Extract everything before the first dot
        // e.g., "testedit.cms" → "testedit"
        // e.g., "sub.example.com" → "sub"
        $parts = explode('.', trim($domain));
        return $parts[0] ?? '';
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }

    public function createDefaultPage(string $websiteId, array $pageData): void
    {
        try {
            error_log("WebsiteModel.createDefaultPage - Inserting page: " . json_encode($pageData));
            
            // Note: Database table uses 'created_by', 'updated_by' instead of direct insert
            // Get system user ID or use a default
            $systemUserId = '00000000-0000-0000-0000-000000000001'; // Super Admin UUID
            
            $stmt = $this->pdo->prepare(
                'INSERT INTO pages (id, website_id, title, slug, content, language, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );

            $pageId = $this->generateUuid();
            
            $success = $stmt->execute([
                $pageId,
                $websiteId,
                $pageData['title'],
                $pageData['slug'],
                $pageData['content'],
                $pageData['language'] ?? 'en',
                $pageData['status'],
                $systemUserId
            ]);
            
            if ($success) {
                error_log("Successfully inserted page with ID: $pageId");
            } else {
                error_log("Failed to execute INSERT statement");
                $errorInfo = $stmt->errorInfo();
                error_log("SQL Error: " . json_encode($errorInfo));
            }
        } catch (Exception $e) {
            error_log("Exception in createDefaultPage: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function createDefaultMenu(string $websiteId, string $menuName, array $menuItems, string $language): void
    {
        try {
            error_log("Creating default menu for website: $websiteId, language: $language");
            
            // Create menu with 'type' = 'header' as default
            $stmt = $this->pdo->prepare(
                'INSERT INTO menus (id, website_id, type, language, name)
                 VALUES (?, ?, ?, ?, ?)'
            );
            $menuId = $this->generateUuid();
            $stmt->execute([$menuId, $websiteId, 'header', $language, $menuName]);
            error_log("Menu created with ID: $menuId");

            // Create menu items
            $stmt = $this->pdo->prepare(
                'INSERT INTO menu_items (id, menu_id, label, type, link, order_position)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );

            foreach ($menuItems as $index => $item) {
                try {
                    $itemId = $this->generateUuid();
                    // Use 'custom' type since we're not linking to pages
                    $stmt->execute([
                        $itemId, 
                        $menuId, 
                        $item['title'],
                        'custom',
                        $item['url'],
                        $item['order']
                    ]);
                    error_log("Menu item created: " . $item['title']);
                } catch (Exception $e) {
                    error_log("Error creating menu item: " . $e->getMessage());
                    // Don't fail the menu creation
                }
            }
            error_log("Default menu created successfully");
        } catch (Exception $e) {
            error_log("Error creating default menu: " . $e->getMessage());
            throw $e;
        }
    }

    public function createDefaultSetting(string $websiteId, string $key, string $value): void
    {
        try {
            error_log("Creating setting for website: $websiteId, key: $key");
            // Note: website_settings table might not exist or might have different structure
            // Check if table exists first
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as count
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'website_settings'
            ");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] == 0) {
                error_log("website_settings table does not exist, skipping settings creation");
                return;
            }
            
            // Try to insert, but don't fail if it doesn't work
            try {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO website_settings (id, website_id, setting_key, setting_value)
                     VALUES (?, ?, ?, ?)'
                );
                $settingId = $this->generateUuid();
                $stmt->execute([$settingId, $websiteId, $key, $value]);
            } catch (Exception $e) {
                error_log("Could not create setting with expected columns, trying alternative structure");
            }
        } catch (Exception $e) {
            error_log("Error in createDefaultSetting: " . $e->getMessage());
            // Don't fail the website creation
        }
    }

    public function getWebsitesForUser(string $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT w.id, w.name, w.subdomain, w.client, w.domain, w.status, w.default_language, w.languages, w.theme, w.created_at, w.updated_at, uwa.role
             FROM user_website_access uwa
             INNER JOIN websites w ON uwa.website_id = w.id
             WHERE uwa.user_id = ?
             ORDER BY w.created_at DESC'
        );

        $stmt->execute([$userId]);
        $websites = $stmt->fetchAll();

        // Decode JSON languages field
        foreach ($websites as &$website) {
            if ($website['languages']) {
                $website['languages'] = json_decode($website['languages'], true);
            } else {
                $website['languages'] = ['en'];
            }
        }

        return $websites;
    }

    public function getWebsiteById(string $websiteId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, subdomain, client, domain, status, default_language, languages, theme, created_by, created_at, updated_at
             FROM websites
             WHERE id = ?'
        );

        $stmt->execute([$websiteId]);
        $website = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($website && $website['languages']) {
            $website['languages'] = json_decode($website['languages'], true);
        }

        return $website ?: null;
    }

    public function updateWebsite(string $websiteId, array $updateData): bool
    {
        // Extract subdomain from domain if domain is being updated
        $subdomain = isset($updateData['domain']) ? $this->extractSubdomain($updateData['domain']) : null;

        $stmt = $this->pdo->prepare(
            'UPDATE websites
             SET name = ?, subdomain = ?, client = ?, domain = ?, theme = ?, updated_at = NOW()
             WHERE id = ?'
        );

        return $stmt->execute([
            $updateData['name'],
            $subdomain,
            $updateData['client'],
            $updateData['domain'],
            $updateData['theme'],
            $websiteId
        ]);
    }

    public function deleteWebsite(string $websiteId): bool
    {
        $this->pdo->beginTransaction();

        try {
            // Delete related data first (cascade delete)
            // Delete user website access
            $stmt = $this->pdo->prepare('DELETE FROM user_website_access WHERE website_id = ?');
            $stmt->execute([$websiteId]);

            // Delete pages
            $stmt = $this->pdo->prepare('DELETE FROM pages WHERE website_id = ?');
            $stmt->execute([$websiteId]);

            // Delete menus
            $stmt = $this->pdo->prepare('DELETE FROM menu_items WHERE menu_id IN (SELECT id FROM menus WHERE website_id = ?)');
            $stmt->execute([$websiteId]);

            $stmt = $this->pdo->prepare('DELETE FROM menus WHERE website_id = ?');
            $stmt->execute([$websiteId]);

            // Delete website settings
            $stmt = $this->pdo->prepare('DELETE FROM website_settings WHERE website_id = ?');
            $stmt->execute([$websiteId]);

            // Delete website
            $stmt = $this->pdo->prepare('DELETE FROM websites WHERE id = ?');
            $success = $stmt->execute([$websiteId]);

            $this->pdo->commit();
            return $success;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log('Website delete error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function userCanAccessWebsite(string $userId, string $websiteId): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT id FROM user_website_access WHERE user_id = ? AND website_id = ?'
        );

        $stmt->execute([$userId, $websiteId]);
        return $stmt->rowCount() > 0;
    }

    public function grantAccessToWebsite(string $userId, string $websiteId, string $grantedBy): bool
    {
        try {
            // Get user's global role
            $stmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                error_log("User not found: $userId");
                return false;
            }

            // Determine role for website access (use user's role, with editor default)
            $role = ($user['role'] === 'editor') ? 'editor' : 'admin';

            // Insert access record
            $stmt = $this->pdo->prepare(
                'INSERT INTO user_website_access (id, user_id, website_id, role, granted_by)
                 VALUES (?, ?, ?, ?, ?)'
            );

            $accessId = $this->generateUuid();
            return $stmt->execute([$accessId, $userId, $websiteId, $role, $grantedBy]);
        } catch (Exception $e) {
            error_log('Grant access error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if a domain is already in use by another website
     * Supports excluding a website ID for update operations
     */
    public function domainExists(string $domain, ?string $excludeWebsiteId = null): bool
    {
        if ($excludeWebsiteId) {
            $stmt = $this->pdo->prepare(
                'SELECT 1 FROM websites WHERE domain = ? AND id != ? LIMIT 1'
            );
            $stmt->execute([$domain, $excludeWebsiteId]);
        } else {
            $stmt = $this->pdo->prepare(
                'SELECT 1 FROM websites WHERE domain = ? LIMIT 1'
            );
            $stmt->execute([$domain]);
        }
        
        return $stmt->rowCount() > 0;
    }

    /**
     * Get website by domain name
     */
    public function getWebsiteByDomain(string $domain): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, subdomain, domain, status, default_language, languages, theme, created_by, created_at, updated_at 
             FROM websites WHERE domain = ? LIMIT 1'
        );
        $stmt->execute([$domain]);
        $website = $stmt->fetch(PDO::FETCH_ASSOC);
        return $website ?: null;
    }
}