import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import hubspotService from '../hubspot';
import StorageManager from '../../utils/storage';

// Create a mock AbortSignal that properly passes instanceof checks
const mockAbortSignal = Object.create(AbortSignal.prototype, {
  aborted: {
    value: false,
    writable: true,
  },
  addEventListener: {
    value: vi.fn(),
  },
  removeEventListener: {
    value: vi.fn(),
  },
  dispatchEvent: {
    value: vi.fn(),
  },
});

// Mock AbortController to work properly in tests
global.AbortController = vi.fn().mockImplementation(() => ({
  signal: mockAbortSignal,
  abort: vi.fn(() => {
    mockAbortSignal.aborted = true;
  }),
})) as any;

// For tests, temporarily disable AbortController to avoid Node.js undici issues
const originalAbortController = global.AbortController;
beforeAll(() => {
  // @ts-ignore - Disable AbortController for testing
  delete global.AbortController;
});

afterAll(() => {
  // Restore AbortController after tests
  global.AbortController = originalAbortController;
});

// Mock fetch globally using Vitest's recommended approach
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Set up mock responses immediately
mockFetch.mockImplementation(
  async (url: string | URL | Request, options: any) => {
    const urlString =
      typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;

    // Handle Netlify function calls - check for both absolute and relative URLs
    if (
      urlString.includes('/.netlify/functions/hubspot-test') ||
      urlString.endsWith('/.netlify/functions/hubspot-test')
    ) {
      return {
        ok: true,
        json: async () => ({
          connected: true,
          total: 150,
          message: 'HubSpot connection successful',
        }),
      };
    }

    if (
      urlString.includes('/.netlify/functions/hubspot-contacts') ||
      urlString.endsWith('/.netlify/functions/hubspot-contacts')
    ) {
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              id: 'hubspot-contact-1',
              properties: {
                email: 'contact1@example.com',
                firstname: 'Alice',
                lastname: 'Johnson',
                phone: '+1234567890',
                company: 'Tech Corp',
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'hubspot-contact-2',
              properties: {
                email: 'contact2@example.com',
                firstname: 'Bob',
                lastname: 'Smith',
                phone: '+1987654321',
                company: 'Design Studio',
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          total: 2,
          paging: {
            next: {
              after: '2',
              link: '?after=2',
            },
          },
        }),
      };
    }

    // Default fallback - throw an error for unhandled URLs
    throw new Error(`Unhandled URL in mock: ${urlString}`);
  }
);

// Mock StorageManager static methods
vi.mock('../../utils/storage', () => ({
  default: {
    getCachedApiResponse: vi.fn(),
    cacheApiResponse: vi.fn(),
    clearAllCaches: vi.fn(),
    getCacheStats: vi.fn(() => ({
      hits: 10,
      misses: 5,
      size: 3,
    })),
  },
}));

describe('HubSpotService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset service instance for clean state
    hubspotService.resetService();

    // Clear any cached data by resetting the mock return values
    const mockedStorage = vi.mocked(StorageManager);
    mockedStorage.getCachedApiResponse.mockReturnValue(null);
    mockedStorage.cacheApiResponse.mockClear();
    mockedStorage.clearAllCaches.mockClear();
  });

  afterEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return successful connection result', async () => {
      const result = await hubspotService.testConnection();

      expect(result).toEqual({
        connected: true,
        total: 150,
        message: 'HubSpot connection successful',
        isDemo: false,
      });
    });

    it('should use cached result when available', async () => {
      // Mock cache hit
      const mockedStorage = vi.mocked(StorageManager);
      mockedStorage.getCachedApiResponse.mockReturnValue({
        connected: true,
        total: 100,
        isDemo: false,
      });

      const result = await hubspotService.testConnection();

      expect(result).toEqual({
        connected: true,
        total: 100,
        isDemo: false,
      });
      expect(mockedStorage.getCachedApiResponse).toHaveBeenCalledWith(
        'hubspot-test'
      );
    });

    it('should cache successful results', async () => {
      const mockedStorage = vi.mocked(StorageManager);
      await hubspotService.testConnection();

      expect(mockedStorage.cacheApiResponse).toHaveBeenCalledWith(
        'hubspot-test',
        expect.objectContaining({
          connected: true,
          total: 150,
          isDemo: false,
        })
      );
    });

    it('should handle connection errors gracefully', async () => {
      // Mock network error - override the default mock
      mockFetch.mockImplementationOnce(async () => {
        throw new Error('Network error');
      });

      const result = await hubspotService.testConnection();

      expect(result).toEqual({
        connected: false,
        total: 0,
        error: 'Network error',
        isDemo: false,
      });
    });
  });

  describe('fetchContacts', () => {
    const testParams = { limit: 10, after: '0' };

    it('should fetch contacts successfully', async () => {
      const result = await hubspotService.fetchContacts(testParams);

      expect(result).toEqual({
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'hubspot-contact-1',
            properties: expect.objectContaining({
              email: 'contact1@example.com',
              firstname: 'Alice',
              lastname: 'Johnson',
            }),
          }),
        ]),
        total: 2,
        paging: expect.any(Object),
      });
    });

    it('should use cached contacts when available', async () => {
      const mockedStorage = vi.mocked(StorageManager);
      const cachedContacts = {
        results: [{ id: 'cached-contact' }],
        total: 1,
      };

      mockedStorage.getCachedApiResponse.mockReturnValue(cachedContacts);

      const result = await hubspotService.fetchContacts(testParams);

      expect(result).toBe(cachedContacts);
      expect(mockedStorage.getCachedApiResponse).toHaveBeenCalledWith(
        `hubspot-contacts-${JSON.stringify(testParams)}`
      );
    });

    it('should cache successful contact fetches', async () => {
      const mockedStorage = vi.mocked(StorageManager);
      await hubspotService.fetchContacts(testParams);

      expect(mockedStorage.cacheApiResponse).toHaveBeenCalledWith(
        `hubspot-contacts-${JSON.stringify(testParams)}`,
        expect.objectContaining({
          results: expect.any(Array),
          total: 2,
        })
      );
    });

    it('should handle fetch errors', async () => {
      // Clear cache for this test
      const mockedStorage = vi.mocked(StorageManager);
      mockedStorage.getCachedApiResponse.mockReturnValue(null);

      // Mock network error
      mockFetch.mockImplementationOnce(async () => {
        throw new Error('Network error');
      });

      await expect(hubspotService.fetchContacts(testParams)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      // Mock environment to be recognized
      vi.stubEnv('PROD', true);

      const result = hubspotService.validateConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      vi.unstubAllEnvs();
    });

    it('should detect invalid timeout values', () => {
      // Temporarily modify config for testing
      const originalConfig = (hubspotService as any).config;
      (hubspotService as any).config = { ...originalConfig, timeout: 100 };

      const result = hubspotService.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timeout should be between 1s and 60s');

      // Restore original config
      (hubspotService as any).config = originalConfig;
    });
  });

  describe('Health Status', () => {
    it('should return comprehensive health status', () => {
      const health = hubspotService.getHealthStatus();

      expect(health).toEqual({
        activeConnections: 0,
        maxConnections: 5,
        config: expect.objectContaining({
          baseURL: expect.any(String),
          timeout: expect.any(Number),
          maxRetries: expect.any(Number),
          retryDelay: expect.any(Number),
        }),
        cacheStats: {
          hits: 10,
          misses: 5,
          size: 3,
        },
      });
    });
  });

  describe('Service Reset', () => {
    it('should clear all caches and connections', () => {
      const mockedStorage = vi.mocked(StorageManager);
      hubspotService.resetService();

      expect(mockedStorage.clearAllCaches).toHaveBeenCalled();
    });
  });
});
