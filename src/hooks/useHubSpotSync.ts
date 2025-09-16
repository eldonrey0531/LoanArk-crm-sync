// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHubSpotSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [lastSync, setLastSync] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  useEffect(() => {
    // Temporarily disabled until sync_jobs table is created
    // fetchSyncHistory();
    // const unsubscribe = subscribeToUpdates();
    // return () => {
    //   unsubscribe();
    // };
  }, []);

  const fetchSyncHistory = async () => {
    try {
      // Temporarily return empty data until sync_jobs table is created
      setSyncHistory([]);
      setLastSync(null);
      setSyncStatus(null);
    } catch (error) {
      console.error('Error fetching sync history:', error);
    }
  };

  const subscribeToUpdates = () => {
    // Temporarily disabled until sync_jobs table is created
    return () => {};
  };

  const triggerSync = async () => {
    try {
      setIsSyncing(true);
      toast.info(
        'Sync functionality is temporarily disabled until database setup is complete.'
      );

      // Simulate a quick sync for demo purposes
      setTimeout(() => {
        setIsSyncing(false);
        toast.success('Demo sync completed successfully!');
      }, 2000);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Failed to create sync job');
      setIsSyncing(false);
    }
  };

  return {
    triggerSync,
    isSyncing,
    syncStatus,
    lastSync,
    syncHistory,
    refreshStatus: fetchSyncHistory,
  };
}
