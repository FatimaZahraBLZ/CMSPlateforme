<?php

class MediaController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    private function uuid(): string {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public function index() {
        $websiteId = $_GET['website_id'] ?? null;

        if (!$websiteId) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'website_id is required']);
            return;
        }

        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                website_id,
                name,
                original_name,
                url,
                type,
                size,
                mime_type,
                alt_text,
                created_at
            FROM media_items
            WHERE website_id = ?
            ORDER BY created_at DESC
        ");

        $stmt->execute([$websiteId]);

        echo json_encode([
            'status' => 'success',
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    public function upload() {
        $websiteId = $_POST['website_id'] ?? null;
        $altText = $_POST['alt_text'] ?? null;

        if (!$websiteId || !isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'website_id and file are required']);
            return;
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Upload failed']);
            return;
        }

        $maxSize = 50 * 1024 * 1024;

        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'File too large. Max size is 50MB']);
            return;
        }

        $allowed = [
            'image/jpeg' => 'image',
            'image/png' => 'image',
            'image/webp' => 'image',
            'image/gif' => 'image',
            'video/mp4' => 'video',
            'application/pdf' => 'document'
        ];

        $mimeType = mime_content_type($file['tmp_name']);

        if (!isset($allowed[$mimeType])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'File type not allowed']);
            return;
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $type = $allowed[$mimeType];
        $id = $this->uuid();
        $safeName = $id . '.' . $extension;

        $uploadDir = __DIR__ . '/../uploads/media/' . $websiteId;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $targetPath = $uploadDir . '/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Could not save file']);
            return;
        }

        $url = '/uploads/media/' . $websiteId . '/' . $safeName;
        $uploadedBy = $_POST['uploaded_by'] ?? '00000000-0000-0000-0000-000000000001';

        $stmt = $this->pdo->prepare("
            INSERT INTO media_items
            (id, website_id, name, original_name, url, type, size, mime_type, alt_text, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $id,
            $websiteId,
            $safeName,
            $file['name'],
            $url,
            $type,
            $file['size'],
            $mimeType,
            $altText,
            $uploadedBy
        ]);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'id' => $id,
                'website_id' => $websiteId,
                'name' => $safeName,
                'original_name' => $file['name'],
                'url' => $url,
                'type' => $type,
                'size' => $file['size'],
                'mime_type' => $mimeType,
                'alt_text' => $altText,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM media_items WHERE id = ?");
        $stmt->execute([$id]);

        $media = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$media) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Media not found']);
            return;
        }

        $filePath = __DIR__ . '/..' . $media['url'];

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $delete = $this->pdo->prepare("DELETE FROM media_items WHERE id = ?");
        $delete->execute([$id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Media deleted successfully'
        ]);
    }
}