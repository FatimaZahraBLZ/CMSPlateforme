<?php
// backend/controllers/PublicController.php
require_once __DIR__ . '/../models/ThemeModel.php';
class PublicController {
    private $pdo;
    private ThemeModel $themeModel;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->themeModel = new ThemeModel($pdo);
    }

    /**
     * GET /api/public/website?subdomain=client1
     */
    public function getWebsiteBySubdomain() {
        try {
            $subdomain = $_GET['subdomain'] ?? null;

            if (!$subdomain) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Subdomain is required'
                ]);
                return;
            }

            // 🔒 Security: sanitize
            $subdomain = strtolower(trim($subdomain));

            $stmt = $this->pdo->prepare("
                SELECT id, name, subdomain, domain, status, default_language
                FROM websites
                WHERE subdomain = ?
                LIMIT 1
            ");

            $stmt->execute([$subdomain]);
            $website = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$website) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Website not found'
                ]);
                return;
            }

            // Optional: only allow active/published/draft (newly created)
            if (!in_array($website['status'], ['active', 'published', 'draft'])) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Website is not available'
                ]);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'website' => $website
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Server error',
                'details' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/public/pages?website_id=123&language=en
     */
    public function getPages() {
        try {
            $websiteId = $_GET['website_id'] ?? null;
            $language = $_GET['language'] ?? 'en';

            if (!$websiteId) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'website_id is required'
                ]);
                return;
            }

            $stmt = $this->pdo->prepare("
                SELECT id, title, slug, content, language, status, meta_title, meta_description, meta_image, created_at, updated_at
                FROM pages
                WHERE website_id = ? AND language = ? AND status = 'published'
                ORDER BY created_at ASC
            ");

            $stmt->execute([$websiteId, $language]);
            $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'pages' => $pages
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error'
            ]);
        }
    }

    /**
     * GET /api/public/page?website_id=123&slug=home
     */
    public function getPage() {
        try {
            $websiteId = $_GET['website_id'] ?? null;
            $slug = $_GET['slug'] ?? null;

            if (!$websiteId || !$slug) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'website_id and slug are required'
                ]);
                return;
            }

            $stmt = $this->pdo->prepare("
                SELECT id, title, slug, content, language, status, meta_title, meta_description, meta_image, created_at, updated_at
                FROM pages
                WHERE website_id = ? AND slug = ? AND status = 'published'
                LIMIT 1
            ");

            $stmt->execute([$websiteId, $slug]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$page) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Page not found'
                ]);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'page' => $page
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error'
            ]);
        }
    }

    /**
     * GET /api/public/website-by-domain?domain=client1.cms
     * Lookup website by full domain name instead of just subdomain
     */
    public function getWebsiteByDomain() {
        try {
            $domain = $_GET['domain'] ?? null;

            if (!$domain) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Domain is required'
                ]);
                return;
            }

            // 🔒 Security: sanitize
            $domain = strtolower(trim($domain));

            $stmt = $this->pdo->prepare("
                SELECT id, name, subdomain, domain, status, default_language
                FROM websites
                WHERE domain = ?
                LIMIT 1
            ");

            $stmt->execute([$domain]);
            $website = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$website) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Website not found'
                ]);
                return;
            }

            // Optional: only allow active/published/draft (newly created)
            if (!in_array($website['status'], ['active', 'published', 'draft'])) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Website is not available'
                ]);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'website' => $website
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Server error',
                'details' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/public/page-with-layout?website_id=123&slug=about-us&language=en
     * 
     * Complete page rendering data including:
     * - Page content
     * - Theme/layout configuration
     * - Menu navigation
     * - Metadata for SEO
     * 
     * CRITICAL: Only returns PUBLISHED pages with is_deleted=FALSE
     */
    public function getPageWithLayout() {
        try {
            $websiteId = $_GET['website_id'] ?? null;
            $slug = $_GET['slug'] ?? null;
            $language = $_GET['language'] ?? 'en';

            if (!$websiteId || !$slug) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'website_id and slug are required'
                ]);
                return;
            }

            // 🔒 Get published page only
            $stmt = $this->pdo->prepare("
                SELECT id, title, slug, content, template, image, 
                       language, meta_title, meta_description, meta_image, excerpt
                FROM pages
                WHERE website_id = ? AND slug = ? AND language = ? 
                AND status = 'published' AND is_deleted = FALSE
                LIMIT 1
            ");

            $stmt->execute([$websiteId, $slug, $language]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$page) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Page not found or not published'
                ]);
                return;
            }

            // Get layout configuration (theme-based)
            $layout = $this->getPageLayout($websiteId, $page['template'] ?? 'default');

            // Get header menu with button info
            $headerMenu = $this->getPublishedMenuWithButton($websiteId, 'header', $language);

            // Get footer menu with button info
            $footerMenu = $this->getPublishedMenuWithButton($websiteId, 'footer', $language);

            echo json_encode([
                'status' => 'success',
                'page' => $page,
                'layout' => $layout,
                'navigation' => [
                    'header' => $headerMenu,
                    'footer' => $footerMenu
                ],
                'metadata' => [
                    'title' => $page['meta_title'] ?? $page['title'],
                    'description' => $page['meta_description'] ?? $page['excerpt'],
                    'image' => $page['meta_image'] ?? $page['image']
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error'
            ]);
        }
    }

    /**
     * Get published menu items (excludes deleted/unpublished pages)
     * CRITICAL: Only returns items linked to published pages
     */
    private function getPublishedMenu($websiteId, $menuType, $language = 'en') {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    mi.id,
                    mi.label,
                    mi.section_name,
                    mi.type,
                    mi.link,
                    mi.page_id,
                    mi.order_position,
                    p.slug AS page_slug,
                    p.title AS page_title
                FROM menu_items mi
                LEFT JOIN pages p ON p.id = mi.page_id
                INNER JOIN menus m ON m.id = mi.menu_id
                WHERE m.website_id = ? AND m.type = ? AND m.language = ?
                AND mi.is_active = TRUE
                AND (
                    (mi.type != 'page') OR 
                    (mi.type = 'page' AND p.status = 'published' AND p.is_deleted = FALSE)
                )
                ORDER BY mi.order_position, mi.id
            ");

            $stmt->execute([$websiteId, $menuType, $language]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
        } catch (Exception $e) {
            return [];
        }
    }

    private function getPublishedMenuWithButton($websiteId, $menuType, $language = 'en') {
        try {
            // Get menu with button info
            $stmt = $this->pdo->prepare("
                SELECT 
                    id,
                    name,
                    type,
                    has_button,
                    button_label,
                    button_type,
                    button_page_id,
                    button_link,
                    button_phone,
                    button_color
                FROM menus
                WHERE website_id = ? AND type = ? AND language = ?
            ");
            $stmt->execute([$websiteId, $menuType, $language]);
            $menu = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$menu) {
                return null;
            }

            // Get menu items
            $itemsStmt = $this->pdo->prepare("
                SELECT 
                    mi.id,
                    mi.label,
                    mi.section_name,
                    mi.type,
                    mi.link,
                    mi.page_id,
                    mi.order_position,
                    p.slug AS page_slug,
                    p.title AS page_title
                FROM menu_items mi
                LEFT JOIN pages p ON p.id = mi.page_id
                WHERE mi.menu_id = ?
                AND mi.is_active = TRUE
                AND (
                    (mi.type != 'page') OR 
                    (mi.type = 'page' AND p.status = 'published' AND p.is_deleted = FALSE)
                )
                ORDER BY mi.order_position, mi.id
            ");
            $itemsStmt->execute([$menu['id']]);
            $menu['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC) ?? [];

            // Process button data if button is enabled
            if ($menu['has_button']) {
                // If button links to a page, get page slug
                if ($menu['button_type'] === 'page' && $menu['button_page_id']) {
                    $pageStmt = $this->pdo->prepare("SELECT slug, title FROM pages WHERE id = ? AND status = 'published'");
                    $pageStmt->execute([$menu['button_page_id']]);
                    $page = $pageStmt->fetch(PDO::FETCH_ASSOC);
                    if ($page) {
                        $menu['button_slug'] = $page['slug'];
                        $menu['button_page_title'] = $page['title'];
                    }
                }
            }

            return $menu;
        } catch (Exception $e) {
            error_log('Error getting published menu with button: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get layout configuration for theme
     * Returns layout structure for rendering (header, footer, sidebar, etc.)
     * Now database-driven via ThemeModel
     */
    private function getPageLayout($websiteId, $template = 'default') {
        return $this->themeModel->getPageLayout($websiteId, $template);
    }

    /**
     * GET /api/public/pages-sitemap?website_id=123&language=en
     * Get all published pages for sitemap generation
     */
    public function getPagesSitemap() {
        try {
            $websiteId = $_GET['website_id'] ?? null;
            $language = $_GET['language'] ?? 'en';

            if (!$websiteId) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'website_id is required'
                ]);
                return;
            }

            // 🔒 Only published pages
            $stmt = $this->pdo->prepare("
                SELECT id, slug, updated_at, published_at
                FROM pages
                WHERE website_id = ? AND language = ? 
                AND status = 'published' AND is_deleted = FALSE
                ORDER BY updated_at DESC
            ");

            $stmt->execute([$websiteId, $language]);
            $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'pages' => $pages,
                'count' => count($pages)
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error'
            ]);
        }
    }
}