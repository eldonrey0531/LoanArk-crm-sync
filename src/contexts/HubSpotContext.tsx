import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import HubSpotAuthService from '../services/hubspot-auth';
import HubSpotService from '../services/hubspot';

interface HubSpotContextType {
  // Connection state
  hubspotConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hubspotCount: number;
  connectionDetails: any;
  lastChecked: Date | null;

  // Authentication state
  isAuthenticated: boolean;
  authError: string | null;
  user: any | null;

  // Methods
  checkConnection: () => Promise<void>;
  refreshConnection: () => Promise<void>;
  clearError: () => void;
  login: () => void;
  logout: () => Promise<void>;
  getAuthUrl: () => string;
}

const HubSpotContext = createContext<HubSpotContextType | undefined>(undefined);

interface HubSpotProviderProps {
  children: ReactNode;
}

export const HubSpotProvider: React.FC<HubSpotProviderProps> = ({
  children,
}) => {
  const [hubspotConnected, setHubspotConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hubspotCount, setHubspotCount] = useState<number>(0);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const authService = HubSpotAuthService.getInstance();

  // Import the HubSpot test function
  const testHubSpotConnection = async () => {
    try {
      // This will use the existing API structure
      const response = await fetch('/.netlify/functions/hubspot-test');
      const data = await response.json();
      return { ...data, isDemo: false };
    } catch (error) {
      console.error('HubSpot connection error:', error);
      return {
        connected: false,
        total: 0,
        isDemo: false,
        error: error.message,
      };
    }
  };

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Testing HubSpot connection...');
      const result = await testHubSpotConnection();

      console.log('📊 HubSpot connection result:', {
        connected: result.connected,
        total: result.total,
        error: result.error,
        isDemo: result.isDemo,
      });

      setHubspotConnected(result.connected);
      setHubspotCount(result.total || 0);
      setConnectionDetails(result);
      setLastChecked(new Date());

      if (!result.connected) {
        setError(result.error || 'Connection failed');
      }

      // Persist to localStorage
      try {
        localStorage.setItem(
          'hubspot_connection_status',
          JSON.stringify({
            connected: result.connected,
            timestamp: Date.now(),
            count: result.total || 0,
          })
        );
      } catch (storageError) {
        console.warn(
          'Failed to save connection status to localStorage:',
          storageError
        );
      }
    } catch (error) {
      console.error('💥 HubSpot connection error:', error);
      setHubspotConnected(false);
      setHubspotCount(0);
      setConnectionDetails(null);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConnection = async () => {
    await checkConnection();
  };

  const clearError = () => {
    setError(null);
    setAuthError(null);
  };

  const login = () => {
    try {
      const authUrl = authService.generateAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to initiate login');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setHubspotConnected(false);
      setHubspotCount(0);
      setConnectionDetails(null);
      setAuthError(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to logout');
    }
  };

  const getAuthUrl = () => {
    return authService.generateAuthUrl();
  };

  // Load persisted connection status on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hubspot_connection_status');
      if (stored) {
        const { connected, timestamp, count } = JSON.parse(stored);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (timestamp > fiveMinutesAgo) {
          setHubspotConnected(connected);
          setHubspotCount(count || 0);
          setLastChecked(new Date(timestamp));
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted connection status:', error);
    }
    checkConnection();
  }, []);

  // Sync authentication state from auth service
  useEffect(() => {
    const syncAuthState = () => {
      const authState = authService.getAuthState();
      setIsAuthenticated(authState.isAuthenticated);
      setUser(authState.user);
      if (authState.error) {
        setAuthError(authState.error);
      }
    };

    syncAuthState();

    // Check auth state periodically
    const interval = setInterval(syncAuthState, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [authService]);

  // Memoize context value to avoid unnecessary renders
  const contextValue = React.useMemo(
    () => ({
      hubspotConnected,
      isLoading,
      error,
      hubspotCount,
      connectionDetails,
      checkConnection,
      refreshConnection,
      clearError,
      lastChecked,
      isAuthenticated,
      authError,
      user,
      login,
      logout,
      getAuthUrl,
    }),
    [
      hubspotConnected,
      isLoading,
      error,
      hubspotCount,
      connectionDetails,
      lastChecked,
      isAuthenticated,
      authError,
      user,
    ]
  );

  return (
    <HubSpotContext.Provider value={contextValue}>
      {children}
    </HubSpotContext.Provider>
  );
};

export const useHubSpot = (): HubSpotContextType => {
  const context = useContext(HubSpotContext);
  if (!context) {
    throw new Error('useHubSpot must be used within HubSpotProvider');
  }
  return context;
};

export default HubSpotProvider;
