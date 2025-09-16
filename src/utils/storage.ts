interface ConnectionStatus {
  connected: boolean;
  timestamp: number;
  count?: number;
  error?: string;
}

class StorageManager {
  private static readonly STORAGE_KEYS = {
    HUBSPOT_CONNECTED: 'hubspot_connection_status',
    LAST_CHECK: 'hubspot_last_check',
    API_CACHE: 'hubspot_api_cache',
  } as const;

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Save HubSpot connection status to localStorage
   */
  static saveConnectionStatus(status: boolean, count: number = 0, error?: string): void {
    try {
      const connectionData: ConnectionStatus = {
        connected: status,
        timestamp: Date.now(),
        count,
        error,
      };

      localStorage.setItem(this.STORAGE_KEYS.HUBSPOT_CONNECTED, JSON.stringify(connectionData));

      console.log('📱 Saved connection status to localStorage:', connectionData);
    } catch (error) {
      console.error('Failed to save connection status:', error);
    }
  }

  /**
   * Get HubSpot connection status from localStorage with cache validation
   */
  static getConnectionStatus(): ConnectionStatus | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.HUBSPOT_CONNECTED);
      if (!stored) {
        return null;
      }

      const connectionData: ConnectionStatus = JSON.parse(stored);

      // Validate cache age
      if (this.isCacheValid(connectionData.timestamp)) {
        console.log('📱 Retrieved valid connection status from localStorage:', connectionData);
        return connectionData;
      } else {
        console.log('📱 Connection status cache expired, removing...');
        this.clearConnectionStatus();
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve connection status:', error);
      return null;
    }
  }

  /**
   * Clear connection status from localStorage
   */
  static clearConnectionStatus(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.HUBSPOT_CONNECTED);
      localStorage.removeItem(this.STORAGE_KEYS.LAST_CHECK);
      localStorage.removeItem(this.STORAGE_KEYS.API_CACHE);
      console.log('📱 Cleared connection status from localStorage');
    } catch (error) {
      console.error('Failed to clear connection status:', error);
    }
  }

  /**
   * Check if cache is still valid based on timestamp
   */
  private static isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Save API response to cache
   */
  static cacheApiResponse(endpoint: string, data: any): void {
    try {
      const cacheKey = `${this.STORAGE_KEYS.API_CACHE}_${endpoint}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`📱 Cached API response for ${endpoint}`);
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  }

  /**
   * Get cached API response if valid
   */
  static getCachedApiResponse(endpoint: string): any | null {
    try {
      const cacheKey = `${this.STORAGE_KEYS.API_CACHE}_${endpoint}`;
      const stored = localStorage.getItem(cacheKey);

      if (!stored) {
        return null;
      }

      const cacheData = JSON.parse(stored);

      if (this.isCacheValid(cacheData.timestamp)) {
        console.log(`📱 Retrieved cached API response for ${endpoint}`);
        return cacheData.data;
      } else {
        localStorage.removeItem(cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve cached API response:', error);
      return null;
    }
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('hubspot_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('📱 Cleared all HubSpot caches');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { [key: string]: any } {
    try {
      const stats: { [key: string]: any } = {};
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith('hubspot_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            stats[key] = {
              timestamp: data.timestamp,
              age: Date.now() - (data.timestamp || 0),
              valid: this.isCacheValid(data.timestamp || 0),
              size: localStorage.getItem(key)?.length || 0,
            };
          } catch {
            stats[key] = { error: 'Invalid JSON' };
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {};
    }
  }
}

export default StorageManager;
