<?php
// backend/index.php

header('Content-Type: application/json');

// CORS handling
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:3000', 'http://127.0.0.1:5173'];

if (in_array($origin, $allowed_origins) || strpos($origin, 'localhost') !== false) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/WebsitesController.php';
require_once __DIR__ . '/controllers/PagesController.php';
require_once __DIR__ . '/controllers/UsersController.php';
require_once __DIR__ . '/controllers/PublicController.php';


$pdo = getPDO();
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request_uri, PHP_URL_PATH);
$path = strtolower(trim($path));
$method = $_SERVER['REQUEST_METHOD'];

// Basic API router
if (preg_match('#^/api/auth/login$#', $path) && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
    exit;
}

if ($path === '/api/auth/validate' && $method === 'GET') {
    $controller = new AuthController($pdo);
    $controller->validate();
    exit;
}

if ($path === '/api/websites' && $method === 'GET') {
    $controller = new WebsitesController($pdo);
    $controller->index();
    exit;
}

if ($path === '/api/websites' && $method === 'POST') {
    $controller = new WebsitesController($pdo);
    $controller->create();
    exit;
}

if ($path === '/api/websites/check-domain' && $method === 'GET') {
    $controller = new WebsitesController($pdo);
    $controller->checkDomain();
    exit;
}

if (preg_match('#^/api/websites/([^/]+)$#', $path, $matches)) {
    $websiteId = $matches[1];
    $controller = new WebsitesController($pdo);

    if ($method === 'PUT') {
        $controller->update($websiteId);
        exit;
    }

    if ($method === 'DELETE') {
        $controller->delete($websiteId);
        exit;
    }
}

if ($path === '/api/pages' && $method === 'GET') {
    $controller = new PagesController($pdo);
    $controller->index();
    exit;
}

if ($path === '/api/pages/check-slug' && $method === 'GET') {
    $controller = new PagesController($pdo);
    $controller->checkSlug();
    exit;
}

if ($path === '/api/pages' && $method === 'POST') {
    $controller = new PagesController($pdo);
    $controller->create();
    exit;
}

if (preg_match('#^/api/pages/([^/]+)$#', $path, $matches)) {
    $pageId = $matches[1];
    $controller = new PagesController($pdo);

    if ($method === 'PUT') {
        $controller->update($pageId);
        exit;
    }

    if ($method === 'DELETE') {
        $controller->delete($pageId);
        exit;
    }
}

if ($path === '/api/users' && $method === 'GET') {
    $controller = new UsersController($pdo);
    $controller->index();
    exit;
}

if ($path === '/api/users/counts' && $method === 'GET') {
    $controller = new UsersController($pdo);
    $controller->getUserCountsByRole();
    exit;
}

if ($path === '/api/users' && $method === 'POST') {
    $controller = new UsersController($pdo);
    $controller->create();
    exit;
}

if (preg_match('#^/api/users/([^/]+)$#', $path, $matches)) {
    $userId = $matches[1];
    $controller = new UsersController($pdo);

    if ($method === 'PUT') {
        $controller->update($userId);
        exit;
    }

    if ($method === 'DELETE') {
        $controller->delete($userId);
        exit;
    }
}

if ($path === '/api/ping' && $method === 'GET') {
    echo json_encode(['status' => 'success', 'message' => 'API is alive']);
    exit;
}

// Setup endpoint
if ($path === '/api/setup' && $method === 'POST') {
    require_once __DIR__ . '/api_setup.php';
    exit;
}

// Database migration endpoint
if ($path === '/api/migrate' && $method === 'POST') {
    require_once __DIR__ . '/migrate_database.php';
    exit;
}

// Diagnostic endpoint (no auth required for troubleshooting)
if ($path === '/api/diagnose' && $method === 'GET') {
    try {
        require_once __DIR__ . '/models/UserModel.php';
        $userModel = new UserModel($pdo);
        $allUsers = $userModel->getAllUsers();
        
        // Check if users table exists
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'");
        $stmt->execute([DB_NAME]);
        $tableExists = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        echo json_encode([
            'status' => 'success',
            'database' => DB_NAME,
            'users_table_exists' => (bool)$tableExists,
            'user_count' => count($allUsers),
            'users' => array_map(function($user) {
                return [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'status' => $user['status']
                ];
            }, $allUsers)
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Diagnostic error: ' . $e->getMessage()
        ]);
        exit;
    }
}

// PUBLIC API - Get website by subdomain
if ($path === '/api/public/website' && $method === 'GET') {
    $controller = new PublicController($pdo);
    $controller->getWebsiteBySubdomain();
    exit;
}

// PUBLIC API - Get website by domain
if ($path === '/api/public/website-by-domain' && $method === 'GET') {
    $controller = new PublicController($pdo);
    $controller->getWebsiteByDomain();
    exit;
}

// PUBLIC API - Get pages for website
if ($path === '/api/public/pages' && $method === 'GET') {
    $controller = new PublicController($pdo);
    $controller->getPages();
    exit;
}

// PUBLIC API - Get single page
if ($path === '/api/public/page' && $method === 'GET') {
    $controller = new PublicController($pdo);
    $controller->getPage();
    exit;
}

http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
