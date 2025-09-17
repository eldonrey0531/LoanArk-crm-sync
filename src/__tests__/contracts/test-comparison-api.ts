// src/__tests__/contracts/test-comparison-api.ts

/**
 * Contract Tests for Comparison API Endpoints
 *
 * These tests verify that the API contracts for comparison endpoints
 * are properly implemented. They should FAIL until the actual
 * implementation is created.
 *
 * Based on contracts/api-contracts.ts - ComparisonApiContracts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ComparisonRequest,
  ComparisonResponse,
} from '../../../specs/005-show-data-from/contracts/api-contracts';

// Mock the API endpoints
const API_BASE_URL = 'http://localhost:3000/api';

// Test data matching the contracts
const mockSupabaseContact = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  email_verification_status: 'verified',
  hs_object_id: '12345',
  created_at: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-15T10:30:00Z',
};

const mockHubSpotContact = {
  id: '12345',
  properties: {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    email_verification_status: 'verified',
    hs_object_id: '12345',
  },
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-15T10:30:00Z',
};

const mockContactComparison = {
  id: 'comparison-1',
  supabase: mockSupabaseContact,
  hubspot: mockHubSpotContact,
  match_status: 'matched' as const,
  differences: [],
  last_sync: '2025-01-15T10:30:00Z',
};

const mockComparisonResponse: ComparisonResponse = {
  success: true,
  data: [mockContactComparison],
  pagination: {
    page: 1,
    page_size: 50,
    total: 1,
    has_next: false,
    has_previous: false,
  },
  summary: {
    total_matched: 1,
    total_supabase_only: 0,
    total_hubspot_only: 0,
    total_mismatches: 0,
  },
};

describe('Comparison API Contracts', () => {
  describe('GET /api/comparison/email-verification - fetchComparison', () => {
    it('should return comparison data with proper response structure', async () => {
      const request: ComparisonRequest = {
        page: 1,
        page_size: 50,
        filter_status: 'all',
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      // Validate response structure matches contract
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data).toHaveProperty('summary');

      if (data.success && data.data) {
        expect(Array.isArray(data.data)).toBe(true);

        if (data.data.length > 0) {
          const comparison = data.data[0];
          expect(comparison).toHaveProperty('id');
          expect(comparison).toHaveProperty('supabase');
          expect(comparison).toHaveProperty('hubspot');
          expect(comparison).toHaveProperty('match_status');
          expect(comparison).toHaveProperty('differences');

          // Validate match_status enum values
          expect([
            'matched',
            'supabase_only',
            'hubspot_only',
            'mismatch',
          ]).toContain(comparison.match_status);

          // Validate differences array
          expect(Array.isArray(comparison.differences)).toBe(true);

          if (comparison.differences.length > 0) {
            const difference = comparison.differences[0];
            expect(difference).toHaveProperty('field');
            expect(difference).toHaveProperty('supabase_value');
            expect(difference).toHaveProperty('hubspot_value');
            expect(difference).toHaveProperty('severity');
            expect(['info', 'warning', 'error']).toContain(difference.severity);
          }
        }
      }

      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('page_size');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('has_next');
      expect(data.pagination).toHaveProperty('has_previous');

      expect(data.summary).toHaveProperty('total_matched');
      expect(data.summary).toHaveProperty('total_supabase_only');
      expect(data.summary).toHaveProperty('total_hubspot_only');
      expect(data.summary).toHaveProperty('total_mismatches');

      // Validate summary totals add up
      const {
        total_matched,
        total_supabase_only,
        total_hubspot_only,
        total_mismatches,
      } = data.summary;
      expect(
        total_matched +
          total_supabase_only +
          total_hubspot_only +
          total_mismatches
      ).toBe(data.pagination.total);
    });

    it('should handle pagination parameters correctly', async () => {
      const request: ComparisonRequest = {
        page: 2,
        page_size: 25,
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison?page=${request.page}&page_size=${request.page_size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.pagination.page).toBe(request.page);
      expect(data.pagination.page_size).toBe(request.page_size);
    });

    it('should handle status filtering correctly', async () => {
      const request: ComparisonRequest = {
        filter_status: 'matched',
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison?filter_status=${request.filter_status}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data && data.data.length > 0) {
        // All returned comparisons should have the filtered status
        data.data.forEach(comparison => {
          expect(comparison.match_status).toBe(request.filter_status);
        });
      }
    });

    it('should handle search parameter for filtering contacts', async () => {
      const request: ComparisonRequest = {
        search: 'john.doe@example.com',
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison?search=${encodeURIComponent(request.search!)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data && data.data.length > 0) {
        // At least one contact should match the search term
        const hasMatchingContact = data.data.some(comparison => {
          const supabaseMatch = comparison.supabase?.email
            .toLowerCase()
            .includes(request.search!.toLowerCase());
          const hubspotMatch = comparison.hubspot?.properties.email
            .toLowerCase()
            .includes(request.search!.toLowerCase());
          return supabaseMatch || hubspotMatch;
        });
        expect(hasMatchingContact).toBe(true);
      }
    });

    it('should return different match statuses correctly', async () => {
      // Test each filter status
      const statuses: Array<
        'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch'
      > = ['matched', 'supabase_only', 'hubspot_only', 'mismatch'];

      for (const status of statuses) {
        const response = await fetch(
          `${API_BASE_URL}/email-verification-comparison?filter_status=${status}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(response.status).toBe(200);

        const data: ComparisonResponse = await response.json();

        expect(data.success).toBe(true);

        if (data.data && data.data.length > 0) {
          data.data.forEach(comparison => {
            expect(comparison.match_status).toBe(status);
          });
        }
      }
    });

    it('should handle empty results gracefully', async () => {
      const request: ComparisonRequest = {
        search: 'non-existent-email@example.com',
      };

      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison?search=${encodeURIComponent(request.search!)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
      expect(data.summary.total_matched).toBe(0);
      expect(data.summary.total_supabase_only).toBe(0);
      expect(data.summary.total_hubspot_only).toBe(0);
      expect(data.summary.total_mismatches).toBe(0);
    });

    it('should handle error responses properly', async () => {
      // Test with invalid parameters
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison?page=-1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });

    it('should validate response data integrity', async () => {
      // This test should fail until the endpoint is implemented
      const response = await fetch(
        `${API_BASE_URL}/email-verification-comparison`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const data: ComparisonResponse = await response.json();

      expect(data.success).toBe(true);

      if (data.data && data.data.length > 0) {
        data.data.forEach(comparison => {
          // Validate that if both contacts exist, they should have matching hs_object_id
          if (comparison.supabase && comparison.hubspot) {
            expect(comparison.supabase.hs_object_id).toBe(
              comparison.hubspot.properties.hs_object_id
            );
          }

          // Validate that match_status is consistent with data presence
          if (comparison.match_status === 'matched') {
            expect(comparison.supabase).toBeTruthy();
            expect(comparison.hubspot).toBeTruthy();
          } else if (comparison.match_status === 'supabase_only') {
            expect(comparison.supabase).toBeTruthy();
            expect(comparison.hubspot).toBeNull();
          } else if (comparison.match_status === 'hubspot_only') {
            expect(comparison.supabase).toBeNull();
            expect(comparison.hubspot).toBeTruthy();
          }
        });
      }
    });
  });
});
