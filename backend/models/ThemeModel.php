<?php
/**
 * ThemeModel - Manages themes and page templates
 * 
 * Handles:
 * - Theme CRUD operations
 * - Template management
 * - Theme settings
 * - Layout configuration
 */

class ThemeModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all themes for a website
     */
public function getThemesForWebsite(string $websiteId): array
{
    $stmt = $this->pdo->prepare("
        SELECT 
            id,
            website_id,
            name,
            version,
            template_type,
            description,
            author,
            is_default,
            settings,
            created_at,
            updated_at
        FROM themes
        WHERE website_id = ?
        ORDER BY name
    ");

    $stmt->execute([$websiteId]);

    return $stmt->fetchAll() ?: [];
}

    /**
     * Get theme by website and template type
     */
    public function getThemeByType(string $websiteId, string $templateType): ?array
{
    $stmt = $this->pdo->prepare("
        SELECT *
        FROM themes
        WHERE website_id = ?
        AND template_type = ?
        LIMIT 1
    ");

    $stmt->execute([$websiteId, $templateType]);

    return $stmt->fetch() ?: null;
}

    /**
     * Get default theme (standard-page) for website
     */
    public function getDefaultTheme(string $websiteId): ?array
    {
        return $this->getThemeByType($websiteId, 'standard-page');
    }

    /**
     * Create a new theme
     */
    public function createTheme(
    string $websiteId,
    string $name,
    string $templateType,
    ?string $description = null,
    ?array $settings = null
): ?string {

    $id = $this->generateUuid();

    $stmt = $this->pdo->prepare("
        INSERT INTO themes (
            id,
            website_id,
            name,
            version,
            template_type,
            description,
            settings
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $success = $stmt->execute([
        $id,
        $websiteId,
        $name,
        '1.0.0',
        $templateType,
        $description,
        $settings ? json_encode($settings) : null
    ]);

    return $success ? $id : null;
}

    /**
     * Update theme settings
     */
    public function updateTheme(string $themeId, array $data): bool
    {
        $allowedFields = ['name', 'description', 'settings'];
        $setClause = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setClause[] = "$field = ?";
                if ($field === 'settings') {
                    $params[] = json_encode($data[$field]);
                } else {
                    $params[] = $data[$field];
                }
            }
        }

        if (empty($setClause)) {
            return false;
        }

        $params[] = $themeId;

        $stmt = $this->pdo->prepare("
            UPDATE themes
            SET " . implode(', ', $setClause) . "
            WHERE id = ?
        ");

        return $stmt->execute($params);
    }

    /**
     * Get all templates for a website
     */
    public function getTemplatesForWebsite(string $websiteId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, website_id, name, slug, layout_type, header_component, footer_component, 
                   sidebar_enabled, description, created_at, updated_at
            FROM templates
            WHERE website_id = ?
            ORDER BY name
        ");
        $stmt->execute([$websiteId]);
        return $stmt->fetchAll();
    }

    /**
     * Get template by slug
     */
    public function getTemplateBySlug(string $websiteId, string $slug): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, website_id, name, slug, layout_type, header_component, footer_component, 
                   sidebar_enabled, description, created_at, updated_at
            FROM templates
            WHERE website_id = ? AND slug = ?
            LIMIT 1
        ");
        $stmt->execute([$websiteId, $slug]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Create a new template
     */
    public function createTemplate(
        string $websiteId,
        string $name,
        string $slug,
        string $layoutType = 'standard-page',
        ?string $headerComponent = null,
        ?string $footerComponent = null,
        bool $sidebarEnabled = false,
        ?string $description = null
    ): ?string {
        $id = $this->generateUuid();

        $stmt = $this->pdo->prepare("
            INSERT INTO templates (
                id, website_id, name, slug, layout_type, header_component, footer_component, 
                sidebar_enabled, description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $success = $stmt->execute([
            $id,
            $websiteId,
            $name,
            $slug,
            $layoutType,
            $headerComponent,
            $footerComponent,
            $sidebarEnabled ? 1 : 0,
            $description
        ]);

        return $success ? $id : null;
    }

    /**
     * Delete a template
     */
    public function deleteTemplate(string $templateId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM templates WHERE id = ?");
        return $stmt->execute([$templateId]);
    }

    /**
     * Get layout configuration for a page template
     * Returns the complete layout structure for rendering
     */
    public function getPageLayout(string $websiteId, string $templateType = 'default'): array
    {
        $theme = $this->getThemeByType($websiteId, $templateType);

        // Default layout structure
        $defaultLayout = [
            'header' => true,
            'footer' => true,
            'sidebar' => false,
            'breadcrumbs' => true,
            'metadata' => true,
            'featured_image' => true,
            'sections' => ['content']
        ];

        if (!$theme) {
            return $defaultLayout;
        }

        $settings = [];

if (!empty($theme['settings'])) {
    $decoded = json_decode($theme['settings'], true);

    if (is_array($decoded)) {
        $settings = $decoded;
    }
}
        return array_merge($defaultLayout, $settings);
    }

    /**
     * Generate UUID
     */
    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
