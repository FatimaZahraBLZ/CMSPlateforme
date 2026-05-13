<?php
// backend/check_pages_creation.php
// Quick check to see if pages are being created for a website

require_once __DIR__ . '/config.php';

$pdo = getPDO();

try {
    // Get latest website
    $stmt = $pdo->prepare("SELECT id, name, subdomain FROM websites ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $website = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$website) {
        echo json_encode(['error' => 'No websites found'], JSON_PRETTY_PRINT);
        exit;
    }

    $websiteId = $website['id'];
    echo "Latest website: " . json_encode($website, JSON_PRETTY_PRINT) . "\n\n";

    // First check table structure
    echo "=== PAGES TABLE STRUCTURE ===\n";
    $stmt = $pdo->query("DESCRIBE pages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT) . "\n\n";

    // Get pages for this website
    echo "=== PAGES FOR THIS WEBSITE ===\n";
    $stmt = $pdo->prepare("
        SELECT id, title, slug, language, status, created_by
        FROM pages 
        WHERE website_id = ?
        ORDER BY created_at ASC
    ");
    $stmt->execute([$websiteId]);
    $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Pages for this website: " . count($pages) . "\n";
    echo json_encode($pages, JSON_PRETTY_PRINT) . "\n\n";

    // Check for any pages at all in the database
    echo "=== TOTAL PAGES ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM pages");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total pages in database: " . $result['total'] . "\n\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString();
}
?>
