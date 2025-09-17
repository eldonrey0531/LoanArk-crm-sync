const { handler } = require('../hubspot-contacts-live');

describe('HubSpot Live Contacts API - Pagination Contract Tests', () => {
  // These tests validate the pagination contract for the HubSpot live contacts API
  // They should fail initially and pass once pagination is properly implemented

  test('should return paginated response with default parameters', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);

    expect(body).toHaveProperty('contacts');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('hasMore');
    expect(Array.isArray(body.contacts)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.hasMore).toBe('boolean');
  });

  test('should respect limit parameter within HubSpot bounds', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {
        limit: '25'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(25);
  });

  test('should handle offset parameter for HubSpot pagination', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {
        limit: '10',
        offset: '0'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(10);
    expect(typeof body.hasMore).toBe('boolean');
  });

  test('should enforce HubSpot API limit (100)', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {
        limit: '150' // Over HubSpot's 100 limit
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    // Should be clamped to HubSpot's limit
    expect(body.contacts.length).toBeLessThanOrEqual(100);
  });

  test('should return hasMore based on HubSpot paging', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {
        limit: '1' // Small limit to test paging logic
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(typeof body.hasMore).toBe('boolean');
    expect(body.contacts.length).toBeLessThanOrEqual(1);
  });

  test('should handle authentication for pagination requests', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer invalid-token'
      },
      queryStringParameters: {
        limit: '5'
      }
    };

    const result = await handler(event, {});
    // Should return auth error, not crash
    expect(result.statusCode).toBe(401);
    expect(result.body).toContain('authentication');
  });

  test('should handle HubSpot rate limiting gracefully', async () => {
    // This test would need to be run against a rate-limited HubSpot account
    // For now, we test the error handling structure
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer rate-limited-token'
      },
      queryStringParameters: {
        limit: '10'
      }
    };

    const result = await handler(event, {});
    // Should handle rate limiting without crashing
    expect([200, 429]).toContain(result.statusCode);
  });

  test('should maintain contact structure in paginated responses', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
      queryStringParameters: {
        limit: '2'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeGreaterThan(0);

    // Validate contact structure
    const contact = body.contacts[0];
    expect(contact).toHaveProperty('hs_object_id');
    expect(contact).toHaveProperty('email');
    expect(typeof contact.hs_object_id).toBe('string');
  });
});