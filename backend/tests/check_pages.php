<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM pages');
    $result = $stmt->fetch();
    echo 'Pages count: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT id, title, slug, language, website_id FROM pages LIMIT 10');
    $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo 'Existing pages:' . PHP_EOL;
    foreach ($pages as $page) {
        echo '- ' . $page['title'] . ' (slug: ' . $page['slug'] . ', lang: ' . $page['language'] . ', website: ' . $page['website_id'] . ')' . PHP_EOL;
    }

    // Check users table
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $result = $stmt->fetch();
    echo PHP_EOL . 'Users count: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT id, name, email, role FROM users LIMIT 5');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo 'Existing users:' . PHP_EOL;
    foreach ($users as $user) {
        echo '- ' . $user['name'] . ' (' . $user['email'] . ', role: ' . $user['role'] . ', id: ' . $user['id'] . ')' . PHP_EOL;
    }

    // Check websites table
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM websites');
    $result = $stmt->fetch();
    echo PHP_EOL . 'Websites count: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT id, name, domain FROM websites LIMIT 5');
    $websites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo 'Existing websites:' . PHP_EOL;
    foreach ($websites as $website) {
        echo '- ' . $website['name'] . ' (' . $website['domain'] . ', id: ' . $website['id'] . ')' . PHP_EOL;
    }

} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}