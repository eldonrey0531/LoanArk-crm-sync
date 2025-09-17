import React from 'react';
import { useHubSpotContacts } from '../hooks/useHubSpotContacts';
import { ContactsTable } from '../components/ContactsTable';

const SupabaseDatabase: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useHubSpotContacts({
    type: 'sync',
    limit: 100,
  });

  const contacts = data?.contacts || [];
  const errorMessage = error?.message || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Supabase Database
        </h1>
        <p className="text-gray-600">
          View contacts synchronized from HubSpot to the Supabase database.
          This data may be slightly delayed from the live HubSpot data.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data ? `${data.total} total contacts` : 'Loading...'}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ContactsTable
        contacts={contacts}
        isLoading={isLoading}
        error={errorMessage}
      />
    </div>
  );
};

export default SupabaseDatabase;