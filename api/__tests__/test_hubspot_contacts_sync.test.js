const { handler } = require('../hubspot-contacts-sync');

describe('GET /hubspot-contacts-sync', () => {
  it('should return contacts from synced database', async () => {
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

  it('should handle pagination parameters', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '5',
        offset: '10'
      },
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(5);
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

  it('should return error for missing authentication', async () => {
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
});