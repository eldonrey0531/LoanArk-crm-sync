import { useState, useEffect, useCallback } from 'react';
import { useHubSpot } from '../contexts/HubSpotContext';

interface UseHubSpotConnectionReturn {
  isConnected: boolean;
  isValidating: boolean;
  error: Error | null;
  retry: () => void;
  connectionDetails: any | null;
  lastChecked: Date | null;
  count: number;
}

export const useHubSpotConnection = (): UseHubSpotConnectionReturn => {
  const {
    hubspotConnected,
    isLoading,
    error: contextError,
    hubspotCount,
    connectionDetails,
    checkConnection,
    lastChecked,
  } = useHubSpot();

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Convert string error to Error object for consistency
  const error = contextError ? new Error(contextError) : null;

  const retry = useCallback(async () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);

      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;

      setTimeout(async () => {
        try {
          await checkConnection();
          // Reset retry count on success
          if (hubspotConnected) {
            setRetryCount(0);
          }
        } catch (error) {
          console.error(`Retry ${retryCount + 1} failed:`, error);
        }
      }, delay);
    } else {
      console.warn('Maximum retry attempts reached');
    }
  }, [retryCount, checkConnection, hubspotConnected, maxRetries]);

  // Auto-retry on connection failure (with exponential backoff)
  useEffect(() => {
    if (!hubspotConnected && !isLoading && error && retryCount < maxRetries) {
      const shouldRetry = retryCount === 0; // Only auto-retry once, then manual
      if (shouldRetry) {
        retry();
      }
    }
  }, [hubspotConnected, isLoading, error, retryCount, retry, maxRetries]);

  // Reset retry count when connection is restored
  useEffect(() => {
    if (hubspotConnected) {
      setRetryCount(0);
    }
  }, [hubspotConnected]);

  return {
    isConnected: hubspotConnected,
    isValidating: isLoading,
    error,
    retry,
    connectionDetails,
    lastChecked,
    count: hubspotCount,
  };
};

export default useHubSpotConnection;
