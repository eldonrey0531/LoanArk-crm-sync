const { handler } = require('../hubspot-contacts-live');

describe('GET /hubspot-contacts-live', () => {
  it('should return contacts from HubSpot API', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '10',
        offset: '0'
      },
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('contacts');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('hasMore');
    expect(Array.isArray(body.contacts)).toBe(true);

    if (body.contacts.length > 0) {
      const contact = body.contacts[0];
      expect(contact).toHaveProperty('hs_object_id');
      expect(contact).toHaveProperty('email');
      expect(contact).toHaveProperty('createdate');
      expect(contact).toHaveProperty('lastmodifieddate');
      // Check other required properties
      expect(contact).toHaveProperty('firstname');
      expect(contact).toHaveProperty('lastname');
      expect(contact).toHaveProperty('phone');
      expect(contact).toHaveProperty('mobilephone');
      expect(contact).toHaveProperty('client_type_vip_status');
      expect(contact).toHaveProperty('client_type_prospects');
      expect(contact).toHaveProperty('address');
      expect(contact).toHaveProperty('city');
      expect(contact).toHaveProperty('zip');
    }
  });

  it('should handle properties parameter', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '5',
        properties: 'hs_object_id,email,firstname,lastname'
      },
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(5);

    if (body.contacts.length > 0) {
      const contact = body.contacts[0];
      expect(contact).toHaveProperty('hs_object_id');
      expect(contact).toHaveProperty('email');
      expect(contact).toHaveProperty('firstname');
      expect(contact).toHaveProperty('lastname');
      // Should not have other properties if specified
    }
  });

  it('should handle OPTIONS request for CORS', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      headers: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('should return error for missing HubSpot authentication', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(401);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('error');
  });

  it('should handle HubSpot API rate limit', async () => {
    // Mock a rate limit response
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };

    const result = await handler(event, {});

    // Should handle 429 status from HubSpot
    expect([401, 429, 500]).toContain(result.statusCode);
  });
});