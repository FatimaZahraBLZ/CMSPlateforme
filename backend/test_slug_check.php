<?php
// Test the check-slug endpoint
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/PageModel.php';

// Simulate being behind the API server
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/pages/check-slug?website_id=0e2fed92-0cda-470b-a375-8ae56816390f&slug=home&language=en';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer fake_token'; // We'll test without auth first

// Mock JWT validation to test the slug check
class TestAuthService {
    public function validateJwt($token) {
        return ['sub' => '00000000-0000-0000-0000-000000000001'];
    }
}

// Test if the PageModel slugExists method works
$pdo = getPDO();
$pageModel = new PageModel($pdo);

echo "Testing slug availability checking:\n\n";

// Test 1: Check if 'home' slug exists in the website (should be true)
$exists = $pageModel->slugExists('0e2fed92-0cda-470b-a375-8ae56816390f', 'home', 'en');
echo "1. Slug 'home' in website 0e2fed92... (en): " . ($exists ? 'EXISTS' : 'NOT FOUND') . "\n";

// Test 2: Check if 'unknown' slug exists (should be false)
$exists = $pageModel->slugExists('0e2fed92-0cda-470b-a375-8ae56816390f', 'unknown', 'en');
echo "2. Slug 'unknown' in website 0e2fed92... (en): " . ($exists ? 'EXISTS' : 'NOT FOUND') . "\n";

// Test 3: Check if 'home' exists but exclude a specific page
$exists = $pageModel->slugExists('0e2fed92-0cda-470b-a375-8ae56816390f', 'home', 'en', '4c90c4b7-ea72-4e72-af09-2d3cb7c48223');
echo "3. Slug 'home' excluding the actual page: " . ($exists ? 'EXISTS' : 'NOT FOUND') . "\n";

// Test 4: Check 'home' in a different website
$exists = $pageModel->slugExists('cf585ed0-e57b-46e7-9312-0c0a2d71b9b3', 'home', 'en');
echo "4. Slug 'home' in website cf585ed0... (en): " . ($exists ? 'EXISTS' : 'NOT FOUND') . "\n";

// Test 5: Check 'about' in the second website (should be false)
$exists = $pageModel->slugExists('cf585ed0-e57b-46e7-9312-0c0a2d71b9b3', 'about', 'en');
echo "5. Slug 'about' in website cf585ed0... (en): " . ($exists ? 'EXISTS' : 'NOT FOUND') . "\n";
