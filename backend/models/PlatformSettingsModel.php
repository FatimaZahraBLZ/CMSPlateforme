<?php

class PlatformSettingsModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query("
            SELECT setting_key, setting_value, setting_type
            FROM platform_settings
        ");

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $settings = [];

        foreach ($rows as $row) {
            $value = $row['setting_value'];

            if ($row['setting_type'] === 'boolean') {
                $value = $value === '1';
            } elseif ($row['setting_type'] === 'number') {
                $value = is_numeric($value) ? (int)$value : 0;
            } elseif ($row['setting_type'] === 'json') {
                $value = json_decode($value, true);
            }

            $settings[$row['setting_key']] = $value;
        }

        return $settings;
    }

    public function updateMany(array $settings, string $userId): bool
    {
        $allowed = [
            'platform_name' => 'string',
            'platform_url' => 'string',
            'platform_logo' => 'string',
            'default_language' => 'string',
            'timezone' => 'string',
            'date_format' => 'string',
            'max_upload_size' => 'number',
            'allowed_file_types' => 'string',
            'session_timeout' => 'number',
            'enable_registration' => 'boolean',
            'require_email_verification' => 'boolean',
            'enable_two_factor' => 'boolean',
        ];

        $stmt = $this->pdo->prepare("
            INSERT INTO platform_settings 
                (setting_key, setting_value, setting_type, updated_by)
            VALUES 
                (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                setting_value = VALUES(setting_value),
                setting_type = VALUES(setting_type),
                updated_by = VALUES(updated_by),
                updated_at = CURRENT_TIMESTAMP
        ");

        foreach ($settings as $key => $value) {
            if (!isset($allowed[$key])) {
                continue;
            }

            $type = $allowed[$key];

            if ($type === 'boolean') {
                $value = $value ? '1' : '0';
            } elseif ($type === 'json') {
                $value = json_encode($value);
            } else {
                $value = (string)$value;
            }

            $stmt->execute([$key, $value, $type, $userId]);
        }

        return true;
    }
}