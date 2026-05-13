<?php
// Clean up duplicate slug violations
require_once __DIR__ . '/config.php';

echo "🧹 Cleaning up duplicate page slugs...\n\n";

try {
    $pdo = getPDO();
    
    // Find duplicate pages (same website_id, slug, language)
    $stmt = $pdo->prepare("
        SELECT website_id, slug, language, COUNT(*) as count, GROUP_CONCAT(id) as ids
        FROM pages
        GROUP BY website_id, slug, language
        HAVING count > 1
    ");
    $stmt->execute();
    $duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($duplicates)) {
        echo "✅ No duplicate slugs found!\n";
        exit(0);
    }

    echo "Found " . count($duplicates) . " duplicate groups:\n";
    foreach ($duplicates as $dup) {
        echo "\n📌 Website: " . $dup['website_id'] . " | Slug: " . $dup['slug'] . " | Language: " . $dup['language'];
        echo "\n   Count: " . $dup['count'] . " | IDs: " . $dup['ids'] . "\n";

        // Get details of each duplicate
        $ids = explode(',', $dup['ids']);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        
        $detailStmt = $pdo->prepare("
            SELECT id, title, status, created_at, updated_at
            FROM pages
            WHERE id IN ($placeholders)
            ORDER BY created_at DESC
        ");
        $detailStmt->execute($ids);
        $details = $detailStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($details as $i => $detail) {
            echo "   [$i] ID: " . $detail['id'] . " | Title: " . $detail['title'] 
                 . " | Status: " . $detail['status'] . " | Created: " . $detail['created_at'] . "\n";
        }
    }

    echo "\n⚠️  Manual intervention required:\n";
    echo "1. Review the duplicate groups above\n";
    echo "2. Decide which ID to keep (usually the most recent)\n";
    echo "3. Delete the others manually or run the delete command\n";
    echo "\nExample to delete duplicate (keep the first, delete others):\n";
    foreach ($duplicates as $dup) {
        $ids = explode(',', $dup['ids']);
        if (count($ids) > 1) {
            $toDelete = array_slice($ids, 1);
            foreach ($toDelete as $id) {
                echo "DELETE FROM pages WHERE id = '" . $id . "';\n";
            }
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
