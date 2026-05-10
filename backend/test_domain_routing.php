<?php
// Test domain-based routing
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/WebsiteModel.php';

$pdo = getPDO();
$websiteModel = new WebsiteModel($pdo);

echo "🔍 Testing Domain-Based Routing\n\n";

// Get all websites
$stmt = $pdo->query("SELECT id, name, subdomain, domain FROM websites ORDER BY created_at DESC");
$websites = $stmt->fetchAll();

echo "📋 Current Websites:\n";
foreach ($websites as $ws) {
    echo "  • " . $ws['name'] . "\n";
    echo "    Domain: " . $ws['domain'] . "\n";
    echo "    Subdomain: " . $ws['subdomain'] . "\n";
    echo "    ID: " . $ws['id'] . "\n\n";
}

echo "🧪 Domain Availability Tests:\n\n";

// Test 1: Check if known domain exists
if (!empty($websites)) {
    $testDomain = $websites[0]['domain'];
    $exists = $websiteModel->domainExists($testDomain);
    echo "1. Domain '" . $testDomain . "' exists: " . ($exists ? "✅ YES" : "❌ NO") . "\n";
    
    // Test 2: Check if domain exists but exclude current website
    $excludeId = $websites[0]['id'];
    $exists = $websiteModel->domainExists($testDomain, $excludeId);
    echo "2. Domain '" . $testDomain . "' (excluding self): " . ($exists ? "✅ YES" : "❌ NO") . "\n";
}

// Test 3: Check non-existent domain
$nonExistent = "nonexistent-domain-" . time() . ".cms";
$exists = $websiteModel->domainExists($nonExistent);
echo "3. Domain '" . $nonExistent . "' exists: " . ($exists ? "✅ YES" : "❌ NO") . "\n\n";

// Test 4: Get website by domain
if (!empty($websites)) {
    $testDomain = $websites[0]['domain'];
    $website = $websiteModel->getWebsiteByDomain($testDomain);
    if ($website) {
        echo "4. ✅ Retrieved website by domain: " . $website['name'] . "\n";
    } else {
        echo "4. ❌ Failed to retrieve website by domain\n";
    }
}

echo "\n✅ Domain routing tests complete!\n";
