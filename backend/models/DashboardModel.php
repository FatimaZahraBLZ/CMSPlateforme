<?php
// backend/models/DashboardModel.php

class DashboardModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getDashboardStats(string $userId): array
    {
        $userRole = $this->getUserRole($userId);

        if (!$userRole) {
            throw new Exception('User not found');
        }

        $websiteIds = $this->getAccessibleWebsiteIds($userId, $userRole);

        $totalUsers = $this->countTable('users');
        $usersThisMonth = $this->countThisMonth('users', 'created_at');

        $totalWebsites = count($websiteIds);
        $websitesThisMonth = $this->countWebsitesThisMonth($websiteIds);

        $totalPages = $this->countByWebsites('pages', $websiteIds, 'is_deleted = 0');
        $pagesThisMonth = $this->countByWebsitesThisMonth('pages', $websiteIds, 'created_at', 'is_deleted = 0');

        $totalArticles = $this->countByWebsites('articles', $websiteIds);
        $articlesThisMonth = $this->countByWebsitesThisMonth('articles', $websiteIds, 'created_at');

        $totalMedia = $this->countByWebsites('media_items', $websiteIds);
        $mediaThisMonth = $this->countByWebsitesThisMonth('media_items', $websiteIds, 'created_at');

        $publishedWebsites = $this->countPublishedWebsites($websiteIds);
        $publishedPercentage = $totalWebsites > 0
            ? round(($publishedWebsites / $totalWebsites) * 100)
            : 0;

        return [
            'totalUsers' => $totalUsers,
            'usersThisMonth' => $usersThisMonth,

            'totalWebsites' => $totalWebsites,
            'websitesThisMonth' => $websitesThisMonth,

            'totalPages' => $totalPages,
            'pagesThisMonth' => $pagesThisMonth,

            'totalArticles' => $totalArticles,
            'articlesThisMonth' => $articlesThisMonth,

            'totalMedia' => $totalMedia,
            'mediaThisMonth' => $mediaThisMonth,

            'publishedWebsites' => $publishedWebsites,
            'publishedPercentage' => $publishedPercentage,
        ];
    }

    private function getUserRole(string $userId): ?string
    {
        $stmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user['role'] ?? null;
    }

    private function getAccessibleWebsiteIds(string $userId, string $userRole): array
    {
        if ($userRole === 'super_admin') {
            $stmt = $this->pdo->query('SELECT id FROM websites');
            return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'id');
        }

        $stmt = $this->pdo->prepare("
            SELECT DISTINCT w.id
            FROM websites w
            LEFT JOIN user_website_access uwa
                ON uwa.website_id = w.id
            WHERE w.created_by = ?
               OR uwa.user_id = ?
        ");

        $stmt->execute([$userId, $userId]);

        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'id');
    }

    private function countTable(string $table): int
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS total FROM {$table}");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function countThisMonth(string $table, string $dateColumn): int
    {
        $stmt = $this->pdo->query("
            SELECT COUNT(*) AS total
            FROM {$table}
            WHERE {$dateColumn} >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ");

        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function countByWebsites(string $table, array $websiteIds, ?string $extraWhere = null): int
    {
        if (empty($websiteIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($websiteIds), '?'));

        $sql = "
            SELECT COUNT(*) AS total
            FROM {$table}
            WHERE website_id IN ({$placeholders})
        ";

        if ($extraWhere) {
            $sql .= " AND {$extraWhere}";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($websiteIds);

        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function countByWebsitesThisMonth(
        string $table,
        array $websiteIds,
        string $dateColumn,
        ?string $extraWhere = null
    ): int {
        if (empty($websiteIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($websiteIds), '?'));

        $sql = "
            SELECT COUNT(*) AS total
            FROM {$table}
            WHERE website_id IN ({$placeholders})
              AND {$dateColumn} >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ";

        if ($extraWhere) {
            $sql .= " AND {$extraWhere}";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($websiteIds);

        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function countWebsitesThisMonth(array $websiteIds): int
    {
        if (empty($websiteIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($websiteIds), '?'));

        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) AS total
            FROM websites
            WHERE id IN ({$placeholders})
              AND created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ");

        $stmt->execute($websiteIds);

        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function countPublishedWebsites(array $websiteIds): int
    {
        if (empty($websiteIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($websiteIds), '?'));

        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) AS total
            FROM websites
            WHERE id IN ({$placeholders})
              AND status = 'published'
        ");

        $stmt->execute($websiteIds);

        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
}