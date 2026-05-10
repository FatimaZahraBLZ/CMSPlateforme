/**
 * Subdomain Service
 * Handles multi-tenant subdomain detection and routing
 * 
 * Examples:
 * - client1.localhost:5173 → "client1"
 * - client2.localhost:5173 → "client2"
 * - admin.localhost:5173 → "admin"
 * - localhost:5173 → null (main platform)
 * - yourcms.com → null (main platform)
 * - client1.yourcms.com → "client1"
 */

export class SubdomainService {
  /**
   * Extract subdomain from current hostname
   * Returns null if no subdomain (main platform)
   */
  static getSubdomain(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Single part → just "localhost" or single domain name
    if (parts.length === 1) {
      return null;
    }

    // Two or more parts
    // localhost:5173 → hostname = "localhost" (already handled above)
    // client1.localhost → ["client1", "localhost"] → return "client1"
    // client1.yourcms.com → ["client1", "yourcms", "com"] → return "client1"
    // yourcms.com → ["yourcms", "com"] → return null (main domain only)
    
    if (parts.length >= 2) {
      // For localhost development: testedit.localhost has subdomain
      // For production: client1.yourcms.com has subdomain
      
      // If last part is "localhost", we have a subdomain in first part
      if (parts[parts.length - 1] === 'localhost' && parts.length >= 2) {
        return parts[0];
      }
      
      // For production domains like yourcms.com or client1.yourcms.com
      // If we have 3+ parts, first is subdomain
      if (parts.length >= 3) {
        return parts[0];
      }
    }

    return null;
  }

  /**
   * Get the main domain (without subdomain)
   * Examples:
   * - "client1.localhost" → "localhost"
   * - "client1.yourcms.com" → "yourcms.com"
   */
  static getMainDomain(): string {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // If it ends with localhost and has a subdomain, return "localhost"
    if (parts[parts.length - 1] === 'localhost' && parts.length >= 2) {
      return 'localhost';
    }

    // If 3+ parts (like client1.yourcms.com), return everything except first part
    if (parts.length >= 3) {
      return parts.slice(1).join('.');
    }

    // Otherwise return the full hostname
    return hostname;
  }

  /**
   * Get full domain with port
   */
  static getFullHost(): string {
    return window.location.host; // includes port if present
  }

  /**
   * Check if running on a client subdomain
   */
  static isClientSubdomain(): boolean {
    return this.getSubdomain() !== null;
  }

  /**
   * Check if running on main platform
   */
  static isMainPlatform(): boolean {
    return !this.isClientSubdomain();
  }

  /**
   * Build URL for a subdomain
   * Example: buildSubdomainUrl('client1') → "http://client1.localhost:5173"
   */
  static buildSubdomainUrl(subdomain: string): string {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const mainDomain = this.getMainDomain();

    return `${protocol}//${subdomain}.${mainDomain}${port}`;
  }

  /**
   * Get API base URL (always points to main platform)
   * This ensures all API calls go to the main backend
   */
  static getApiBaseUrl(): string {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const mainDomain = this.getMainDomain();

    // For localhost, we want to use the PHP backend port
    if (mainDomain === 'localhost') {
      return `${protocol}//localhost:8001`;
    }

    return `${protocol}//${mainDomain}${port}`;
  }

  /**
   * Log subdomain info (useful for debugging)
   */
  static debugInfo(): void {
    console.group('🔗 Subdomain Info');
    console.log('Hostname:', window.location.hostname);
    console.log('Subdomain:', this.getSubdomain());
    console.log('Main Domain:', this.getMainDomain());
    console.log('Is Client Subdomain:', this.isClientSubdomain());
    console.log('API Base URL:', this.getApiBaseUrl());
    console.groupEnd();
  }

  /**
   * Get the current full domain/hostname for database lookups
   * This is used when switching to domain-based routing
   * Examples:
   * - "client1.localhost" → "client1.localhost"
   * - "client1.cms" → "client1.cms"
   */
  static getCurrentDomain(): string {
    return window.location.hostname;
  }

  /**
   * Check if a domain matches the current location
   */
  static isDomainMatch(domain: string): boolean {
    return this.getCurrentDomain().toLowerCase() === domain.toLowerCase();
  }

  /**
   * Build URL for a domain-based location
   * Examples:
   * - buildDomainUrl('client1.cms') → "http://client1.cms"
   * - buildDomainUrl('mysite.example.com') → "http://mysite.example.com"
   */
  static buildDomainUrl(domain: string): string {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${domain}${port}`;
  }
}
