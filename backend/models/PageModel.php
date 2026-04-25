<?php
// backend/models/PageModel.php

class PageModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function userCanAccessWebsite(string $userId, string $websiteId): bool
    {
        $stmt = $this->pdo->prepare('SELECT role FROM user_website_access WHERE user_id = ? AND website_id = ? LIMIT 1');
        $stmt->execute([$userId, $websiteId]);
        return (bool) $stmt->fetch();
    }

    public function getPagesForWebsite(string $websiteId, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, title, slug, content, language, status, created_at AS createdAt, updated_at AS updatedAt FROM pages WHERE website_id = ?';
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
        $stmt = $this->pdo->prepare('SELECT id, website_id, title, slug, content, language, status, created_at AS createdAt, updated_at AS updatedAt FROM pages WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);

        $page = $stmt->fetch();
        return $page ?: null;
    }

    public function createPage(array $data): ?array
    {
        $id = $this->generateUuid();
        $stmt = $this->pdo->prepare(
            'INSERT INTO pages (id, website_id, title, slug, content, language, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'
        );

        $success = $stmt->execute([
            $id,
            $data['website_id'],
            $data['title'],
            $data['slug'],
            $data['content'],
            $data['language'],
            $data['status'],
        ]);

        return $success ? $this->getPageById($id) : null;
    }

    public function updatePage(string $id, array $data): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE pages SET title = ?, slug = ?, content = ?, language = ?, status = ?, updated_at = NOW() WHERE id = ?'
        );

        return $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['content'],
            $data['language'],
            $data['status'],
            $id,
        ]);
    }

    public function deletePage(string $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM pages WHERE id = ?');
        return $stmt->execute([$id]);
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
