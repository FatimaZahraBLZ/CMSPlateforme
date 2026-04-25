<?php
// backend/controllers/WebsitesController.php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../models/WebsiteModel.php';

class WebsitesController
{
    private PDO $pdo;
    private AuthService $authService;
    private WebsiteModel $websiteModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->authService = new AuthService($pdo);
        $this->websiteModel = new WebsiteModel($pdo);
    }

    public function index(): void
    {
        $token = $this->getBearerToken();

        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);

        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $websites = $this->websiteModel->getWebsitesForUser($payload['sub']);

        echo json_encode([
            'status' => 'success',
            'websites' => $websites,
        ]);
    }

    private function getBearerToken(): ?string
    {
        $authorization = null;

        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authorization = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authorization = trim($headers['Authorization']);
            } elseif (isset($headers['authorization'])) {
                $authorization = trim($headers['authorization']);
            }
        }

        if (!$authorization) {
            return null;
        }

        if (preg_match('/^Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public function create(): void
    {
        $token = $this->getBearerToken();

        if (!$token) {
            $this->respondUnauthorized('Authorization token is required');
            return;
        }

        $payload = $this->authService->validateJwt($token);

        if (!$payload || empty($payload['sub'])) {
            $this->respondUnauthorized('Invalid or expired token');
            return;
        }

        $userId = $payload['sub'];

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $this->respondBadRequest('Invalid JSON input');
            return;
        }

        // Validate required fields
        if (empty($input['name'])) {
            $this->respondBadRequest('Website name is required');
            return;
        }

        // Create website with new fields
        $websiteData = [
            'name' => trim($input['name']),
            'client' => trim($input['client'] ?? ''),
            'domain' => trim($input['domain'] ?? ''),
            'status' => $input['status'] ?? 'draft',
            'defaultLanguage' => $input['defaultLanguage'] ?? 'en',
            'languages' => $input['languages'] ?? ['en'],
            'theme' => $input['theme'] ?? 'minimal',
        ];

        try {
            $websiteId = $this->websiteModel->createWebsite($websiteData, $userId);

            // Auto-create default content
            $this->createDefaultContent($websiteId, $websiteData);

            echo json_encode([
                'status' => 'success',
                'message' => 'Website created successfully',
                'website' => [
                    'id' => $websiteId,
                    ...$websiteData
                ]
            ]);
        } catch (Exception $e) {
            $this->respondServerError('Failed to create website: ' . $e->getMessage());
        }
    }

    private function createDefaultContent(string $websiteId, array $websiteData): void
    {
        try {
            // Create default pages
            $this->createDefaultPages($websiteId, $websiteData['defaultLanguage']);

            // Create default menu
            $this->createDefaultMenu($websiteId, $websiteData['defaultLanguage']);

            // Create default settings
            $this->createDefaultSettings($websiteId);

        } catch (Exception $e) {
            // Log error but don't fail the website creation
            error_log('Failed to create default content: ' . $e->getMessage());
        }
    }

    private function createDefaultPages(string $websiteId, string $defaultLanguage): void
    {
        $defaultPages = [
            [
                'title' => 'Home',
                'slug' => 'home',
                'content' => $this->getDefaultPageContent('home', $defaultLanguage),
                'status' => 'published',
                'is_homepage' => true
            ],
            [
                'title' => 'About',
                'slug' => 'about',
                'content' => $this->getDefaultPageContent('about', $defaultLanguage),
                'status' => 'published',
                'is_homepage' => false
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'content' => $this->getDefaultPageContent('contact', $defaultLanguage),
                'status' => 'published',
                'is_homepage' => false
            ]
        ];

        foreach ($defaultPages as $page) {
            $this->websiteModel->createDefaultPage($websiteId, $page);
        }
    }

    private function createDefaultMenu(string $websiteId, string $defaultLanguage): void
    {
        $menuItems = [
            ['title' => 'Home', 'url' => '/', 'order' => 1],
            ['title' => 'About', 'url' => '/about', 'order' => 2],
            ['title' => 'Contact', 'url' => '/contact', 'order' => 3]
        ];

        $this->websiteModel->createDefaultMenu($websiteId, 'Main Menu', $menuItems, $defaultLanguage);
    }

    private function createDefaultSettings(string $websiteId): void
    {
        $defaultSettings = [
            ['key' => 'site_title', 'value' => 'My Website'],
            ['key' => 'site_description', 'value' => 'Welcome to my website'],
            ['key' => 'contact_email', 'value' => ''],
            ['key' => 'contact_phone', 'value' => ''],
            ['key' => 'social_facebook', 'value' => ''],
            ['key' => 'social_twitter', 'value' => ''],
            ['key' => 'social_instagram', 'value' => ''],
            ['key' => 'seo_title', 'value' => ''],
            ['key' => 'seo_description', 'value' => ''],
            ['key' => 'seo_keywords', 'value' => ''],
        ];

        foreach ($defaultSettings as $setting) {
            $this->websiteModel->createDefaultSetting($websiteId, $setting['key'], $setting['value']);
        }
    }

    private function getDefaultPageContent(string $pageType, string $language): string
    {
        $content = [
            'home' => [
                'en' => '<h1>Welcome to Our Website</h1><p>This is the homepage. You can customize this content in the CMS.</p>',
                'fr' => '<h1>Bienvenue sur notre site web</h1><p>Ceci est la page d\'accueil. Vous pouvez personnaliser ce contenu dans le CMS.</p>',
                'ar' => '<h1>مرحباً بكم في موقعنا</h1><p>هذه الصفحة الرئيسية. يمكنك تخصيص هذا المحتوى في نظام إدارة المحتوى.</p>'
            ],
            'about' => [
                'en' => '<h1>About Us</h1><p>Learn more about our company and what we do.</p>',
                'fr' => '<h1>À propos de nous</h1><p>En savoir plus sur notre entreprise et ce que nous faisons.</p>',
                'ar' => '<h1>معلومات عنا</h1><p>تعرف على المزيد عن شركتنا وما نقوم به.</p>'
            ],
            'contact' => [
                'en' => '<h1>Contact Us</h1><p>Get in touch with us for any inquiries.</p>',
                'fr' => '<h1>Contactez-nous</h1><p>Contactez-nous pour toute demande de renseignements.</p>',
                'ar' => '<h1>اتصل بنا</h1><p>تواصل معنا لأي استفسارات.</p>'
            ]
        ];

        return $content[$pageType][$language] ?? $content[$pageType]['en'];
    }

    private function respondBadRequest(string $message): void
    {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondUnauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    private function respondServerError(string $message): void
    {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
}