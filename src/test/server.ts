import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock API handlers
export const handlers = [
  // Supabase API mocks
  http.get('*/rest/v1/hubspot_connections', () => {
    return HttpResponse.json([
      {
        id: 'test-connection-id',
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        token_type: 'bearer',
      },
    ]);
  }),

  http.get('*/rest/v1/sync_sessions', () => {
    return HttpResponse.json([
      {
        id: 'test-session-id',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        total_contacts: 100,
        processed_contacts: 100,
        failed_contacts: 0,
      },
    ]);
  }),

  http.get('*/rest/v1/contacts', () => {
    return HttpResponse.json([
      {
        id: 'test-contact-id',
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        phone: '+1234567890',
        company: 'Test Company',
        createdate: new Date().toISOString(),
      },
    ]);
  }),

  // HubSpot API mocks
  http.get('https://api.hubapi.com/crm/v3/objects/contacts', () => {
    return HttpResponse.json({
      results: [
        {
          id: 'hubspot-contact-1',
          properties: {
            email: 'contact@example.com',
            firstname: 'Jane',
            lastname: 'Smith',
            phone: '+1987654321',
            company: 'Example Corp',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      paging: {
        next: {
          after: '100',
          link: '?after=100',
        },
      },
    });
  }),

  http.post('https://api.hubapi.com/oauth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 21600,
      token_type: 'bearer',
    });
  }),

  // Netlify function mocks for HubSpot service
  http.get('*/.netlify/functions/hubspot-test', () => {
    return HttpResponse.json({
      connected: true,
      total: 150,
      message: 'HubSpot connection successful',
    });
  }),

  http.post('*/.netlify/functions/hubspot-contacts', () => {
    return HttpResponse.json({
      results: [
        {
          id: 'hubspot-contact-1',
          properties: {
            email: 'contact1@example.com',
            firstname: 'Alice',
            lastname: 'Johnson',
            phone: '+1234567890',
            company: 'Tech Corp',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hubspot-contact-2',
          properties: {
            email: 'contact2@example.com',
            firstname: 'Bob',
            lastname: 'Smith',
            phone: '+1987654321',
            company: 'Design Studio',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
      paging: {
        next: {
          after: '2',
          link: '?after=2',
        },
      },
    });
  }),

  http.post('*/.netlify/functions/hubspot-contacts-all', () => {
    return HttpResponse.json({
      results: [
        {
          id: 'hubspot-contact-1',
          properties: {
            email: 'contact1@example.com',
            firstname: 'Alice',
            lastname: 'Johnson',
            phone: '+1234567890',
            company: 'Tech Corp',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hubspot-contact-2',
          properties: {
            email: 'contact2@example.com',
            firstname: 'Bob',
            lastname: 'Smith',
            phone: '+1987654321',
            company: 'Design Studio',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hubspot-contact-3',
          properties: {
            email: 'contact3@example.com',
            firstname: 'Carol',
            lastname: 'Williams',
            phone: '+1122334455',
            company: 'Marketing Inc',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 3,
      requestCount: 1,
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Test utilities for MSW
export const setupMSW = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

// Mock error responses
export const mockApiError = (url: string, status = 500) => {
  server.use(
    http.get(url, () => {
      return new HttpResponse(null, { status });
    })
  );
};

export const mockNetworkError = (url: string) => {
  server.use(
    http.get(url, () => {
      return HttpResponse.error();
    })
  );
};
