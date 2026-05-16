<?php
// backend/models/PublishHistoryModel.php

class PublishHistoryModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function insert(
        string $websiteId,
        string $userId,
        array $contentTypes,
        string $status = 'success',
        ?string $errorMessage = null
    ): bool {
        $stmt = $this->pdo->prepare("
            INSERT INTO publish_history (
                id,
                website_id,
                published_by,
                content_types,
                status,
                error_message
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        return $stmt->execute([
            $this->generateUuid(),
            $websiteId,
            $userId,
            json_encode($contentTypes),
            $status,
            $errorMessage,
        ]);
    }

    public function getRecentForDashboard(string $userId, string $globalRole, int $limit = 5): array
    {
        $limit = max(1, min($limit, 20));

        if ($globalRole === 'super_admin') {
            $stmt = $this->pdo->prepare("
                SELECT
                    ph.id,
                    ph.website_id,
                    ph.published_by,
                    ph.content_types,
                    ph.status,
                    ph.error_message,
                    ph.published_at,
                    u.name AS user_name,
                    u.email AS user_email,
                    w.name AS website_name,
                    w.domain AS website_domain
                FROM publish_history ph
                LEFT JOIN users u ON u.id = ph.published_by
                LEFT JOIN websites w ON w.id = ph.website_id
                ORDER BY ph.published_at DESC
                LIMIT $limit
            ");
            $stmt->execute();
        } else {
            $stmt = $this->pdo->prepare("
                SELECT
                    ph.id,
                    ph.website_id,
                    ph.published_by,
                    ph.content_types,
                    ph.status,
                    ph.error_message,
                    ph.published_at,
                    u.name AS user_name,
                    u.email AS user_email,
                    w.name AS website_name,
                    w.domain AS website_domain
                FROM publish_history ph
                LEFT JOIN users u ON u.id = ph.published_by
                LEFT JOIN websites w ON w.id = ph.website_id
                INNER JOIN user_website_access uwa ON uwa.website_id = ph.website_id
                WHERE uwa.user_id = ?
                ORDER BY ph.published_at DESC
                LIMIT $limit
            ");
            $stmt->execute([$userId]);
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        return array_map(function ($row) {
            $content = json_decode($row['content_types'] ?? '{}', true);
            if (!is_array($content)) {
                $content = [];
            }

            return [
                'id' => $row['id'],
                'websiteId' => $row['website_id'],
                'websiteName' => $row['website_name'] ?? 'Unknown website',
                'websiteDomain' => $row['website_domain'] ?? null,
                'userId' => $row['published_by'],
                'userName' => $row['user_name'] ?? 'Unknown user',
                'userEmail' => $row['user_email'] ?? null,
                'action' => $content['action'] ?? 'updated',
                'module' => $content['module'] ?? 'content',
                'itemId' => $content['item_id'] ?? null,
                'itemName' => $content['item_name'] ?? 'Unknown item',
                'status' => $row['status'],
                'errorMessage' => $row['error_message'],
                'publishedAt' => $row['published_at'],
            ];
        }, $rows);
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}