const { handler } = require('../hubspot-contacts-sync');

describe('Supabase Contacts API - Pagination Contract Tests', () => {
  // These tests validate the pagination contract for the Supabase contacts API
  // They should fail initially and pass once pagination is properly implemented

  test('should return paginated response with default parameters', async () => {
    const event = {
      httpMethod: 'GET',
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

  test('should respect limit parameter', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '5'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(5);
  });

  test('should handle offset parameter for pagination', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '3',
        offset: '0'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(3);
    expect(typeof body.hasMore).toBe('boolean');
  });

  test('should return hasMore correctly', async () => {
    // Test with small limit to ensure hasMore logic works
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '1'
      }
    };

    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(typeof body.hasMore).toBe('boolean');
    expect(body.contacts.length).toBeLessThanOrEqual(1);
  });

  test('should validate limit bounds', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '200' // Over typical limits
      }
    };

    const result = await handler(event, {});
    // Should either succeed with clamped limit or return validation error
    expect([200, 400]).toContain(result.statusCode);
  });

  test('should handle invalid offset gracefully', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        offset: '-1' // Invalid negative offset
      }
    };

    const result = await handler(event, {});
    // Should handle gracefully, either succeed or return validation error
    expect([200, 400]).toContain(result.statusCode);
  });

  test('should return consistent total count across requests', async () => {
    // Make two requests and ensure total count is consistent
    const event1 = {
      httpMethod: 'GET',
      queryStringParameters: { limit: '1', offset: '0' }
    };

    const event2 = {
      httpMethod: 'GET',
      queryStringParameters: { limit: '1', offset: '1' }
    };

    const result1 = await handler(event1, {});
    const result2 = await handler(event2, {});

    expect(result1.statusCode).toBe(200);
    expect(result2.statusCode).toBe(200);

    const body1 = JSON.parse(result1.body);
    const body2 = JSON.parse(result2.body);

    // Total should be consistent across pagination requests
    expect(body1.total).toBe(body2.total);
  });
});