// src/api/hubspot.ts
const HUBSPOT_API_KEY = import.meta.env.VITE_HUBSPOT_API_KEY || process.env.HUBSPOT_API_KEY;

export async function testHubSpotConnection() {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
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
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
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
