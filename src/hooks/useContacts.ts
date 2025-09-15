import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Contact[];
    },
  });
};

export const useContactStats = () => {
  return useQuery({
    queryKey: ["contact-stats"],
    queryFn: async () => {
      // Get total contacts
      const { count: totalContacts, error: totalError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      if (totalError) throw totalError;

      // Get contacts with email verification status
      const { data: verificationData, error: verificationError } = await supabase
        .from("contacts")
        .select("email_verification_status")
        .not("email", "is", null);

      if (verificationError) throw verificationError;

      const verifiedCount = verificationData?.filter(c => c.email_verification_status === 'valid').length || 0;
      const pendingCount = verificationData?.filter(c => c.email_verification_status === null).length || 0;

      return {
        totalContacts: totalContacts || 0,
        verifiedCount,
        pendingCount,
        withEmail: verificationData?.length || 0,
      };
    },
  });
};

export const useSyncLogs = () => {
  return useQuery({
    queryKey: ["sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};

export const useTop100ByCreated = () => {
  return useQuery({
    queryKey: ["contacts-top-100-created"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Contact[];
    },
  });
};

export const useTop100ByUpdated = () => {
  return useQuery({
    queryKey: ["contacts-top-100-updated"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("updated_at", { ascending: false })
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
      const { data, error } = await supabase.functions.invoke("hubspot-sync");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch contacts and logs
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["contacts-top-100-created"] });
      queryClient.invalidateQueries({ queryKey: ["contacts-top-100-updated"] });
    },
  });
};