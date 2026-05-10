<?php
// backend/controllers/PublicController.php

class PublicController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
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
}