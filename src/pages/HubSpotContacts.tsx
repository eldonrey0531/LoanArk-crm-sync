import React from 'react';
import { useHubSpotContacts } from '../hooks/useHubSpotContacts';
import { ContactsTable } from '../components/ContactsTable';

const HubSpotContacts: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useHubSpotContacts({
    type: 'live',
    limit: 100,
  });

  const contacts = data?.contacts || [];
  const errorMessage = error?.message || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HubSpot Contacts
        </h1>
        <p className="text-gray-600">
          View live contacts directly from HubSpot CRM.
          This data is fetched in real-time and reflects the current state.
        </p>
        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live Data
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data ? `${data.total} total contacts` : 'Loading...'}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Live Data'}
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

export default HubSpotContacts;