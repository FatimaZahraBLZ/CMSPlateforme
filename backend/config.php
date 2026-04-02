<?php
// backend/config.php

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'cms_platform');
define('DB_USER', 'root');
define('DB_PASS', '');

define('DB_CHARSET', 'utf8mb4');

define('JWT_SECRET', 'super_secret_key_please_change');
define('JWT_ALGO', 'HS256');

// PDO options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

function getPDO(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $GLOBALS['options']);
        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed', 'message' => $ex->getMessage()]);
            exit;
        }
    }

    return $pdo;
}
