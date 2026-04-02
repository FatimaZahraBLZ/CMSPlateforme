<?php
// backend/index.php

header('Content-Type: application/json');

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$allowed_origins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Built-in PHP server router support (allow static files, route all others to index.php)
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $file = __DIR__ . $url;
    if (is_file($file)) {
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/controllers/AuthController.php';

$pdo = getPDO();
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Basic API router
if ($path === '/api/auth/login' && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
    exit;
}

if ($path === '/api/ping' && $method === 'GET') {
    echo json_encode(['status' => 'success', 'message' => 'API is alive']);
    exit;
}

http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
