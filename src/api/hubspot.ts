// src/api/hubspot.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function testHubSpotConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hubspot/test`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('HubSpot API Error:', response.status, response.statusText);
      return { connected: false, error: response.statusText };
    }

    const data = await response.json();
    return {
      connected: true,
      total: data.total || 0
    };
  } catch (error) {
    console.error('HubSpot connection error:', error);
    return { connected: false, error: error.message };
  }
}

export async function fetchHubSpotContacts(limit = 25) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hubspot/contacts/latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [],
        sorts: [{
          propertyName: 'createdate',
          direction: 'DESCENDING'
        }],
        properties: [
          'firstname',
          'lastname',
          'email',
          'hs_object_id',
          'createdate'
        ],
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching HubSpot contacts:', error);
    throw error;
  }
}
