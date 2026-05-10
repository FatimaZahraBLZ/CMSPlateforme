<?php
// backend/models/PageModel.php

class PageModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserRoleForWebsite(string $userId, string $websiteId): ?string
{
    $stmt = $this->pdo->prepare("
        SELECT uwa.role, u.role AS global_role
        FROM user_website_access uwa
        JOIN users u ON u.id = uwa.user_id
        WHERE uwa.user_id = ? AND uwa.website_id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId, $websiteId]);
    $row = $stmt->fetch();

    if (!$row) return null;

    // 🔥 SUPER ADMIN OVERRIDE
    if ($row['global_role'] === 'super_admin') {
        return 'admin';
    }

    return $row['role'];
}

    public function getPagesForWebsite(string $websiteId, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, translation_group_id, title, slug, content, image, language, status, meta_title, meta_description, meta_image, created_by, updated_by, published_by, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt FROM pages WHERE website_id = ?';
        $params = [$websiteId];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function getPageById(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, website_id, translation_group_id, title, slug, content, image, language, status, meta_title, meta_description, meta_image, created_by, updated_by, published_by, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt FROM pages WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);

        $page = $stmt->fetch();
        return $page ?: null;
    }

    public function createPage(array $data, string $userId): ?array
    {
        $id = $this->generateUuid();
        
        $stmt = $this->pdo->prepare(
            'INSERT INTO pages (id, website_id, translation_group_id, title, slug, content, image, language, status, meta_title, meta_description, meta_image, created_by, updated_by, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'
        );

        $success = $stmt->execute([
            $id,
            $data['website_id'],
            null,
            $data['title'],
            $data['slug'],
            $data['content'] ?? null,
            $data['image'] ?? null,
            $data['language'],
            $data['status'],
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['meta_image'] ?? null,
            $userId, // created_by
            $userId, // updated_by
        ]);

        return $success ? $this->getPageById($id) : null;
    }

    public function updatePage(string $id, array $data, string $userId): bool
    {
        // Check if status is changing to published
        $setPublished = '';
        $params = [
            $data['title'],
            $data['slug'],
            $data['content'] ?? null,
            $data['image'] ?? null,
            $data['language'],
            $data['status'],
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['meta_image'] ?? null,
            $userId, // updated_by
        ];

        if ($data['status'] === 'published') {
            $setPublished = ', published_by = ?, published_at = NOW()';
            $params[] = $userId; // published_by
        }

        $stmt = $this->pdo->prepare(
            'UPDATE pages SET title = ?, slug = ?, content = ?, image = ?, language = ?, status = ?, meta_title = ?, meta_description = ?, meta_image = ?, updated_by = ?, updated_at = NOW()' . $setPublished . ' WHERE id = ?'
        );

        $params[] = $id;
        return $stmt->execute($params);
    }

    public function deletePage(string $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM pages WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function slugExists(string $websiteId, string $slug, string $language, ?string $excludePageId = null): bool
    {
        if ($excludePageId) {
            $stmt = $this->pdo->prepare(
                'SELECT id FROM pages WHERE website_id = ? AND slug = ? AND language = ? AND id != ? LIMIT 1'
            );
            $stmt->execute([$websiteId, $slug, $language, $excludePageId]);
        } else {
            $stmt = $this->pdo->prepare(
                'SELECT id FROM pages WHERE website_id = ? AND slug = ? AND language = ? LIMIT 1'
            );
            $stmt->execute([$websiteId, $slug, $language]);
        }
        
        return (bool) $stmt->fetch();
    }

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
