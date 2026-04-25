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
            // Insert website
            $stmt = $this->pdo->prepare(
                'INSERT INTO websites (name, client, domain, status, default_language, languages, theme, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'
            );

            $languagesJson = json_encode($websiteData['languages']);

            $stmt->execute([
                $websiteData['name'],
                $websiteData['client'],
                $websiteData['domain'],
                $websiteData['status'],
                $websiteData['defaultLanguage'],
                $languagesJson,
                $websiteData['theme']
            ]);

            $websiteId = $this->pdo->lastInsertId();

            // Grant super_admin access to creator
            $stmt = $this->pdo->prepare(
                'INSERT INTO user_website_access (user_id, website_id, role, created_at)
                 VALUES (?, ?, "super_admin", NOW())'
            );
            $stmt->execute([$userId, $websiteId]);

            $this->pdo->commit();
            return $websiteId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function createDefaultPage(string $websiteId, array $pageData): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO pages (website_id, title, slug, content, status, is_homepage, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())'
        );

        $stmt->execute([
            $websiteId,
            $pageData['title'],
            $pageData['slug'],
            $pageData['content'],
            $pageData['status'],
            $pageData['is_homepage'] ? 1 : 0
        ]);
    }

    public function createDefaultMenu(string $websiteId, string $menuName, array $menuItems, string $language): void
    {
        // Create menu
        $stmt = $this->pdo->prepare(
            'INSERT INTO menus (website_id, name, language, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())'
        );
        $stmt->execute([$websiteId, $menuName, $language]);

        $menuId = $this->pdo->lastInsertId();

        // Create menu items
        $stmt = $this->pdo->prepare(
            'INSERT INTO menu_items (menu_id, title, url, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())'
        );

        foreach ($menuItems as $item) {
            $stmt->execute([$menuId, $item['title'], $item['url'], $item['order']]);
        }
    }

    public function createDefaultSetting(string $websiteId, string $key, string $value): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO website_settings (website_id, setting_key, setting_value, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())'
        );

        $stmt->execute([$websiteId, $key, $value]);
    }

    public function getWebsitesForUser(string $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT w.id, w.name, w.client, w.domain, w.status, w.default_language, w.languages, w.theme, w.created_at, w.updated_at, uwa.role
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
}