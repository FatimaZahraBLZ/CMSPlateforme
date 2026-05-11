<?php
// backend/models/MenuModel.php

class MenuModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all menus for a website
     */
    public function getMenusForWebsite(string $websiteId, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, type, language, name FROM menus WHERE website_id = ?';
        $params = [$websiteId];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll() ?: [];
    }

    /**
     * Get a specific menu by ID
     */
    public function getMenuById(string $menuId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, website_id, type, language, name FROM menus WHERE id = ? LIMIT 1');
        $stmt->execute([$menuId]);

        $menu = $stmt->fetch();
        return $menu ?: null;
    }

    /**
     * Get all menu items for a menu, including page slug information
     */
    public function getMenuItems(string $menuId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                mi.id,
                mi.menu_id,
                mi.label,
                mi.type,
                mi.link,
                mi.page_id,
                mi.article_id,
                mi.order_position,
                mi.parent_id,
                mi.is_active,
                p.slug AS page_slug,
                p.title AS page_title
            FROM menu_items mi
            LEFT JOIN pages p ON p.id = mi.page_id
            WHERE mi.menu_id = ?
            ORDER BY mi.order_position, mi.id
        ");
        $stmt->execute([$menuId]);

        return $stmt->fetchAll() ?: [];
    }

    /**
     * Get menu by website and type (e.g., 'header' or 'footer')
     */
    public function getMenuByType(string $websiteId, string $type, ?string $language = null): ?array
    {
        $sql = 'SELECT id, website_id, type, language, name FROM menus WHERE website_id = ? AND type = ?';
        $params = [$websiteId, $type];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $menu = $stmt->fetch();
        return $menu ?: null;
    }

    /**
     * Create a menu
     */
    public function createMenu(string $websiteId, string $type, string $name, string $language = 'en'): ?string
    {
        $menuId = $this->generateUuid();

        $stmt = $this->pdo->prepare(
            'INSERT INTO menus (id, website_id, type, language, name) VALUES (?, ?, ?, ?, ?)'
        );

        $success = $stmt->execute([$menuId, $websiteId, $type, $language, $name]);

        return $success ? $menuId : null;
    }

    /**
     * Create a menu item
     */
    public function createMenuItem(string $menuId, string $label, string $type, ?int $orderPosition = null, ?string $pageId = null, ?string $link = null, bool $isActive = true): ?string
    {
        $menuItemId = $this->generateUuid();

        // Get next order position if not provided
        if ($orderPosition === null) {
            $stmt = $this->pdo->prepare('SELECT MAX(order_position) as max_order FROM menu_items WHERE menu_id = ?');
            $stmt->execute([$menuId]);
            $row = $stmt->fetch();
            $orderPosition = ($row['max_order'] ?? 0) + 1;
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO menu_items (id, menu_id, label, type, page_id, link, order_position, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $success = $stmt->execute([
            $menuItemId,
            $menuId,
            $label,
            $type,
            $pageId,
            $link,
            $orderPosition,
            $isActive ? 1 : 0
        ]);

        return $success ? $menuItemId : null;
    }

    /**
     * Update a menu item
     */
    public function updateMenuItem(string $menuItemId, array $data): bool
    {
        $updateFields = [];
        $params = [];

        if (isset($data['label'])) {
            $updateFields[] = 'label = ?';
            $params[] = $data['label'];
        }

        if (isset($data['type'])) {
            $updateFields[] = 'type = ?';
            $params[] = $data['type'];
        }

        if (isset($data['page_id'])) {
            $updateFields[] = 'page_id = ?';
            $params[] = $data['page_id'];
        }

        if (isset($data['link'])) {
            $updateFields[] = 'link = ?';
            $params[] = $data['link'];
        }

        if (isset($data['order_position'])) {
            $updateFields[] = 'order_position = ?';
            $params[] = $data['order_position'];
        }

        if (isset($data['is_active'])) {
            $updateFields[] = 'is_active = ?';
            $params[] = $data['is_active'] ? 1 : 0;
        }

        if (empty($updateFields)) {
            return true; // No updates to apply
        }

        $params[] = $menuItemId;

        $stmt = $this->pdo->prepare(
            'UPDATE menu_items SET ' . implode(', ', $updateFields) . ' WHERE id = ?'
        );

        return $stmt->execute($params);
    }

    /**
     * Delete a menu item
     */
    public function deleteMenuItem(string $menuItemId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM menu_items WHERE id = ?');
        return $stmt->execute([$menuItemId]);
    }

    /**
     * Delete all menu items for a page (when page is deleted)
     */
    public function deleteMenuItemsByPageId(string $pageId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM menu_items WHERE page_id = ?');
        return $stmt->execute([$pageId]);
    }

    /**
     * Reorder menu items
     */
    public function reorderMenuItems(string $menuId, array $itemIds): bool
    {
        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare('UPDATE menu_items SET order_position = ? WHERE id = ?');

            foreach ($itemIds as $position => $itemId) {
                $stmt->execute([$position + 1, $itemId]);
            }

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log('Reorder menu items error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate UUID
     */
    private function generateUuid(): string
    {
        if (function_exists('random_bytes')) {
            $data = random_bytes(16);
            $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
            $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
            return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
        }

        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
