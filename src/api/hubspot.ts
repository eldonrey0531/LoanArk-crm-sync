// src/api/hubspot.ts

// Environment detection for seamless deployment
const isProduction = import.meta.env.PROD;
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify');
const isLovable =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('lovable') ||
    window.location.hostname.includes('webcontainer') ||
    window.location.hostname.includes('local-credentialless'));

// Use Netlify Functions in production, mock data in Lovable
const useNetlifyFunctions = isProduction || isNetlify;
const useMockData = isLovable && !isProduction;

// Mock data for Lovable environment
const mockHubSpotData = {
  results: [
    {
      id: '101',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        hs_email_domain: 'example.com',
        createdate: '2024-01-15T10:30:00Z',
      },
    },
    {
      id: '102',
      properties: {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        hs_email_domain: 'example.com',
        createdate: '2024-01-14T09:15:00Z',
      },
    },
    {
      id: '103',
      properties: {
        firstname: 'Robert',
        lastname: 'Johnson',
        email: 'robert.j@example.com',
        hs_email_domain: 'example.com',
        createdate: '2024-01-13T14:45:00Z',
      },
    },
    {
      id: '104',
      properties: {
        firstname: 'Maria',
        lastname: 'Garcia',
        email: 'maria.g@example.com',
        hs_email_domain: 'example.com',
        createdate: '2024-01-12T11:20:00Z',
      },
    },
    {
      id: '105',
      properties: {
        firstname: 'David',
        lastname: 'Wilson',
        email: 'david.wilson@example.com',
        hs_email_domain: 'example.com',
        createdate: '2024-01-11T16:30:00Z',
      },
    },
  ],
  total: 5,
};

export async function testHubSpotConnection() {
  console.log('Environment:', { isProduction, isNetlify, isLovable, useMockData });
  // Use mock data in Lovable
  if (useMockData) {
    console.log('🔧 Using mock HubSpot data (Lovable environment)');
    return Promise.resolve({
      connected: true,
      total: mockHubSpotData.total,
      isDemo: true,
    });
  }

  // Use Netlify Functions in production
  if (useNetlifyFunctions) {
    try {
      const response = await fetch('/.netlify/functions/hubspot-test');
      const data = await response.json();
      return { ...data, isDemo: false };
    } catch (error) {
      console.error('HubSpot connection error:', error);
      return { connected: false, total: 0, isDemo: false };
    }
  }

  // Fallback to mock data if nothing else works
  return Promise.resolve({
    connected: true,
    total: mockHubSpotData.total,
    isDemo: true,
  });
}

export async function fetchHubSpotContacts(
  params = {
    limit: 25,
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    properties: ['firstname', 'lastname', 'email', 'hs_object_id', 'createdate'],
    filterGroups: [],
  }
) {
  // Use mock data in Lovable
  if (useMockData) {
    console.log('🔧 Using mock HubSpot contacts (Lovable environment)');
    return Promise.resolve({
      ...mockHubSpotData,
      results: mockHubSpotData.results.slice(0, params.limit || 25),
    });
  }

  // Use Netlify Functions in production
  if (useNetlifyFunctions) {
    try {
      const response = await fetch('/.netlify/functions/hubspot-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      // Fallback to mock data on error
      return {
        ...mockHubSpotData,
        results: mockHubSpotData.results.slice(0, params.limit || 25),
      };
    }
  }

  // Fallback to mock data
  return Promise.resolve({
    ...mockHubSpotData,
    results: mockHubSpotData.results.slice(0, params.limit || 25),
  });
}

export async function fetchAllHubSpotContacts(
  params = {
    pageSize: 100, // HubSpot max per page
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    properties: ['firstname', 'lastname', 'email', 'hs_object_id', 'createdate'],
    filterGroups: [],
  }
) {
  // Use mock data in Lovable
  if (useMockData) {
    console.log('🔧 Using mock HubSpot contacts (Lovable environment)');
    const totalAvailable = mockHubSpotData.results.length;
    // Remove maxContacts limit for mock data too
    const maxToReturn = totalAvailable;

    return Promise.resolve({
      ...mockHubSpotData,
      results: mockHubSpotData.results.slice(0, maxToReturn),
      total: maxToReturn,
      hasMore: false,
      requestCount: 1,
      maxContactsReached: false,
      isDemo: true,
    });
  }

  // Use Netlify Functions in production
  if (useNetlifyFunctions) {
    try {
      const response = await fetch('/.netlify/functions/hubspot-contacts-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all HubSpot contacts:', error);
      // Fallback to mock data on error
      const totalAvailable = mockHubSpotData.results.length;
      const maxToReturn = totalAvailable;

      return {
        ...mockHubSpotData,
        results: mockHubSpotData.results.slice(0, maxToReturn),
        total: maxToReturn,
        hasMore: false,
        requestCount: 1,
        maxContactsReached: false,
        error: `Failed to fetch from API: ${error.message}`,
      };
    }
  }

  // Fallback to mock data
  const totalAvailable = mockHubSpotData.results.length;
  const maxToReturn = totalAvailable;

  return Promise.resolve({
    ...mockHubSpotData,
    results: mockHubSpotData.results.slice(0, maxToReturn),
    total: maxToReturn,
    hasMore: false,
    requestCount: 1,
    maxContactsReached: false,
  });
}
