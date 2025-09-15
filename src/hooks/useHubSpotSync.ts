import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHubSpotSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [lastSync, setLastSync] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchSyncHistory();
    const unsubscribe = subscribeToUpdates();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchSyncHistory = async () => {
    const { data, error } = await supabase
      .from('sync_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setSyncHistory(data);
      setLastSync(data[0]);
      setSyncStatus(data[0]);
    }
  };

  const subscribeToUpdates = () => {
    const subscription = supabase
      .channel('sync-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_jobs'
        },
        (payload) => {
          if (payload.new) {
            setSyncStatus(payload.new);

            if (payload.new.status === 'completed') {
              toast.success(`Sync completed: ${payload.new.records_processed} records processed`);
              setIsSyncing(false);
              fetchSyncHistory();
            } else if (payload.new.status === 'failed') {
              toast.error(`Sync failed: ${payload.new.error_message || 'Unknown error'}`);
              setIsSyncing(false);
            } else if (payload.new.status === 'processing') {
              toast.info('Sync is now processing...');
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const triggerSync = async () => {
    try {
      setIsSyncing(true);

      const { data: job, error } = await supabase
        .from('sync_jobs')
        .insert({
          type: 'manual',
          status: 'pending',
          metadata: {
            triggered_from: 'frontend',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.info('Sync job created! It will be processed by GitHub Actions within 15 minutes.');

      const pollInterval = setInterval(async () => {
        const { data } = await supabase
          .from('sync_jobs')
          .select('*')
          .eq('id', job.id)
          .single();

        if (data) {
          setSyncStatus(data);

          if (data.status !== 'pending' && data.status !== 'processing') {
            clearInterval(pollInterval);
            setIsSyncing(false);
            fetchSyncHistory();
          }
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setIsSyncing(false);
      }, 1200000);

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
    refreshStatus: fetchSyncHistory
  };
}
