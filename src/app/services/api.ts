// Mock API service for future PHP backend integration
// This file provides a structure for API calls that will eventually connect to your PHP backend

export class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8001') {
    this.baseUrl = baseUrl;
  }

  get baseURL(): string {
    return this.baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('cms_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }



  // Authentication
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      console.log('Login response:', { status: res.status, data });

      if (!res.ok) {
        console.error('Login failed:', res.status, data);
        throw new Error(data?.message || `Login failed (${res.status})`);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    // If using session backend route, call it here. For now cleanup local storage.
    return Promise.resolve({ success: true });
  }

  async validateToken() {
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      console.log('Validating token with backend, token starts with:', token.substring(0, 20) + '...');

      const res = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      console.log('Validate token response status:', res.status);
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text:', await res.text());
        throw new Error('Invalid response format from server');
      }

      if (!res.ok) {
        console.warn('Token validation failed:', data);
        throw new Error(data?.message || 'Token validation failed');
      }

      console.log('Token validation successful');
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  // Public - Get website by subdomain (NO AUTH)
  async getPublicWebsite(subdomain: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/public/website?subdomain=${subdomain}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Website not found');
      }

      return data;
    } catch (error) {
      console.error('Get public website error:', error);
      throw error;
    }
  }

  // Public - Get pages for a website
  async getPublicPages(websiteId: string, language: string = 'en') {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/public/pages?website_id=${websiteId}&language=${language}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Pages not found');
      }

      return data;
    } catch (error) {
      console.error('Get public pages error:', error);
      throw error;
    }
  }

  // Public - Get a single page by slug
  async getPublicPage(websiteId: string, slug: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/public/page?website_id=${websiteId}&slug=${slug}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Page not found');
      }

      return data;
    } catch (error) {
      console.error('Get public page error:', error);
      throw error;
    }
  }

  // Public - Get menus with items for public website
  async getPublicMenus(websiteId: string, type?: string, language: string = 'en') {
    try {
      let url = `${this.baseUrl}/api/public/menus?website_id=${websiteId}&language=${language}`;
      if (type) {
        url += `&type=${type}`;
      }

      const res = await fetch(url);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch menus');
      }

      return data;
    } catch (error) {
      console.error('Get public menus error:', error);
      throw error;
    }
  }

  // Users
  async getUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch users');
      }

      // Ensure users array exists
      if (data && !data.users) {
        console.warn('API returned users but users array is missing, returning empty array');
        data.users = [];
      }

      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async createUser(userData: { name: string; email: string; password: string; role: string; status?: string }) {
    try {
      const res = await fetch(`${this.baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create user');
      }

      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<{ name: string; email: string; password: string; role: string; status: string }>) {
    try {
      const res = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update user');
      }

      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete user');
      }

      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
  try {
    const res = await fetch(`${this.baseUrl}/api/dashboard/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Failed to fetch dashboard stats (${res.status})`);
    }

    return data.stats;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error;
  }
}

  async getUserCountsByRole() {
    try {
      const res = await fetch(`${this.baseUrl}/api/users/counts`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch user counts');
      }

      return data.roleCounts || {};
    } catch (error) {
      console.error('Get user counts error:', error);
      throw error;
    }
  }

  // Websites
async getWebsites() {
  try {
    const res = await fetch(`${this.baseUrl}/api/websites`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Failed to fetch websites (${res.status})`);
    }

    return (data.websites || []).map((website: any) => ({
      id: website.id,
      name: website.name,
      client: website.client || '',
      domain: website.domain,
      subdomain: website.subdomain,
      status: website.status,

      defaultLanguage: website.defaultLanguage || website.default_language || 'en',
      languages: Array.isArray(website.languages)
        ? website.languages
        : JSON.parse(website.languages || '["en"]'),

      theme: website.theme || 'default',

      createdAt: website.createdAt || website.created_at,
      updatedAt: website.updatedAt || website.updated_at,

      userRole: website.userRole || website.user_role || website.role || 'editor',
    }));
  } catch (error) {
    console.error('Get websites error:', error);
    throw error;
  }
}

  async createWebsite(data: any) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to create website (${res.status})`);
      }
      return response;
    } catch (error) {
      console.error('Create website error:', error);
      throw error;
    }
  }

  async updateWebsite(id: string, data: any) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to update website (${res.status})`);
      }
      return response;
    } catch (error) {
      console.error('Update website error:', error);
      throw error;
    }
  }

  async deleteWebsite(id: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to delete website (${res.status})`);
      }
      return response;
    } catch (error) {
      console.error('Delete website error:', error);
      throw error;
    }
  }

  async checkDomain(domain: string, excludeWebsiteId?: string) {
    try {
      const params = new URLSearchParams({ domain });
      if (excludeWebsiteId) {
        params.append('exclude_id', excludeWebsiteId);
      }

      const res = await fetch(`${this.baseUrl}/api/websites/check-domain?${params}`, {
        headers: this.getAuthHeaders(),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to check domain (${res.status})`);
      }
      return response.exists || false;
    } catch (error) {
      console.error('Check domain error:', error);
      throw error;
    }
  }

  async getPublicWebsiteByDomain(domain: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/public/website-by-domain?domain=${encodeURIComponent(domain)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Website not found');
      }

      return data;
    } catch (error) {
      console.error('Get website by domain error:', error);
      throw error;
    }
  }

  // Pages
  async getPages(websiteId: string, language?: string) {
    try {
      const params = new URLSearchParams({ website_id: websiteId });
      if (language) {
        params.append('language', language);
      }
      const res = await fetch(`${this.baseUrl}/api/pages?${params.toString()}`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Failed to fetch pages (${res.status})`);
      }
      return data.pages || [];
    } catch (error) {
      console.error('Get pages error:', error);
      throw error;
    }
  }

  async createPage(data: any) {
    try {
      const res = await fetch(`${this.baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to create page (${res.status})`);
      }
      return response.page || response;
    } catch (error) {
      console.error('Create page error:', error);
      throw error;
    }
  }

  async updatePage(id: string, data: any) {
    try {
      const res = await fetch(`${this.baseUrl}/api/pages/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to update page (${res.status})`);
      }
      return response.page || response;
    } catch (error) {
      console.error('Update page error:', error);
      throw error;
    }
  }

  async deletePage(id: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/pages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to delete page (${res.status})`);
      }
      return response;
    } catch (error) {
      console.error('Delete page error:', error);
      throw error;
    }
  }

  async checkPageSlug(websiteId: string, slug: string, language: string = 'en', excludePageId?: string) {
    try {
      const params = new URLSearchParams({
        website_id: websiteId,
        slug,
        language,
      });
      if (excludePageId) {
        params.append('exclude_id', excludePageId);
      }

      const res = await fetch(`${this.baseUrl}/api/pages/check-slug?${params}`, {
        headers: this.getAuthHeaders(),
      });
      const response = await res.json();
      if (!res.ok) {
        throw new Error(response?.message || `Failed to check slug (${res.status})`);
      }
      return response.exists || false;
    } catch (error) {
      console.error('Check slug error:', error);
      throw error;
    }
  }

  // Articles
  async getArticles(websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  }

  async createArticle(data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Database Setup
  async setupDatabase() {
    try {
      const res = await fetch(`${this.baseUrl}/api/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to setup database');
      }

      return data;
    } catch (error) {
      console.error('Setup database error:', error);
      throw error;
    }
  }

  // Database Migration
  async migrateDatabase() {
    try {
      const res = await fetch(`${this.baseUrl}/api/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to migrate database');
      }

      return data;
    } catch (error) {
      console.error('Migrate database error:', error);
      throw error;
    }
  }

  // System Diagnostics
  async getDiagnostics() {
    try {
      const res = await fetch(`${this.baseUrl}/api/diagnose`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to get diagnostics');
      }

      return data;
    } catch (error) {
      console.error('Diagnostics error:', error);
      throw error;
    }
  }

  // ========== WEBSITE ACCESS MANAGEMENT ==========

  async getWebsiteAccess(websiteId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites/${encodeURIComponent(websiteId)}/access`, {
        headers: this.getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch website access');
      }
      return data.access || [];
    } catch (error) {
      console.error('Get website access error:', error);
      throw error;
    }
  }

  async grantWebsiteAccess(websiteId: string, userId: string, role: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites/${encodeURIComponent(websiteId)}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to grant access');
      }
      return data;
    } catch (error) {
      console.error('Grant website access error:', error);
      throw error;
    }
  }

  async updateWebsiteAccess(websiteId: string, userId: string, role: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/websites/${encodeURIComponent(websiteId)}/access/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update access');
      }
      return data;
    } catch (error) {
      console.error('Update website access error:', error);
      throw error;
    }
  }

  async getRecentPublishHistory(limit: number = 5) {
  try {
    const res = await fetch(
      `${this.baseUrl}/api/dashboard/recent-publish-history?limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch recent publish history');
    }

    return data.activities || [];
  } catch (error) {
    console.error('Get recent publish history error:', error);
    throw error;
  }
}

  async getActivityLogs(filters?: {
  search?: string;
  module?: string;
  action?: string;
  status?: string;
}) {
  try {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.module && filters.module !== 'all') params.append('module', filters.module);
    if (filters?.action && filters.action !== 'all') params.append('action', filters.action);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const res = await fetch(`${this.baseUrl}/api/activity-logs?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch activity logs');
    }

    return data;
  } catch (error) {
    console.error('Get activity logs error:', error);
    throw error;
  }
}

  async revokeWebsiteAccess(websiteId: string, userId: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/websites/${encodeURIComponent(websiteId)}/access/${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to revoke access');
      }

      return data;
    } catch (error) {
      console.error('Revoke website access error:', error);
      throw error;
    }
  }

  async getDefaultTheme(websiteId: string) {
  try {
    const res = await fetch(
      `${this.baseUrl}/api/themes/default?website_id=${encodeURIComponent(websiteId)}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch theme');
    }

    return data.theme;
  } catch (error) {
    console.error('Get default theme error:', error);
    throw error;
  }
}

async updateTheme(themeId: string, websiteId: string, settings: any, name?: string, description?: string) {
  try {
    const res = await fetch(`${this.baseUrl}/api/themes/${encodeURIComponent(themeId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({
        website_id: websiteId,
        settings,
        name,
        description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update theme');
    }

    return data;
  } catch (error) {
    console.error('Update theme error:', error);
    throw error;
  }
}

  async getPublicPlatformSettings() {
  const res = await fetch(`${this.baseUrl}/api/public/platform-settings`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch public platform settings');
  }

  return data.settings || {};
}

  async getPlatformSettings() {
    const res = await fetch(`${this.baseUrl}/api/platform-settings`, {
      headers: this.getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch platform settings');
    }

    return data.settings;
  }

  async getSiteSettings(websiteId: string) {
  const res = await fetch(
    `${this.baseUrl}/api/site-settings?website_id=${encodeURIComponent(websiteId)}`,
    {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch site settings');
  }

  return data.settings;
}

async updateSiteSettings(settings: any) {
  const res = await fetch(`${this.baseUrl}/api/site-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(settings),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to update site settings');
  }

  return data;
}

async getPublicTheme(websiteId: string) {
  const res = await fetch(
    `${this.baseUrl}/api/public/theme?website_id=${encodeURIComponent(websiteId)}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch public theme');
  }

  return data.theme;
}


async getPublicSiteSettings(websiteId: string) {
  const res = await fetch(
    `${this.baseUrl}/api/public/site-settings?website_id=${encodeURIComponent(websiteId)}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch public site settings');
  }

  return data.settings;
}

  async updatePlatformSettings(settings: any) {
    const res = await fetch(`${this.baseUrl}/api/platform-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ settings }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update platform settings');
    }

    return data;
  }
};
export const api = new ApiService();
export const API_BASE_URL = 'http://localhost:8001';

export const mediaApi = {
  list: async (websiteId: string) => {
    const res = await fetch(
      `${API_BASE_URL}/api/media?website_id=${websiteId}`
    );

    return res.json();
  },

  upload: async (
    websiteId: string,
    file: File,
    altText?: string
  ) => {
    const formData = new FormData();

    formData.append('website_id', websiteId);
    formData.append('file', file);

    if (altText) {
      formData.append('alt_text', altText);
    }

    const res = await fetch(
      `${API_BASE_URL}/api/media/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(
      `${API_BASE_URL}/api/media/${id}`,
      {
        method: 'DELETE',
      }
    );

    return res.json();
  },
};

