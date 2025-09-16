import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: number;
  hs_object_id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  company?: string | null;
  createdate: string | null;
  lastmodifieddate: string | null;
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.warn('Failed to fetch contacts:', error.message);
          throw error;
        }
        return data as Contact[];
      } catch (error) {
        console.error('Error in useContacts:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useContactStats = () => {
  return useQuery({
    queryKey: ['contact-stats'],
    queryFn: async () => {
      try {
        // Get total contacts
        const { count: totalContacts, error: totalError } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.warn('Failed to get total contacts:', totalError.message);
          throw totalError;
        }

        // Get contacts with email verification status
        const { data: verificationData, error: verificationError } = await supabase
          .from('contacts')
          .select('email_verification_status')
          .not('email', 'is', null);

        if (verificationError) {
          console.warn('Failed to get verification data:', verificationError.message);
          // Don't throw here, return partial data
        }

        const verifiedCount =
          verificationData?.filter((c) => c.email_verification_status === 'valid').length || 0;
        const pendingCount =
          verificationData?.filter((c) => c.email_verification_status === null).length || 0;

        return {
          totalContacts: totalContacts || 0,
          verifiedCount,
          pendingCount,
          withEmail: verificationData?.length || 0,
        };
      } catch (error) {
        console.error('Error in useContactStats:', error);
        // Return default values instead of throwing
        return {
          totalContacts: 0,
          verifiedCount: 0,
          pendingCount: 0,
          withEmail: 0,
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSyncLogs = () => {
  return useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};

export const useTop100ByCreated = () => {
  return useQuery({
    queryKey: ['contacts-top-100-created'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Contact[];
    },
  });
};

export const useTop100ByUpdated = () => {
  return useQuery({
    queryKey: ['contacts-top-100-updated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Contact[];
    },
  });
};

export const useHubSpotSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/hubspot-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch contacts and logs
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['contacts-top-100-created'] });
      queryClient.invalidateQueries({ queryKey: ['contacts-top-100-updated'] });
    },
  });
};
