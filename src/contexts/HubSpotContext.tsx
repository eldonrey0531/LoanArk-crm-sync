import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HubSpotContextType {
  hubspotConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hubspotCount: number;
  connectionDetails: any | null;
  checkConnection: () => Promise<void>;
  refreshConnection: () => Promise<void>;
  clearError: () => void;
  lastChecked: Date | null;
}

const HubSpotContext = createContext<HubSpotContextType | undefined>(undefined);

interface HubSpotProviderProps {
  children: ReactNode;
}

export const HubSpotProvider: React.FC<HubSpotProviderProps> = ({ children }) => {
  const [hubspotConnected, setHubspotConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hubspotCount, setHubspotCount] = useState<number>(0);
  const [connectionDetails, setConnectionDetails] = useState<any | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Import the HubSpot test function
  const testHubSpotConnection = async () => {
    try {
      // This will use the existing API structure
      const response = await fetch('/.netlify/functions/hubspot-test');
      const data = await response.json();
      return { ...data, isDemo: false };
    } catch (error) {
      console.error('HubSpot connection error:', error);
      return { connected: false, total: 0, isDemo: false, error: error.message };
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
        console.warn('Failed to save connection status to localStorage:', storageError);
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
  };

  // Load persisted connection status on mount
  useEffect(() => {
    const loadPersistedStatus = () => {
      try {
        const stored = localStorage.getItem('hubspot_connection_status');
        if (stored) {
          const { connected, timestamp, count } = JSON.parse(stored);
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

          if (timestamp > fiveMinutesAgo) {
            // Use cached status if less than 5 minutes old
            setHubspotConnected(connected);
            setHubspotCount(count || 0);
            setLastChecked(new Date(timestamp));
            setIsLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted connection status:', error);
      }
      return false;
    };

    const hasValidCache = loadPersistedStatus();

    // If no valid cache, check connection
    if (!hasValidCache) {
      checkConnection();
    }
  }, []);

  const value: HubSpotContextType = {
    hubspotConnected,
    isLoading,
    error,
    hubspotCount,
    connectionDetails,
    checkConnection,
    refreshConnection,
    clearError,
    lastChecked,
  };

  return <HubSpotContext.Provider value={value}>{children}</HubSpotContext.Provider>;
};

export const useHubSpot = (): HubSpotContextType => {
  const context = useContext(HubSpotContext);
  if (!context) {
    throw new Error('useHubSpot must be used within HubSpotProvider');
  }
  return context;
};

export default HubSpotProvider;
