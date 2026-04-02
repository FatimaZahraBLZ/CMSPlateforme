// Mock API service for future PHP backend integration
// This file provides a structure for API calls that will eventually connect to your PHP backend

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
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

  // Websites
  async getWebsites() {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  }

  async createWebsite(data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async updateWebsite(id: string, data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async deleteWebsite(id: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Pages
  async getPages(websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  }

  async createPage(data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async updatePage(id: string, data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async deletePage(id: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
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

  async updateArticle(id: string, data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async deleteArticle(id: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Media
  async uploadMedia(file: File, websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true, url: '' });
  }

  async getMedia(websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  }

  async deleteMedia(id: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Users
  async getUsers() {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  }

  async createUser(data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async updateUser(id: string, data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  async deleteUser(id: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Settings
  async getSettings(websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({});
  }

  async updateSettings(websiteId: string, data: any) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }

  // Publish
  async publishWebsite(websiteId: string) {
    // TODO: Replace with actual API call
    return Promise.resolve({ success: true });
  }
}

export const api = new ApiService();
