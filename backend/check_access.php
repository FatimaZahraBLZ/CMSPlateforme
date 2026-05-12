<?php
require_once __DIR__ . '/config.php';

$pdo = getPDO();

echo "=== Super Admin Access Check ===\n\n";

$stmt = $pdo->prepare("SELECT * FROM user_website_access WHERE user_id = ?");
$stmt->execute(['00000000-0000-0000-0000-000000000001']);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Super Admin access records: " . count($rows) . "\n";
var_dump($rows);

echo "\n\n=== All users with super_admin role ===\n";
$stmt = $pdo->prepare("SELECT id, name, role FROM users WHERE role = 'super_admin'");
$stmt->execute();
$superAdmins = $stmt->fetchAll(PDO::FETCH_ASSOC);
var_dump($superAdmins);

echo "\n\n=== All user_website_access records ===\n";
$stmt = $pdo->prepare("SELECT user_id, website_id, role FROM user_website_access LIMIT 10");
$stmt->execute();
$access = $stmt->fetchAll(PDO::FETCH_ASSOC);
var_dump($access);
