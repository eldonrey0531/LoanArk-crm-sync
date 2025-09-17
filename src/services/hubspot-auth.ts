import StorageManager from '../utils/storage';

interface HubSpotToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
}

interface HubSpotAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: any | null;
  token: HubSpotToken | null;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

class HubSpotAuthService {
  private static instance: HubSpotAuthService;
  private config: OAuthConfig;
  private state: HubSpotAuthState;

  private constructor() {
    this.config = {
      clientId: import.meta.env.VITE_HUBSPOT_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_HUBSPOT_CLIENT_SECRET || '',
      redirectUri:
        import.meta.env.VITE_HUBSPOT_REDIRECT_URI ||
        `${window.location.origin}/auth/hubspot/callback`,
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        'oauth',
      ],
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    };

    this.state = {
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      token: null,
    };

    this.loadStoredToken();
  }

  static getInstance(): HubSpotAuthService {
    if (!HubSpotAuthService.instance) {
      HubSpotAuthService.instance = new HubSpotAuthService();
    }
    return HubSpotAuthService.instance;
  }

  /**
   * Load stored token from storage
   */
  private async loadStoredToken(): Promise<void> {
    try {
      const storedToken =
        await StorageManager.getCachedApiResponse('hubspot-token');
      if (storedToken && this.isTokenValid(storedToken)) {
        this.state.token = storedToken;
        this.state.isAuthenticated = true;
        await this.loadUserProfile();
      } else if (storedToken?.refresh_token) {
        // Try to refresh the token
        await this.refreshToken(storedToken.refresh_token);
      }
    } catch (error) {
      console.error('Error loading stored token:', error);
      this.clearStoredToken();
    }
  }

  /**
   * Check if token is still valid
   */
  private isTokenValid(token: HubSpotToken): boolean {
    if (!token?.expires_at) return false;
    // Add 5 minute buffer for token expiration
    return Date.now() < token.expires_at - 300000;
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state: this.generateState(),
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('hubspot_oauth_state', state);
    return state;
  }

  /**
   * Validate OAuth state parameter
   */
  private validateState(state: string): boolean {
    const storedState = sessionStorage.getItem('hubspot_oauth_state');
    sessionStorage.removeItem('hubspot_oauth_state');
    return storedState === state;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<void> {
    if (!this.validateState(state)) {
      throw new Error('Invalid OAuth state parameter');
    }

    this.state.isLoading = true;
    this.state.error = null;

    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error_description || 'Failed to exchange code for token'
        );
      }

      const tokenData = await response.json();
      await this.storeToken(tokenData);
      await this.loadUserProfile();

      this.state.isAuthenticated = true;
      this.state.isLoading = false;
    } catch (error) {
      this.state.error = error.message;
      this.state.isLoading = false;
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken?: string): Promise<void> {
    const tokenToRefresh = refreshToken || this.state.token?.refresh_token;
    if (!tokenToRefresh) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: tokenToRefresh,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenData = await response.json();
      await this.storeToken(tokenData);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Store token securely
   */
  private async storeToken(tokenData: any): Promise<void> {
    const token: HubSpotToken = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || this.state.token?.refresh_token,
      expires_in: tokenData.expires_in,
      expires_at: Date.now() + tokenData.expires_in * 1000,
      token_type: tokenData.token_type,
    };

    this.state.token = token;
    await StorageManager.cacheApiResponse('hubspot-token', token);
  }

  /**
   * Load user profile information
   */
  private async loadUserProfile(): Promise<void> {
    if (!this.state.token) return;

    try {
      const response = await fetch(
        'https://api.hubapi.com/oauth/v1/access-tokens/' +
          this.state.token.access_token
      );

      if (response.ok) {
        const profile = await response.json();
        this.state.user = profile;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    this.state.token = null;
    this.state.user = null;
    this.state.isAuthenticated = false;
    StorageManager.clearAllCaches();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.clearStoredToken();
    this.state.error = null;
  }

  /**
   * Get current access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.state.token) return null;

    if (!this.isTokenValid(this.state.token)) {
      await this.refreshToken();
    }

    return this.state.token.access_token;
  }

  /**
   * Get current authentication state
   */
  getAuthState(): HubSpotAuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.isTokenValid(this.state.token);
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthHeader(): Promise<{ Authorization: string } | null> {
    const token = await this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }
}

export default HubSpotAuthService;
