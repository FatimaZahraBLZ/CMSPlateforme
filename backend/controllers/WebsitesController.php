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
            $this->respondServerError('Failed to create website: ' . $e->getMessage());
        }
    }

    private function createDefaultContent(string $websiteId, array $websiteData): void
    {
        try {
            error_log("Starting to create default content for website: $websiteId");
            
            // Create default pages
            error_log("Creating default pages for website: $websiteId");
            $this->createDefaultPages($websiteId, $websiteData['defaultLanguage']);
            error_log("Default pages created successfully");

            // Create default menu
            error_log("Creating default menu for website: $websiteId");
            $this->createDefaultMenu($websiteId, $websiteData['defaultLanguage']);
            error_log("Default menu created successfully");

            // Create default settings
            error_log("Creating default settings for website: $websiteId");
            $this->createDefaultSettings($websiteId);
            error_log("Default settings created successfully");

        } catch (Exception $e) {
            // Log error but don't fail the website creation
            error_log('Failed to create default content: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
        }
    }

    private function createDefaultPages(string $websiteId, string $defaultLanguage): void
    {
        $defaultPages = [
            [
                'title' => 'Home',
                'slug' => 'home',
                'content' => $this->getDefaultPageContent('home', $defaultLanguage),
                'language' => $defaultLanguage,
                'status' => 'published',
                'is_homepage' => true
            ],
            [
                'title' => 'About',
                'slug' => 'about',
                'content' => $this->getDefaultPageContent('about', $defaultLanguage),
                'language' => $defaultLanguage,
                'status' => 'published',
                'is_homepage' => false
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'content' => $this->getDefaultPageContent('contact', $defaultLanguage),
                'language' => $defaultLanguage,
                'status' => 'published',
                'is_homepage' => false
            ]
        ];

        error_log("Creating " . count($defaultPages) . " default pages for website: $websiteId");
        
        foreach ($defaultPages as $index => $page) {
            try {
                error_log("Creating page $index: " . $page['slug']);
                $this->websiteModel->createDefaultPage($websiteId, $page);
                error_log("Successfully created page: " . $page['slug']);
            } catch (Exception $e) {
                error_log("Error creating page " . $page['slug'] . ": " . $e->getMessage());
                throw $e;
            }
        }
    }

    private function createDefaultMenu(string $websiteId, string $defaultLanguage): void
    {
        // Create Header Menu with default items (Home, About, Contact)
        $headerMenuItems = [
            ['title' => 'Home', 'url' => '/', 'order' => 1],
            ['title' => 'About', 'url' => '/about', 'order' => 2],
            ['title' => 'Contact', 'url' => '/contact', 'order' => 3]
        ];

        $this->websiteModel->createDefaultMenu($websiteId, 'Header Menu', $headerMenuItems, $defaultLanguage, 'header');

        // Create Footer Menu (empty)
        $this->websiteModel->createDefaultMenu($websiteId, 'Footer Menu', [], $defaultLanguage, 'footer');
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