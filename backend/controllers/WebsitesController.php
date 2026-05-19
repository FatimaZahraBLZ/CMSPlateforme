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
        try {
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
            
            // Get user's global role
            $userRole = $this->getUserRole($userId);
            if (!$userRole) {
                $this->respondUnauthorized('User not found');
                return;
            }

            $websites = $this->websiteModel->getWebsitesForUser($userId, $userRole);

            echo json_encode([
                'status' => 'success',
                'websites' => $websites,
            ]);
        } catch (Exception $e) {
            error_log('WebsitesController.index() error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            $this->respondServerError('Failed to fetch websites: ' . $e->getMessage());
        }
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

    private function getUserRole(string $userId): ?string
    {
        try {
            $stmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
            if (!$stmt) {
                error_log('Failed to prepare statement for getUserRole');
                return null;
            }
            
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ? $user['role'] : null;
        } catch (Exception $e) {
            error_log('getUserRole() error: ' . $e->getMessage());
            return null;
        }
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
            'status' => $input['status'] ?? 'published',
            'defaultLanguage' => $input['defaultLanguage'] ?? 'en',
            'languages' => $input['languages'] ?? ['en'],
            'theme' => $input['theme'] ?? 'minimal',
        ];

        try {
            error_log('Creating website with data: ' . json_encode($websiteData));
            $websiteId = $this->websiteModel->createWebsite($websiteData, $userId);
            error_log('Website created successfully: ' . $websiteId);

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
    error_log('Website creation exception: ' . $e->getMessage());
    error_log('Exception trace: ' . $e->getTraceAsString());

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create website',
        'details' => $e->getMessage()
    ]);
}
    }

    private function createDefaultContent(string $websiteId, array $websiteData): void
{
    try {
        error_log("Starting to create default content for website: $websiteId");

        // 1. Create default theme settings
        error_log("Creating default theme for website: $websiteId");
        $this->createDefaultTheme($websiteId, $websiteData);
        error_log("Default theme created successfully");

        // 2. Create templates before pages
        error_log("Creating default templates for website: $websiteId");
        $this->createDefaultTemplates($websiteId, $websiteData['theme']);
        error_log("Default templates created successfully");

        // 3. Create pages using the selected theme
        error_log("Creating default pages for website: $websiteId");
        $this->createDefaultPages(
            $websiteId,
            $websiteData['defaultLanguage'],
            $websiteData['theme']
        );
        error_log("Default pages created successfully");

        // 4. Create default header/footer menus
        error_log("Creating default menu for website: $websiteId");
        $this->createDefaultMenu(
            $websiteId,
            $websiteData['defaultLanguage'],
            $websiteData['theme']
        );
        error_log("Default menu created successfully");

        // 5. Create website settings
        error_log("Creating default settings for website: $websiteId");
        $this->createDefaultSettings($websiteId);
        error_log("Default settings created successfully");

    } catch (Exception $e) {
    error_log('Failed to create default content: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());

    throw $e;
}
}

private function createDefaultTheme(string $websiteId, array $websiteData): void
{
    $theme = strtolower($websiteData['theme'] ?? 'minimal');

    $themeSettingsByType = [
        'minimal' => [
            'primaryColor' => '#2563eb',
            'fontFamily' => 'Inter',
            'layoutStyle' => 'clean',
            'headerStyle' => 'simple',
            'buttonStyle' => 'rounded',
        ],
        'business' => [
            'primaryColor' => '#1d4ed8',
            'fontFamily' => 'Inter',
            'layoutStyle' => 'professional',
            'headerStyle' => 'corporate',
            'buttonStyle' => 'rounded',
        ],
        'blog' => [
            'primaryColor' => '#7c3aed',
            'fontFamily' => 'Georgia',
            'layoutStyle' => 'editorial',
            'headerStyle' => 'magazine',
            'buttonStyle' => 'pill',
        ],
    ];

    if (!isset($themeSettingsByType[$theme])) {
        $theme = 'minimal';
    }

    $themeId = $this->generateUuid();

    $stmt = $this->pdo->prepare("
        INSERT INTO themes (
            id,
            website_id,
            name,
            version,
            description,
            author,
            is_default,
            template_type,
            settings
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $themeId,
        $websiteId,
        ucfirst($theme) . ' Theme',
        '1.0.0',
        'Default ' . $theme . ' theme for this website',
        'CMS Platform',
        1,
        $theme,
        json_encode($themeSettingsByType[$theme], JSON_UNESCAPED_UNICODE),
    ]);
}

    private function createDefaultTemplates(string $websiteId, string $theme): void
{
    $theme = strtolower($theme);

    $templatesByTheme = [
        'minimal' => [
            [
                'name' => 'Minimal Home',
                'slug' => 'minimal-home',
                'page_type' => 'home',
                'layout_type' => 'landing-page',
                'sections' => ['hero', 'content'],
                'settings' => [
                    'container' => 'max-w-5xl',
                    'style' => 'minimal',
                    'showTitle' => true,
                ],
                'description' => 'Homepage template for minimal websites',
            ],
            [
                'name' => 'Minimal About',
                'slug' => 'minimal-about',
                'page_type' => 'about',
                'layout_type' => 'standard-page',
                'sections' => ['content'],
                'settings' => [
                    'container' => 'max-w-4xl',
                    'style' => 'minimal',
                    'showTitle' => true,
                ],
                'description' => 'About page template for minimal websites',
            ],
            [
                'name' => 'Minimal Contact',
                'slug' => 'minimal-contact',
                'page_type' => 'contact',
                'layout_type' => 'contact-page',
                'sections' => ['content', 'contact-info'],
                'settings' => [
                    'container' => 'max-w-4xl',
                    'style' => 'minimal',
                    'showContactInfo' => true,
                ],
                'description' => 'Contact page template for minimal websites',
            ],
        ],

        'business' => [
            [
                'name' => 'Business Home',
                'slug' => 'business-home',
                'page_type' => 'home',
                'layout_type' => 'landing-page',
                'sections' => ['hero', 'services-preview', 'about-preview', 'projects-preview', 'cta'],
                'settings' => [
                    'container' => 'max-w-7xl',
                    'style' => 'business',
                    'showHeroButton' => true,
                ],
                'description' => 'Homepage template for business websites',
            ],
            [
                'name' => 'Business About',
                'slug' => 'business-about',
                'page_type' => 'about',
                'layout_type' => 'standard-page',
                'sections' => ['content', 'mission', 'values'],
                'settings' => [
                    'container' => 'max-w-6xl',
                    'style' => 'business',
                    'showTitle' => true,
                ],
                'description' => 'About page template for business websites',
            ],
            [
                'name' => 'Business Services',
                'slug' => 'business-services',
                'page_type' => 'services',
                'layout_type' => 'services-page',
                'sections' => ['hero', 'services-grid', 'cta'],
                'settings' => [
                    'container' => 'max-w-7xl',
                    'style' => 'business',
                    'cards' => true,
                ],
                'description' => 'Services page template for business websites',
            ],
            [
                'name' => 'Business Projects',
                'slug' => 'business-projects',
                'page_type' => 'projects',
                'layout_type' => 'projects-page',
                'sections' => ['hero', 'projects-grid', 'cta'],
                'settings' => [
                    'container' => 'max-w-7xl',
                    'style' => 'business',
                    'cards' => true,
                ],
                'description' => 'Projects page template for business websites',
            ],
            [
                'name' => 'Business Contact',
                'slug' => 'business-contact',
                'page_type' => 'contact',
                'layout_type' => 'contact-page',
                'sections' => ['contact-info', 'contact-form', 'map'],
                'settings' => [
                    'container' => 'max-w-6xl',
                    'style' => 'business',
                    'showMap' => true,
                ],
                'description' => 'Contact page template for business websites',
            ],
        ],

        'blog' => [
            [
                'name' => 'Blog Home',
                'slug' => 'blog-home',
                'page_type' => 'home',
                'layout_type' => 'blog-home',
                'sections' => ['hero', 'featured-posts', 'latest-posts'],
                'settings' => [
                    'container' => 'max-w-7xl',
                    'style' => 'blog',
                    'showFeaturedPosts' => true,
                ],
                'description' => 'Homepage template for blog websites',
            ],
            [
                'name' => 'Blog Listing',
                'slug' => 'blog-list',
                'page_type' => 'blog',
                'layout_type' => 'blog-list',
                'sections' => ['posts-grid', 'categories-sidebar'],
                'settings' => [
                    'container' => 'max-w-7xl',
                    'style' => 'blog',
                    'sidebar' => true,
                ],
                'description' => 'Blog listing page template',
            ],
            [
                'name' => 'Blog Categories',
                'slug' => 'blog-categories',
                'page_type' => 'categories',
                'layout_type' => 'categories-page',
                'sections' => ['categories-grid'],
                'settings' => [
                    'container' => 'max-w-6xl',
                    'style' => 'blog',
                    'cards' => true,
                ],
                'description' => 'Categories page template for blog websites',
            ],
            [
                'name' => 'Blog About',
                'slug' => 'blog-about',
                'page_type' => 'about',
                'layout_type' => 'standard-page',
                'sections' => ['content', 'author-box'],
                'settings' => [
                    'container' => 'max-w-4xl',
                    'style' => 'blog',
                    'showTitle' => true,
                ],
                'description' => 'About page template for blog websites',
            ],
            [
                'name' => 'Blog Contact',
                'slug' => 'blog-contact',
                'page_type' => 'contact',
                'layout_type' => 'contact-page',
                'sections' => ['content', 'contact-info'],
                'settings' => [
                    'container' => 'max-w-4xl',
                    'style' => 'blog',
                    'showContactInfo' => true,
                ],
                'description' => 'Contact page template for blog websites',
            ],
        ],
    ];

    if (!isset($templatesByTheme[$theme])) {
        $theme = 'minimal';
    }

    foreach ($templatesByTheme[$theme] as $template) {
        $this->websiteModel->createTemplate(
            $websiteId,
            $template['name'],
            $template['slug'],
            $theme,
            $template['page_type'],
            $template['layout_type'],
            $template['sections'],
            $template['settings'],
            $template['description']
        );
    }
}

private function generateUuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

    private function createDefaultPages(string $websiteId, string $defaultLanguage, string $theme): void
{
    $defaultPages = $this->getDefaultPagesByTheme($theme, $defaultLanguage);

    error_log("Creating " . count($defaultPages) . " default pages for website: $websiteId");

    foreach ($defaultPages as $index => $page) {
        try {
            error_log("Creating page $index: " . $page['slug'] . " with template: " . $page['template']);

            $pageId = $this->websiteModel->createDefaultPage($websiteId, $page);

            if (!$pageId) {
                throw new Exception("Failed to create page: " . $page['slug']);
            }

            $this->createDefaultSectionsForPage($websiteId, $pageId, $page, $theme, $defaultLanguage);

            error_log("Successfully created page and sections: " . $page['slug']);
        } catch (Exception $e) {
            error_log("Error creating page " . $page['slug'] . ": " . $e->getMessage());
            throw $e;
        }
    }
}

private function getDefaultSectionsByTemplate(string $template, array $page, string $theme): array
{
    $title = $page['title'] ?? '';
    $content = $page['content'] ?? '';

    $sectionsByTemplate = [
        'minimal-home' => [
            [
                'section_key' => 'hero',
                'section_type' => 'hero',
                'title' => 'Welcome',
                'subtitle' => 'A clean and simple website',
                'content' => 'Build a beautiful online presence with a minimal design.',
                'button_text' => 'Learn More',
                'button_link' => '/about',
            ],
            [
                'section_key' => 'content',
                'section_type' => 'content',
                'title' => $title,
                'content' => $content,
            ],
        ],

        'minimal-about' => [
            [
                'section_key' => 'content',
                'section_type' => 'content',
                'title' => $title,
                'content' => $content,
            ],
        ],

        'minimal-contact' => [
            [
                'section_key' => 'contact-info',
                'section_type' => 'contact',
                'title' => 'Contact',
                'content' => 'Add your contact information here.',
            ],
        ],

        'business-home' => [
            [
                'section_key' => 'hero',
                'section_type' => 'hero',
                'title' => 'Professional solutions for your business',
                'subtitle' => 'Grow your company with a modern digital presence.',
                'content' => 'We help businesses present their services, projects, and brand online.',
                'button_text' => 'Contact Us',
                'button_link' => '/contact',
            ],
            [
                'section_key' => 'services-preview',
                'section_type' => 'services',
                'title' => 'Our Services',
                'subtitle' => 'What we offer',
                'content' => 'Present your main business services here.',
                'settings' => [
                    'items' => [
                        ['title' => 'Consulting', 'description' => 'Professional advice for your business.'],
                        ['title' => 'Development', 'description' => 'Digital solutions adapted to your needs.'],
                        ['title' => 'Support', 'description' => 'Reliable support for your projects.'],
                    ],
                ],
            ],
            [
                'section_key' => 'about-preview',
                'section_type' => 'about',
                'title' => 'About Us',
                'content' => 'Learn more about our company, mission, and values.',
                'button_text' => 'Read More',
                'button_link' => '/about',
            ],
            [
                'section_key' => 'projects-preview',
                'section_type' => 'projects',
                'title' => 'Our Projects',
                'content' => 'Showcase your previous work and achievements.',
                'settings' => [
                    'items' => [
                        ['title' => 'Project One', 'description' => 'Short project description.'],
                        ['title' => 'Project Two', 'description' => 'Short project description.'],
                        ['title' => 'Project Three', 'description' => 'Short project description.'],
                    ],
                ],
            ],
            [
                'section_key' => 'cta',
                'section_type' => 'cta',
                'title' => 'Ready to work together?',
                'subtitle' => 'Let’s build something great.',
                'button_text' => 'Get Started',
                'button_link' => '/contact',
            ],
        ],

        'business-about' => [
            [
                'section_key' => 'content',
                'section_type' => 'content',
                'title' => $title,
                'content' => $content,
            ],
            [
                'section_key' => 'values',
                'section_type' => 'values',
                'title' => 'Our Values',
                'content' => 'Quality, trust, innovation, and professionalism.',
            ],
        ],

        'business-services' => [
            [
                'section_key' => 'services-grid',
                'section_type' => 'services',
                'title' => 'Our Services',
                'content' => 'Present your main services here.',
                'settings' => [
                    'items' => [
                        ['title' => 'Service One', 'description' => 'Service description.'],
                        ['title' => 'Service Two', 'description' => 'Service description.'],
                        ['title' => 'Service Three', 'description' => 'Service description.'],
                    ],
                ],
            ],
        ],

        'business-projects' => [
            [
                'section_key' => 'projects-grid',
                'section_type' => 'projects',
                'title' => 'Our Projects',
                'content' => 'Showcase your previous work and achievements.',
            ],
        ],

        'business-contact' => [
            [
                'section_key' => 'contact-info',
                'section_type' => 'contact',
                'title' => 'Contact Us',
                'content' => 'Get in touch with our team.',
            ],
        ],

        'blog-home' => [
            [
                'section_key' => 'hero',
                'section_type' => 'hero',
                'title' => 'Welcome to the Blog',
                'subtitle' => 'Stories, updates, and articles',
                'content' => 'Read our latest posts and discover new ideas.',
            ],
            [
                'section_key' => 'featured-posts',
                'section_type' => 'posts',
                'title' => 'Featured Posts',
                'content' => 'Featured articles will appear here.',
            ],
            [
                'section_key' => 'latest-posts',
                'section_type' => 'posts',
                'title' => 'Latest Posts',
                'content' => 'Latest articles will appear here.',
            ],
        ],

        'blog-list' => [
            [
                'section_key' => 'posts-grid',
                'section_type' => 'posts',
                'title' => 'Blog',
                'content' => 'Browse all articles and updates here.',
            ],
        ],

        'blog-categories' => [
            [
                'section_key' => 'categories-grid',
                'section_type' => 'categories',
                'title' => 'Categories',
                'content' => 'Explore articles by category.',
            ],
        ],

        'blog-about' => [
            [
                'section_key' => 'content',
                'section_type' => 'content',
                'title' => $title,
                'content' => $content,
            ],
        ],

        'blog-contact' => [
            [
                'section_key' => 'contact-info',
                'section_type' => 'contact',
                'title' => 'Contact',
                'content' => 'Contact the blog author or editorial team.',
            ],
        ],
    ];

    return $sectionsByTemplate[$template] ?? [
        [
            'section_key' => 'content',
            'section_type' => 'content',
            'title' => $title,
            'content' => $content,
        ],
    ];
}

private function createDefaultSectionsForPage(
    string $websiteId,
    string $pageId,
    array $page,
    string $theme,
    string $language
): void {
    $template = $page['template'] ?? '';
    $slug = $page['slug'] ?? '';

    $sections = $this->getDefaultSectionsByTemplate($template, $page, $theme);

    foreach ($sections as $index => $section) {
        $this->websiteModel->createWebsiteSection(
            $websiteId,
            $pageId,
            $language,
            $section['section_key'],
            $section['section_type'],
            $section['title'] ?? '',
            $section['subtitle'] ?? null,
            $section['content'] ?? null,
            $section['image'] ?? null,
            $section['button_text'] ?? null,
            $section['button_link'] ?? null,
            $index + 1,
            true,
            $section['settings'] ?? []
        );
    }

    error_log("Created " . count($sections) . " sections for page: " . $slug);
}

private function getDefaultPagesByTheme(string $theme, string $language): array
{
    $theme = strtolower($theme);

    $pagesByTheme = [
        'minimal' => [
            [
                'title' => 'Home',
                'slug' => 'home',
                'template' => 'minimal-home',
                'content' => '<h1>Welcome</h1><p>This is a simple and clean website.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => true,
            ],
            [
                'title' => 'About',
                'slug' => 'about',
                'template' => 'minimal-about',
                'content' => '<h1>About</h1><p>Introduce yourself or your project here.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'template' => 'minimal-contact',
                'content' => '<h1>Contact</h1><p>Add your contact information here.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
        ],

        'business' => [
            [
                'title' => 'Home',
                'slug' => 'home',
                'template' => 'business-home',
                'content' => '<h1>Welcome to Our Business</h1><p>Professional solutions for your needs.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => true,
            ],
            [
                'title' => 'About Us',
                'slug' => 'about',
                'template' => 'business-about',
                'content' => '<h1>About Us</h1><p>Learn more about our company, mission, and values.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Services',
                'slug' => 'services',
                'template' => 'business-services',
                'content' => '<h1>Our Services</h1><p>Present your main services here.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Projects',
                'slug' => 'projects',
                'template' => 'business-projects',
                'content' => '<h1>Our Projects</h1><p>Showcase your previous work and achievements.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'template' => 'business-contact',
                'content' => '<h1>Contact Us</h1><p>Get in touch with our team.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
        ],

        'blog' => [
            [
                'title' => 'Home',
                'slug' => 'home',
                'template' => 'blog-home',
                'content' => '<h1>Welcome to the Blog</h1><p>Read our latest stories, updates, and articles.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => true,
            ],
            [
                'title' => 'Blog',
                'slug' => 'blog',
                'template' => 'blog-list',
                'content' => '<h1>Blog</h1><p>Browse all articles and updates here.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Categories',
                'slug' => 'categories',
                'template' => 'blog-categories',
                'content' => '<h1>Categories</h1><p>Explore articles by category.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'About',
                'slug' => 'about',
                'template' => 'blog-about',
                'content' => '<h1>About This Blog</h1><p>Tell readers about the purpose of this blog.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'template' => 'blog-contact',
                'content' => '<h1>Contact</h1><p>Contact the blog author or editorial team.</p>',
                'language' => $language,
                'status' => 'published',
                'is_homepage' => false,
            ],
        ],
    ];

    return $pagesByTheme[$theme] ?? $pagesByTheme['minimal'];
}

    private function createDefaultMenu(string $websiteId, string $defaultLanguage, string $theme): void
{
    $pages = $this->getDefaultPagesByTheme($theme, $defaultLanguage);

    $headerMenuItems = [];

    foreach ($pages as $index => $page) {
        $headerMenuItems[] = [
            'title' => $page['title'],
            'url' => $page['slug'] === 'home' ? '/' : '/' . $page['slug'],
            'order' => $index + 1,
        ];
    }

    $this->websiteModel->createDefaultMenu(
        $websiteId,
        'Header Menu',
        $headerMenuItems,
        $defaultLanguage,
        'header'
    );

    $this->websiteModel->createDefaultMenu(
        $websiteId,
        'Footer Menu',
        [],
        $defaultLanguage,
        'footer'
    );
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

    public function update(string $websiteId): void
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

        // Get user's global role
        $userRole = $this->getUserRole($userId);
        if (!$userRole) {
            $this->respondUnauthorized('User not found');
            return;
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $this->respondBadRequest('Invalid JSON input');
            return;
        }

        // Check if website exists and user has access
        if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
            $this->respondUnauthorized('Access denied for this website');
            return;
        }

        // Validate required fields
        if (empty($input['name'])) {
            $this->respondBadRequest('Website name is required');
            return;
        }

        // Prepare update data
        $updateData = [
            'name' => trim($input['name']),
            'client' => trim($input['client'] ?? ''),
            'domain' => trim($input['domain'] ?? ''),
            'theme' => $input['theme'] ?? 'minimal',
        ];

        try {
            $success = $this->websiteModel->updateWebsite($websiteId, $updateData);

            if (!$success) {
                $this->respondServerError('Failed to update website');
                return;
            }

            // Fetch updated website
            $updatedWebsite = $this->websiteModel->getWebsiteById($websiteId);

            echo json_encode([
                'status' => 'success',
                'message' => 'Website updated successfully',
                'website' => $updatedWebsite
            ]);
        } catch (Exception $e) {
            error_log('Website update exception: ' . $e->getMessage());
            $this->respondServerError('Failed to update website: ' . $e->getMessage());
        }
    }

    public function delete(string $websiteId): void
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

        // Check if website exists and user is the owner or super admin
        $website = $this->websiteModel->getWebsiteById($websiteId);

        if (!$website) {
            $this->respondBadRequest('Website not found');
            return;
        }

        // Only website owner or super admin can delete
        if ($website['created_by'] !== $userId) {
            // Check if user is super admin
            $userRole = $this->getUserRole($userId);
            if ($userRole !== 'super_admin') {
                $this->respondUnauthorized('Only the website owner or super admin can delete this website');
                return;
            }
        }

        try {
            $success = $this->websiteModel->deleteWebsite($websiteId);

            if (!$success) {
                $this->respondServerError('Failed to delete website');
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Website deleted successfully'
            ]);
        } catch (Exception $e) {
            error_log('Website delete exception: ' . $e->getMessage());
            $this->respondServerError('Failed to delete website: ' . $e->getMessage());
        }
    }

    public function checkDomain(): void
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

        $domain = $_GET['domain'] ?? null;
        $excludeWebsiteId = $_GET['exclude_id'] ?? null;

        if (!$domain) {
            $this->respondBadRequest('Domain is required');
            return;
        }

        try {
            $exists = $this->websiteModel->domainExists($domain, $excludeWebsiteId);
            echo json_encode([
                'status' => 'success',
                'exists' => $exists,
                'domain' => $domain
            ]);
        } catch (Exception $e) {
            $this->respondServerError('Failed to check domain availability');
        }
    }

    // ========== ACCESS MANAGEMENT ENDPOINTS ==========

    /**
     * GET /api/websites/{id}/access
     * List all users with access to a website
     */
    public function getWebsiteAccess(string $websiteId): void
    {
        try {
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
            $userRole = $this->getUserRole($userId);

            // Check if website exists and user has access
            if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
                $this->respondUnauthorized('Access denied for this website');
                return;
            }

            $accessList = $this->websiteModel->getWebsiteAccessList($websiteId);

            echo json_encode([
                'status' => 'success',
                'access' => $accessList,
            ]);
        } catch (Exception $e) {
            error_log('getWebsiteAccess error: ' . $e->getMessage());
            $this->respondServerError('Failed to fetch website access: ' . $e->getMessage());
        }
    }

    /**
     * POST /api/websites/{id}/access
     * Grant access to a user for a website
     */
    public function grantWebsiteAccess(string $websiteId): void
    {
        try {
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

            $currentUserId = $payload['sub'];
            $currentUserRole = $this->getUserRole($currentUserId);

            // Check if user has access to manage this website
            if (!$this->websiteModel->userCanAccessWebsite($currentUserId, $websiteId, $currentUserRole)) {
                $this->respondUnauthorized('Access denied for this website');
                return;
            }

            // Only owner/admin of the website can grant access
            $userWebsiteRole = $this->websiteModel->getUserWebsiteRole($currentUserId, $websiteId);
            if ($userWebsiteRole !== 'owner' && $userWebsiteRole !== 'admin' && $currentUserRole !== 'super_admin') {
                $this->respondForbidden('Only website owner/admin can grant access');
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['userId']) || empty($input['role'])) {
                $this->respondBadRequest('User ID and role are required');
                return;
            }

            $targetUserId = $input['userId'];
            $role = $input['role'];

            // Validate role
            $validRoles = ['owner', 'admin', 'editor', 'viewer'];
            if (!in_array($role, $validRoles)) {
                $this->respondBadRequest('Invalid role');
                return;
            }

            // Admin cannot assign 'owner' role
            if ($userWebsiteRole === 'admin' && $role === 'owner') {
                $this->respondForbidden('Only owner can assign owner role');
                return;
            }

            $success = $this->websiteModel->grantWebsiteAccessWithRole($targetUserId, $websiteId, $role, $currentUserId);

            if (!$success) {
                $this->respondServerError('Failed to grant access');
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Access granted successfully'
            ]);
        } catch (Exception $e) {
            error_log('grantWebsiteAccess error: ' . $e->getMessage());
            $this->respondServerError('Failed to grant access: ' . $e->getMessage());
        }
    }

    /**
     * PUT /api/websites/{id}/access/{userId}
     * Update a user's role for a website
     */
    public function updateWebsiteAccess(string $websiteId, string $targetUserId): void
    {
        try {
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

            $currentUserId = $payload['sub'];
            $currentUserRole = $this->getUserRole($currentUserId);

            // Check if user has access to manage this website
            if (!$this->websiteModel->userCanAccessWebsite($currentUserId, $websiteId, $currentUserRole)) {
                $this->respondUnauthorized('Access denied for this website');
                return;
            }

            // Only owner/admin can update roles
            $userWebsiteRole = $this->websiteModel->getUserWebsiteRole($currentUserId, $websiteId);
            if ($userWebsiteRole !== 'owner' && $userWebsiteRole !== 'admin' && $currentUserRole !== 'super_admin') {
                $this->respondForbidden('Only website owner/admin can update roles');
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['role'])) {
                $this->respondBadRequest('Role is required');
                return;
            }

            $newRole = $input['role'];

            // Validate role
            $validRoles = ['owner', 'admin', 'editor', 'viewer'];
            if (!in_array($newRole, $validRoles)) {
                $this->respondBadRequest('Invalid role');
                return;
            }

            // Prevent demoting owner
            $targetUserRole = $this->websiteModel->getUserWebsiteRole($targetUserId, $websiteId);
            if ($targetUserRole === 'owner' && $newRole !== 'owner') {
                $this->respondForbidden('Cannot demote website owner');
                return;
            }

            $success = $this->websiteModel->updateUserWebsiteRole($targetUserId, $websiteId, $newRole);

            if (!$success) {
                $this->respondServerError('Failed to update role');
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Role updated successfully'
            ]);
        } catch (Exception $e) {
            error_log('updateWebsiteAccess error: ' . $e->getMessage());
            $this->respondServerError('Failed to update role: ' . $e->getMessage());
        }
    }

    /**
     * DELETE /api/websites/{id}/access/{userId}
     * Revoke a user's access to a website
     */
    public function revokeWebsiteAccess(string $websiteId, string $targetUserId): void
    {
        try {
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

            $currentUserId = $payload['sub'];
            $currentUserRole = $this->getUserRole($currentUserId);

            // Check if user has access to manage this website
            if (!$this->websiteModel->userCanAccessWebsite($currentUserId, $websiteId, $currentUserRole)) {
                $this->respondUnauthorized('Access denied for this website');
                return;
            }

            // Only owner/admin can revoke access
            $userWebsiteRole = $this->websiteModel->getUserWebsiteRole($currentUserId, $websiteId);
            if ($userWebsiteRole !== 'owner' && $userWebsiteRole !== 'admin' && $currentUserRole !== 'super_admin') {
                $this->respondForbidden('Only website owner/admin can revoke access');
                return;
            }

            // Prevent revoking owner
            $targetUserRole = $this->websiteModel->getUserWebsiteRole($targetUserId, $websiteId);
            if ($targetUserRole === 'owner') {
                $this->respondForbidden('Cannot revoke owner access');
                return;
            }

            $success = $this->websiteModel->revokeWebsiteAccess($targetUserId, $websiteId);

            if (!$success) {
                $this->respondServerError('Failed to revoke access');
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Access revoked successfully'
            ]);
        } catch (Exception $e) {
            error_log('revokeWebsiteAccess error: ' . $e->getMessage());
            $this->respondServerError('Failed to revoke access: ' . $e->getMessage());
        }
    }

    private function respondForbidden(string $message): void
    {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
}