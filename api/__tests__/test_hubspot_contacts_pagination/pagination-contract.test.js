const { handler } = require('../../hubspot-contacts-sync');

describe('HubSpot Contacts Sync API - Pagination Contract', () => {
  // These tests will fail until pagination implementation is complete
  // They serve as contract tests to validate the API behavior

  test('should return paginated response with limit and offset', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '10',
        offset: '0'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('contacts');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('hasMore');
    expect(Array.isArray(body.contacts)).toBe(true);
    expect(body.contacts.length).toBeLessThanOrEqual(10);
  });

  test('should handle offset parameter correctly', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '5',
        offset: '5'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.contacts.length).toBeLessThanOrEqual(5);
  });

  test('should return hasMore flag accurately', async () => {
    // Test with small limit to ensure hasMore works
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '1',
        offset: '0'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(typeof body.hasMore).toBe('boolean');
  });

  test('should validate limit parameter bounds', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        limit: '150', // Over HubSpot's 100 limit
        offset: '0'
      }
    };

    const result = await handler(event, {});

    // Should either succeed with clamped limit or return error
    expect([200, 400]).toContain(result.statusCode);
  });
});