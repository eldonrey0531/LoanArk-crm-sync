import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HubSpotAuthService from './hubspot-auth';

// Mock fetch globally
global.fetch = vi.fn();

describe('HubSpotAuthService', () => {
  let authService: HubSpotAuthService;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset localStorage
    localStorage.clear();
    sessionStorage.clear();

    // Get fresh instance
    authService = HubSpotAuthService.getInstance();
  });

  afterEach(() => {
    // Clean up
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = HubSpotAuthService.getInstance();
      const instance2 = HubSpotAuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate correct OAuth URL', () => {
      const url = authService.generateAuthUrl();
      expect(url).toContain('https://app.hubspot.com/oauth/authorize');
      expect(url).toContain('client_id=');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('scope=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('state=');
    });

    it('should store state in sessionStorage', () => {
      authService.generateAuthUrl();
      expect(sessionStorage.getItem('hubspot_oauth_state')).toBeTruthy();
    });
  });

  describe('validateState', () => {
    it('should validate correct state', () => {
      const state = 'test-state-123';
      sessionStorage.setItem('hubspot_oauth_state', state);
      // Access private method through type assertion
      const service = authService as any;
      expect(service.validateState(state)).toBe(true);
    });

    it('should reject incorrect state', () => {
      sessionStorage.setItem('hubspot_oauth_state', 'correct-state');
      const service = authService as any;
      expect(service.validateState('wrong-state')).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should identify valid tokens', () => {
      const service = authService as any;
      const validToken = {
        access_token: 'test-token',
        expires_at: Date.now() + 3600000, // 1 hour from now
      };
      expect(service.isTokenValid(validToken)).toBe(true);
    });

    it('should identify expired tokens', () => {
      const service = authService as any;
      const expiredToken = {
        access_token: 'test-token',
        expires_at: Date.now() - 3600000, // 1 hour ago
      };
      expect(service.isTokenValid(expiredToken)).toBe(false);
    });

    it('should identify tokens without expiry', () => {
      const service = authService as any;
      const invalidToken = {
        access_token: 'test-token',
      };
      expect(service.isTokenValid(invalidToken)).toBe(false);
    });
  });

  describe('Authentication State', () => {
    it('should return correct initial auth state', () => {
      const state = authService.getAuthState();
      expect(state).toHaveProperty('isAuthenticated');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('token');
    });

    it('should return false for isAuthenticated initially', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Token Exchange', () => {
    it('should handle successful token exchange', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Set up state for validation
      const testState = 'test-state-123';
      sessionStorage.setItem('hubspot_oauth_state', testState);

      const service = authService as any;
      await service.exchangeCodeForToken('test-code', testState);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.hubapi.com/oauth/v1/token'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        })
      );
    });

    it('should handle token exchange errors', async () => {
      const mockError = {
        error: 'invalid_grant',
        error_description: 'Invalid authorization code',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      // Set up state for validation
      const testState = 'test-state-456';
      sessionStorage.setItem('hubspot_oauth_state', testState);

      const service = authService as any;
      await expect(
        service.exchangeCodeForToken('invalid-code', testState)
      ).rejects.toThrow('Invalid authorization code');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        access_token: 'refreshed-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await authService.refreshToken('refresh-token-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.hubapi.com/oauth/v1/token'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(URLSearchParams),
        })
      );
    });

    it('should handle refresh token errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        authService.refreshToken('invalid-refresh-token')
      ).rejects.toThrow('Failed to refresh token');
    });
  });

  describe('Logout', () => {
    it('should clear authentication state on logout', async () => {
      // First set some state
      const service = authService as any;
      service.state.token = { access_token: 'test' };
      service.state.isAuthenticated = true;
      service.state.user = { email: 'test@example.com' };

      await authService.logout();

      expect(service.state.token).toBeNull();
      expect(service.state.isAuthenticated).toBe(false);
      expect(service.state.user).toBeNull();
    });
  });
});
