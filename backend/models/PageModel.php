<?php
/**
 * PageModel - Complete CMS Lifecycle Management
 * 
 * Handles:
 * - Page CRUD operations
 * - Soft deletes (status-based, not physical)
 * - Page lifecycle (draft → published → archived → deleted)
 * - Publishing workflow with timestamps
 * - Page templates
 * - SEO metadata
 * - Public page fetching (published only)
 */

class PageModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get user role for website
     * Super admin always returns 'admin' role without checking access table
     * Admin/Editor must have explicit access row
     */
    public function getUserRoleForWebsite(string $userId, string $websiteId): ?string
    {
        // First check global role
        $stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) return null;

        // Super admin always has admin role without needing access row
        if ($user['role'] === 'super_admin') {
            return 'admin';
        }

        // Admin/Editor: check user_website_access table
        $stmt = $this->pdo->prepare("
            SELECT role FROM user_website_access
            WHERE user_id = ? AND website_id = ?
            LIMIT 1
        ");

        $stmt->execute([$userId, $websiteId]);
        $access = $stmt->fetch(PDO::FETCH_ASSOC);

        return $access ? $access['role'] : null;
    }

    /**
     * Get all pages for a website (for admin only - includes all statuses)
     */
    public function getPagesForWebsite(string $websiteId, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, translation_group_id, title, slug, content, image, 
                language, status, template, is_deleted, meta_title, meta_description, meta_image, 
                excerpt, created_by, updated_by, published_by, created_at AS createdAt, 
                updated_at AS updatedAt, published_at AS publishedAt, deleted_at, deleted_by
                FROM pages WHERE website_id = ? AND is_deleted = FALSE';
        $params = [$websiteId];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Get pages by status for admin (draft, published, archived)
     */
    public function getPagesByStatus(string $websiteId, string $status, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, translation_group_id, title, slug, content, image, 
                language, status, template, is_deleted, meta_title, meta_description, meta_image, 
                excerpt, created_by, updated_by, published_by, created_at AS createdAt, 
                updated_at AS updatedAt, published_at AS publishedAt
                FROM pages WHERE website_id = ? AND status = ? AND is_deleted = FALSE';
        $params = [$websiteId, $status];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Get published pages only (for public website)
     * CRITICAL: Only returns published pages with is_deleted = FALSE
     */
    public function getPublishedPages(string $websiteId, ?string $language = null): array
    {
        $sql = 'SELECT id, website_id, translation_group_id, title, slug, content, image, 
                language, status, template, meta_title, meta_description, meta_image, 
                excerpt, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt
                FROM pages WHERE website_id = ? AND status = "published" AND is_deleted = FALSE';
        $params = [$websiteId];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Get single page by ID (admin only - returns all statuses except deleted)
     */
    public function getPageById(string $id): ?array
    {
        $stmt = $this->pdo->prepare('
            SELECT id, website_id, translation_group_id, title, slug, content, image, language, 
                   status, template, is_deleted, meta_title, meta_description, meta_image, 
                   excerpt, created_by, updated_by, published_by, created_at AS createdAt, 
                   updated_at AS updatedAt, published_at AS publishedAt, deleted_at, deleted_by
            FROM pages WHERE id = ? AND is_deleted = FALSE LIMIT 1
        ');
        $stmt->execute([$id]);

        $page = $stmt->fetch();
        return $page ?: null;
    }

    /**
     * Get published page by slug (PUBLIC API)
     * CRITICAL: Only returns published pages
     */
    public function getPublishedPageBySlug(string $websiteId, string $slug, ?string $language = null): ?array
    {
        $sql = 'SELECT id, website_id, translation_group_id, title, slug, content, image, 
               language, status, template, meta_title, meta_description, meta_image, 
               excerpt, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt
        FROM pages WHERE website_id = ? AND slug = ? AND status = "published" AND is_deleted = FALSE';
        $params = [$websiteId, $slug];

        if ($language) {
            $sql .= ' AND language = ?';
            $params[] = $language;
        }

        $sql .= ' LIMIT 1';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetch() ?: null;
    }

    /**
     * Create new page
     * Default status: 'draft'
     * Default template: 'default'
     */
    public function createPage(array $data, string $userId): ?array
    {
        $id = $this->generateUuid();

        $stmt = $this->pdo->prepare('
            INSERT INTO pages (
                id, website_id, translation_group_id, title, slug, content, image, 
                language, status, template, meta_title, meta_description, meta_image, 
                excerpt, created_by, updated_by, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ');

        $success = $stmt->execute([
            $id,
            $data['website_id'],
            $data['translation_group_id'] ?? null,
            $data['title'],
            $data['slug'],
            $data['content'] ?? null,
            $data['image'] ?? null,
            $data['language'] ?? 'en',
            $data['status'] ?? 'draft',
            $data['template'] ?? 'default',
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['meta_image'] ?? null,
            $data['excerpt'] ?? null,
            $userId,
            $userId,
        ]);

        return $success ? $this->getPageById($id) : null;
    }

    /**
     * Update page
     * If status changes to 'published', set published_by and published_at
     */
    public function updatePage(string $id, array $data, string $userId): bool
    {
        // Get existing page to check status change
        $existingPage = $this->getPageById($id);
        if (!$existingPage) {
            return false;
        }

        $fields = [];
        $params = [];

        // Update allowed fields
        $allowedFields = [
            'title', 'slug', 'content', 'image', 'language', 'status',
            'template', 'meta_title', 'meta_description', 'meta_image', 'excerpt'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        // Always update updated_by and updated_at
        $fields[] = "updated_by = ?";
        $params[] = $userId;
        $fields[] = "updated_at = NOW()";

        // If publishing, set published_by and published_at
        if (isset($data['status']) && $data['status'] === 'published' && $existingPage['status'] !== 'published') {
            $fields[] = "published_by = ?";
            $params[] = $userId;
            $fields[] = "published_at = NOW()";
        }

        $params[] = $id;

        $stmt = $this->pdo->prepare(
            'UPDATE pages SET ' . implode(', ', $fields) . ' WHERE id = ?'
        );

        return $stmt->execute($params);
    }

    /**
     * SOFT DELETE - Mark page as deleted
     * Sets is_deleted=TRUE, deleted_at, deleted_by
     * Page is hidden from both admin and public, but data remains
     */
    public function softDeletePage(string $id, string $userId): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE pages
            SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ?, status = "deleted", updated_at = NOW()
            WHERE id = ?
        ');
        return $stmt->execute([$userId, $id]);
    }

    /**
     * HARD DELETE - Permanently remove page
     * Only use for cleanup/migration purposes
     */
    public function hardDeletePage(string $id): bool
    {
        // First delete associated menu items
        $stmt = $this->pdo->prepare('DELETE FROM menu_items WHERE page_id = ?');
        $stmt->execute([$id]);

        // Then delete page revisions
        $stmt = $this->pdo->prepare('DELETE FROM page_revisions WHERE page_id = ?');
        $stmt->execute([$id]);

        // Finally delete the page
        $stmt = $this->pdo->prepare('DELETE FROM pages WHERE id = ?');
        return $stmt->execute([$id]);
    }

    /**
     * Restore a soft-deleted page
     */
    public function restorePage(string $id): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE pages
            SET is_deleted = FALSE, deleted_at = NULL, deleted_by = NULL, status = "draft", updated_at = NOW()
            WHERE id = ?
        ');
        return $stmt->execute([$id]);
    }

    /**
     * Check if slug exists for website/language (excluding current page)
     */
    public function slugExists(string $websiteId, string $slug, string $language, ?string $excludePageId = null): bool
    {
        if ($excludePageId) {
            $stmt = $this->pdo->prepare(
                'SELECT id FROM pages WHERE website_id = ? AND slug = ? AND language = ? AND id != ? AND is_deleted = FALSE LIMIT 1'
            );
            $stmt->execute([$websiteId, $slug, $language, $excludePageId]);
        } else {
            $stmt = $this->pdo->prepare(
                'SELECT id FROM pages WHERE website_id = ? AND slug = ? AND language = ? AND is_deleted = FALSE LIMIT 1'
            );
            $stmt->execute([$websiteId, $slug, $language]);
        }

        return (bool) $stmt->fetch();
    }

    /**
     * Create page revision (for version history)
     */
    public function createRevision(string $pageId, array $pageData, string $userId): bool
    {
        // Get next revision number
        $stmt = $this->pdo->prepare('
            SELECT MAX(revision_number) as max_revision FROM page_revisions WHERE page_id = ?
        ');
        $stmt->execute([$pageId]);
        $result = $stmt->fetch();
        $revisionNumber = ($result['max_revision'] ?? 0) + 1;

        $revisionId = $this->generateUuid();
        $stmt = $this->pdo->prepare('
            INSERT INTO page_revisions (
                id, page_id, title, content, image, meta_title, meta_description, 
                meta_image, status, created_by, revision_number
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        return $stmt->execute([
            $revisionId,
            $pageId,
            $pageData['title'] ?? null,
            $pageData['content'] ?? null,
            $pageData['image'] ?? null,
            $pageData['meta_title'] ?? null,
            $pageData['meta_description'] ?? null,
            $pageData['meta_image'] ?? null,
            $pageData['status'] ?? null,
            $userId,
            $revisionNumber
        ]);
    }

    /**
     * Get page revisions
     */
    public function getPageRevisions(string $pageId): array
    {
        $stmt = $this->pdo->prepare('
            SELECT id, page_id, title, content, status, created_by, revision_number, created_at
            FROM page_revisions
            WHERE page_id = ?
            ORDER BY revision_number DESC
        ');
        $stmt->execute([$pageId]);
        return $stmt->fetchAll();
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
