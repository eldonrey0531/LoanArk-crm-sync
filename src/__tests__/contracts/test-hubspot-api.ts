// src/__tests__/contracts/test-hubspot-api.ts

/**
 * Contract Tests for HubSpot API Endpoints
 *
 * These tests verify that the API contracts for HubSpot endpoints
 * are properly implemented. They should FAIL until the actual
 * implementation is created.
 *
 * Based on contracts/api-contracts.ts - HubSpotApiContracts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  HubSpotContactsRequest,
  HubSpotContactsResponse,
  HubSpotContactRequest,
  HubSpotContactResponse
} from '../../../specs/005-show-data-from/contracts/api-contracts';

// Mock the API endpoints
const API_BASE_URL = 'http://localhost:8888/.netlify/functions';

// Test data matching the contracts
const mockHubSpotContact = {
  id: '12345',
  properties: {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    email_verification_status: 'verified',
    hs_object_id: '12345'
  },
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-15T10:30:00Z'
};

const mockHubSpotContactsResponse: HubSpotContactsResponse = {
  success: true,
  data: [mockHubSpotContact],
  pagination: {
    next_after: '67890',
    has_more: false
  }
};

const mockHubSpotContactResponse: HubSpotContactResponse = {
  success: true,
  data: mockHubSpotContact
};

describe('HubSpot API Contracts', () => {
  describe('GET /api/hubspot/contacts - fetchContacts', () => {
    it('should return contacts with proper response structure', async () => {
      const request: HubSpotContactsRequest = {
        limit: 50,
        properties: ['firstname', 'lastname', 'email', 'email_verification_status']
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(`${API_BASE_URL}/hubspot-contacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);

      const data: HubSpotContactsResponse = await response.json();

      // Validate response structure matches contract
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');

      if (data.success && data.data) {
        expect(Array.isArray(data.data)).toBe(true);

        if (data.data.length > 0) {
          const contact = data.data[0];
          expect(contact).toHaveProperty('id');
          expect(contact).toHaveProperty('properties');
          expect(contact).toHaveProperty('createdAt');
          expect(contact).toHaveProperty('updatedAt');

          expect(contact.properties).toHaveProperty('firstname');
          expect(contact.properties).toHaveProperty('lastname');
          expect(contact.properties).toHaveProperty('email');
          expect(contact.properties).toHaveProperty('hs_object_id');
        }
      }

      expect(data.pagination).toHaveProperty('next_after');
      expect(data.pagination).toHaveProperty('has_more');
    });

    it('should handle pagination parameters correctly', async () => {
      const request: HubSpotContactsRequest = {
        after: '12345',
        limit: 25,
        properties: ['firstname', 'lastname', 'email']
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/hubspot-contacts?after=${request.after}&limit=${request.limit}&properties=${request.properties?.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);

      const data: HubSpotContactsResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.pagination.next_after).toBeDefined();
    });

    it('should handle properties parameter', async () => {
      const request: HubSpotContactsRequest = {
        properties: ['firstname', 'lastname', 'email', 'email_verification_status', 'hs_object_id']
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/hubspot-contacts?properties=${request.properties?.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);

      const data: HubSpotContactsResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data && data.data.length > 0) {
        const contact = data.data[0];
        // Verify that requested properties are included
        request.properties?.forEach(prop => {
          expect(contact.properties).toHaveProperty(prop);
        });
      }
    });

    it('should handle filter groups for advanced queries', async () => {
      const request: HubSpotContactsRequest = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email_verification_status',
                operator: 'HAS_PROPERTY',
                value: undefined
              }
            ]
          }
        ]
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(`${API_BASE_URL}/hubspot-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      expect(response.status).toBe(200);

      const data: HubSpotContactsResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data && data.data.length > 0) {
        // All returned contacts should have email_verification_status
        data.data.forEach(contact => {
          expect(contact.properties.email_verification_status).toBeDefined();
        });
      }
    });

    it('should handle error responses properly', async () => {
      // Test with invalid HubSpot API key scenario
      const response = await fetch(`${API_BASE_URL}/hubspot-contacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-key'
        }
      });

      const data: HubSpotContactsResponse = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });
  });

  describe('GET /api/hubspot/contacts/{contactId} - fetchContact', () => {
    it('should return individual contact with proper response structure', async () => {
      const request: HubSpotContactRequest = {
        contactId: '12345',
        properties: ['firstname', 'lastname', 'email', 'email_verification_status']
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/hubspot-contacts/${request.contactId}?properties=${request.properties?.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);

      const data: HubSpotContactResponse = await response.json();

      // Validate response structure matches contract
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');

      if (data.success && data.data) {
        expect(data.data).toHaveProperty('id');
        expect(data.data).toHaveProperty('properties');
        expect(data.data).toHaveProperty('createdAt');
        expect(data.data).toHaveProperty('updatedAt');
        expect(data.data.id).toBe(request.contactId);

        expect(data.data.properties).toHaveProperty('firstname');
        expect(data.data.properties).toHaveProperty('lastname');
        expect(data.data.properties).toHaveProperty('email');
        expect(data.data.properties).toHaveProperty('hs_object_id');
      }
    });

    it('should return 404 for non-existent contact', async () => {
      const request: HubSpotContactRequest = {
        contactId: 'non-existent-id'
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(`${API_BASE_URL}/hubspot-contacts/${request.contactId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(404);

      const data: HubSpotContactResponse = await response.json();

      expect(data.success).toBe(false);
      expect(data.data).toBeNull();
      expect(data.error).toBeDefined();
    });

    it('should handle invalid contact ID format', async () => {
      const response = await fetch(`${API_BASE_URL}/hubspot-contacts/invalid-format`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: HubSpotContactResponse = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should respect properties parameter for individual contact', async () => {
      const request: HubSpotContactRequest = {
        contactId: '12345',
        properties: ['firstname', 'email', 'email_verification_status']
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/hubspot-contacts/${request.contactId}?properties=${request.properties?.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);

      const data: HubSpotContactResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data) {
        // Verify that only requested properties are included
        const returnedProps = Object.keys(data.data.properties);
        expect(returnedProps).toEqual(expect.arrayContaining(request.properties!));
      }
    });
  });
});