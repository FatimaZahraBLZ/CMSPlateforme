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

            // Grant access to creator only if NOT super_admin
            // Super admin doesn't need an access row - they bypass access checks entirely
            $userStmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && $user['role'] !== 'super_admin') {
                // Grant with 'owner' role for non-super-admins
                $this->grantWebsiteAccessWithRole($userId, $websiteId, 'owner', $userId);
            }

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

    public function createDefaultPage(string $websiteId, array $page): ?string
{
    $pageId = $this->generateUuid();

    error_log('WebsiteModel.createDefaultPage - Inserting page: ' . json_encode($page));

    $stmt = $this->pdo->prepare("
        INSERT INTO pages (
            id,
            website_id,
            title,
            slug,
            content,
            language,
            status,
            template,
            created_by,
            published_by,
            published_at,
            is_deleted
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
    ");

    $userId = '00000000-0000-0000-0000-000000000001';

    $success = $stmt->execute([
        $pageId,
        $websiteId,
        $page['title'],
        $page['slug'],
        $page['content'],
        $page['language'],
        $page['status'],
        $page['template'] ?? 'minimal-standard',
        $userId,
        $page['status'] === 'published' ? $userId : null,
    ]);

    if (!$success) {
        return null;
    }

    error_log("Successfully inserted page with ID: $pageId");

    return $pageId;
}

public function createWebsiteSection(
    string $websiteId,
    string $pageId,
    string $language,
    string $sectionKey,
    string $sectionType,
    string $title = '',
    ?string $subtitle = null,
    ?string $content = null,
    ?string $image = null,
    ?string $buttonText = null,
    ?string $buttonLink = null,
    int $orderPosition = 0,
    bool $isActive = true,
    array $settings = []
): ?string {
    $sectionId = $this->generateUuid();

    $stmt = $this->pdo->prepare("
        INSERT INTO website_sections (
            id,
            website_id,
            page_id,
            language,
            section_key,
            section_type,
            title,
            subtitle,
            content,
            image,
            button_text,
            button_link,
            order_position,
            is_active,
            settings
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $success = $stmt->execute([
        $sectionId,
        $websiteId,
        $pageId,
        $language,
        $sectionKey,
        $sectionType,
        $title,
        $subtitle,
        $content,
        $image,
        $buttonText,
        $buttonLink,
        $orderPosition,
        $isActive ? 1 : 0,
        json_encode($settings, JSON_UNESCAPED_UNICODE),
    ]);

    return $success ? $sectionId : null;
}

    public function createDefaultMenu(string $websiteId, string $menuName, array $menuItems, string $language, string $type = 'header'): void
    {
        try {
            error_log("Creating default menu for website: $websiteId, language: $language, type: $type");
            
            // Create menu with the specified type
            $stmt = $this->pdo->prepare(
                'INSERT INTO menus (id, website_id, type, language, name)
                 VALUES (?, ?, ?, ?, ?)'
            );
            $menuId = $this->generateUuid();
            $stmt->execute([$menuId, $websiteId, $type, $language, $menuName]);
            error_log("Menu created with ID: $menuId, type: $type");

            // Create menu items only if there are any
            if (!empty($menuItems)) {
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
            } else {
                error_log("No menu items to create for menu: $menuId (type: $type)");
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

    public function getWebsitesForUser(string $userId, string $userRole): array
    {
        try {
            // Super admin sees ALL websites
            if ($userRole === 'super_admin') {
                $stmt = $this->pdo->prepare(
                    'SELECT id, name, subdomain, client, domain, status, default_language, languages, theme, created_at, updated_at
                     FROM websites
                     ORDER BY created_at DESC'
                );
                $stmt->execute();
            } else {
                // Admin/Editor only see assigned websites
                $stmt = $this->pdo->prepare(
                    'SELECT w.id, w.name, w.subdomain, w.client, w.domain, w.status, w.default_language, w.languages, w.theme, w.created_at, w.updated_at, uwa.role AS userRole
                     FROM user_website_access uwa
                     INNER JOIN websites w ON uwa.website_id = w.id
                     WHERE uwa.user_id = ?
                     ORDER BY w.created_at DESC'
                );
                $stmt->execute([$userId]);
            }

            $websites = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON languages field
            foreach ($websites as &$website) {
                if ($website['languages']) {
                    $website['languages'] = json_decode($website['languages'], true);
                } else {
                    $website['languages'] = ['en'];
                }
            }

            return $websites;
        } catch (Exception $e) {
            error_log('getWebsitesForUser() error: ' . $e->getMessage());
            error_log('User role: ' . $userRole . ', User ID: ' . $userId);
            throw $e;
        }
    }

    public function createTemplate(
    string $websiteId,
    string $name,
    string $slug,
    string $themeType,
    string $pageType,
    string $layoutType,
    array $sections,
    array $settings = [],
    ?string $description = null,
    ?string $headerComponent = null,
    ?string $footerComponent = null,
    bool $sidebarEnabled = false
): ?string {
    $templateId = $this->generateUuid();

    $stmt = $this->pdo->prepare("
        INSERT INTO templates (
            id,
            website_id,
            name,
            slug,
            theme_type,
            page_type,
            layout_type,
            header_component,
            footer_component,
            sidebar_enabled,
            sections,
            settings,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $success = $stmt->execute([
        $templateId,
        $websiteId,
        $name,
        $slug,
        $themeType,
        $pageType,
        $layoutType,
        $headerComponent,
        $footerComponent,
        $sidebarEnabled ? 1 : 0,
        json_encode($sections, JSON_UNESCAPED_UNICODE),
        json_encode($settings, JSON_UNESCAPED_UNICODE),
        $description,
    ]);

    return $success ? $templateId : null;
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

    public function userCanAccessWebsite(string $userId, string $websiteId, string $userRole): bool
    {
        // Super admin always has access
        if ($userRole === 'super_admin') {
            return true;
        }

        // Admin/Editor must have explicit access row
        $stmt = $this->pdo->prepare(
            'SELECT id FROM user_website_access WHERE user_id = ? AND website_id = ?'
        );

        $stmt->execute([$userId, $websiteId]);
        return $stmt->rowCount() > 0;
    }

    public function grantAccessToWebsite(string $userId, string $websiteId, string $grantedBy): bool
    {
        return $this->grantWebsiteAccessWithRole($userId, $websiteId, 'editor', $grantedBy);
    }

    /**
     * Grant access to a website with a specific role
     */
    public function grantWebsiteAccessWithRole(string $userId, string $websiteId, string $role, string $grantedBy): bool
    {
        try {
            // Check if user already has access
            $stmt = $this->pdo->prepare(
                'SELECT id FROM user_website_access WHERE user_id = ? AND website_id = ?'
            );
            $stmt->execute([$userId, $websiteId]);

            if ($stmt->rowCount() > 0) {
                // User already has access, just update the role
                return $this->updateUserWebsiteRole($userId, $websiteId, $role);
            }

            // Insert new access record
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
     * Get a user's role for a specific website
     */
    public function getUserWebsiteRole(string $userId, string $websiteId): ?string
    {
        try {
            $stmt = $this->pdo->prepare(
                'SELECT role FROM user_website_access WHERE user_id = ? AND website_id = ? LIMIT 1'
            );
            $stmt->execute([$userId, $websiteId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['role'] : null;
        } catch (Exception $e) {
            error_log('Get user website role error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update a user's website role
     */
    public function updateUserWebsiteRole(string $userId, string $websiteId, string $newRole): bool
    {
        try {
            $stmt = $this->pdo->prepare(
                'UPDATE user_website_access SET role = ? WHERE user_id = ? AND website_id = ?'
            );
            return $stmt->execute([$newRole, $userId, $websiteId]);
        } catch (Exception $e) {
            error_log('Update user website role error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Revoke a user's access to a website
     */
    public function revokeWebsiteAccess(string $userId, string $websiteId): bool
    {
        try {
            $stmt = $this->pdo->prepare(
                'DELETE FROM user_website_access WHERE user_id = ? AND website_id = ?'
            );
            return $stmt->execute([$userId, $websiteId]);
        } catch (Exception $e) {
            error_log('Revoke access error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all users with access to a website, with their details
     */
    public function getWebsiteAccessList(string $websiteId): array
    {
        try {
            $stmt = $this->pdo->prepare(
                'SELECT 
                    uwa.user_id,
                    uwa.role as website_role,
                    uwa.granted_by,
                    u.name,
                    u.email,
                    u.role as global_role,
                    u.status,
                    COALESCE(granter.name, "System") as granted_by_name
                 FROM user_website_access uwa
                 JOIN users u ON uwa.user_id = u.id
                 LEFT JOIN users granter ON uwa.granted_by = granter.id
                 WHERE uwa.website_id = ?
                 ORDER BY 
                    CASE uwa.role
                        WHEN "owner" THEN 1
                        WHEN "admin" THEN 2
                        WHEN "editor" THEN 3
                        WHEN "viewer" THEN 4
                        ELSE 5
                    END,
                    u.name ASC'
            );
            $stmt->execute([$websiteId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Get website access list error: ' . $e->getMessage());
            return [];
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