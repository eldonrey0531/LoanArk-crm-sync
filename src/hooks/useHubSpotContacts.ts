import { useQuery } from '@tanstack/react-query';
import { HubSpotContact, ContactListResponse } from '../types/hubspot';

interface UseHubSpotContactsOptions {
  type: 'sync' | 'live';
  limit?: number;
  offset?: number;
  properties?: string;
  enabled?: boolean;
}

export const useHubSpotContacts = ({
  type,
  limit = 50,
  offset = 0,
  properties,
  enabled = true,
}: UseHubSpotContactsOptions) => {
  const endpoint =
    type === 'sync'
      ? '/.netlify/functions/hubspot-contacts-sync'
      : '/.netlify/functions/hubspot-contacts-live';

  const queryKey = ['hubspot-contacts', type, limit, offset, properties];

  return useQuery<ContactListResponse>({
    queryKey,
    queryFn: async (): Promise<ContactListResponse> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (properties) {
        params.append('properties', properties);
      }

      const url = `${endpoint}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch contacts: ${response.status}`
        );
      }

      return response.json();
    },
    enabled,
    staleTime: type === 'sync' ? 5 * 60 * 1000 : 30 * 1000, // 5 min for sync, 30 sec for live
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message.includes('authentication') ||
        error.message.includes('401')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useHubSpotContact = (
  contactId: string,
  type: 'sync' | 'live' = 'sync'
) => {
  const { data, ...query } = useHubSpotContacts({
    type,
    limit: 1,
    enabled: !!contactId,
  });

  const contact = data?.contacts.find(c => c.hs_object_id === contactId);

  return {
    ...query,
    data: contact,
  };
};
