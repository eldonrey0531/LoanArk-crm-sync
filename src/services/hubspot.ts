import StorageManager from '../utils/storage';

interface HubSpotConnection {
  id: string;
  isActive: boolean;
  lastUsed: number;
  retryCount: number;
}

interface ConnectionDetails {
  connected: boolean;
  total: number;
  error?: string;
  isDemo?: boolean;
}

interface HubSpotServiceConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

class HubSpotService {
  private static instance: HubSpotService;
  private connections: Map<string, HubSpotConnection> = new Map();
  private maxConnections = 5;
  private config: HubSpotServiceConfig;

  private constructor() {
    this.config = {
      baseURL: import.meta.env.VITE_HUBSPOT_API_URL || 'https://api.hubapi.com',
      timeout: parseInt(import.meta.env.VITE_HUBSPOT_TIMEOUT || '30000'),
      maxRetries: parseInt(import.meta.env.VITE_HUBSPOT_RETRY_ATTEMPTS || '3'),
      retryDelay: 1000,
    };
  }

  /**
   * Singleton pattern to ensure only one instance
   */
  static getInstance(): HubSpotService {
    if (!HubSpotService.instance) {
      HubSpotService.instance = new HubSpotService();
    }
    return HubSpotService.instance;
  }

  /**
   * Test HubSpot connection with caching and error handling
   */
  async testConnection(): Promise<ConnectionDetails> {
    const cacheKey = 'hubspot-test';

    // Check cache first
    const cached = StorageManager.getCachedApiResponse(cacheKey);
    if (cached) {
      console.log('🚀 Using cached connection test result');
      return cached;
    }

    try {
      console.log('🔍 Testing HubSpot connection...');

      // Use existing Netlify function for consistency
      const response = await this.makeRequest('/.netlify/functions/hubspot-test', {
        method: 'GET',
        timeout: this.config.timeout,
      });

      const data = await response.json();
      const result: ConnectionDetails = {
        ...data,
        isDemo: false,
      };

      // Cache successful results
      if (result.connected) {
        StorageManager.cacheApiResponse(cacheKey, result);
      }

      console.log('📊 HubSpot connection result:', result);
      return result;
    } catch (error) {
      console.error('💥 HubSpot connection test failed:', error);

      const errorResult: ConnectionDetails = {
        connected: false,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        isDemo: false,
      };

      return errorResult;
    }
  }

  /**
   * Fetch HubSpot contacts with pagination support
   */
  async fetchContacts(params: any = {}): Promise<any> {
    const cacheKey = `hubspot-contacts-${JSON.stringify(params)}`;

    // Check cache for recent data
    const cached = StorageManager.getCachedApiResponse(cacheKey);
    if (cached) {
      console.log('🚀 Using cached contacts data');
      return cached;
    }

    try {
      console.log('📡 Fetching HubSpot contacts...', params);

      const response = await this.makeRequest('/.netlify/functions/hubspot-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        timeout: this.config.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache successful results for shorter time (2 minutes for dynamic data)
      StorageManager.cacheApiResponse(cacheKey, data);

      console.log('📥 Successfully fetched HubSpot contacts:', {
        resultCount: data.results?.length || 0,
        total: data.total,
      });

      return data;
    } catch (error) {
      console.error('💥 Error fetching HubSpot contacts:', error);
      throw error;
    }
  }

  /**
   * Fetch all HubSpot contacts with pagination
   */
  async fetchAllContacts(params: any = {}): Promise<any> {
    try {
      console.log('📡 Fetching ALL HubSpot contacts with pagination...', params);

      const response = await this.makeRequest('/.netlify/functions/hubspot-contacts-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        timeout: this.config.timeout * 3, // Longer timeout for bulk operations
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('📥 Successfully fetched all HubSpot contacts:', {
        resultCount: data.results?.length || 0,
        total: data.total,
        requestCount: data.requestCount,
      });

      return data;
    } catch (error) {
      console.error('💥 Error fetching all HubSpot contacts:', error);
      throw error;
    }
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async makeRequest(
    url: string,
    options: RequestInit & { timeout?: number }
  ): Promise<Response> {
    const { timeout = this.config.timeout, ...fetchOptions } = options;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Clear all caches and reset connections
   */
  resetService(): void {
    console.log('🔄 Resetting HubSpot service...');
    this.connections.clear();
    StorageManager.clearAllCaches();
  }

  /**
   * Get service health status
   */
  getHealthStatus(): any {
    return {
      activeConnections: this.connections.size,
      maxConnections: this.maxConnections,
      config: this.config,
      cacheStats: StorageManager.getCacheStats(),
    };
  }

  /**
   * Validate environment configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if we're in a supported environment
    const isProduction = import.meta.env.PROD;
    const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify');
    const isLovable =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('lovable') ||
        window.location.hostname.includes('webcontainer') ||
        window.location.hostname.includes('local-credentialless'));

    if (!isProduction && !isNetlify && !isLovable) {
      errors.push('Environment not recognized - may affect API connectivity');
    }

    // Validate timeout values
    if (this.config.timeout < 1000 || this.config.timeout > 60000) {
      errors.push('Timeout should be between 1s and 60s');
    }

    // Validate retry attempts
    if (this.config.maxRetries < 0 || this.config.maxRetries > 10) {
      errors.push('Max retries should be between 0 and 10');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export default HubSpotService.getInstance();
