// src/services/comparisonApiService.ts

/**
 * Comparison API Service for Email Verification Data Display
 *
 * This service implements the ComparisonApiService interface defined in the contracts,
 * providing methods to fetch and compare contact data from both Supabase and HubSpot.
 */

import {
  ComparisonApiService,
  ComparisonRequest,
  ComparisonResponse,
  ContactComparison,
  ContactDifference,
  SupabaseContact,
  HubSpotContact,
  ApiError
} from '../types/emailVerificationDataDisplay';

/**
 * Comparison API Service implementation
 */
export class ComparisonApiServiceImpl implements ComparisonApiService {

  /**
   * Fetch side-by-side comparison data using the combined sync display endpoint
   *
   * @param params - The request parameters
   * @returns Promise<ComparisonResponse> - The response with comparison data and summary
   */
  async fetchComparison(params: ComparisonRequest = {}): Promise<ComparisonResponse> {
    try {
      const {
        page = 1,
        page_size = 25,
        filter_status,
        search,
        has_hubspot_match
      } = params;

      // Build query parameters for the combined endpoint
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: page_size.toString()
      });

      if (filter_status && filter_status !== 'all') {
        queryParams.append('status', filter_status);
      }

      if (search) {
        queryParams.append('search', search);
      }

      if (has_hubspot_match !== undefined) {
        queryParams.append('hasHubSpotMatch', has_hubspot_match.toString());
      }

      // Fetch from the combined sync display endpoint
      const response = await fetch(`/.netlify/functions/email-verification-sync-display?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'API request failed');
      }

      // Transform the response to match our expected format
      const comparisons = this.transformApiResponse(data.data);

      return {
        success: true,
        data: comparisons,
        pagination: {
          page: data.data.pagination.page,
          page_size: data.data.pagination.limit,
          total: data.data.pagination.total,
          has_next: data.data.pagination.hasNextPage,
          has_previous: data.data.pagination.hasPreviousPage
        },
        summary: {
          total_matched: data.data.matchedRecords.length,
          total_supabase_only: data.data.unmatchedRecords.supabaseOnly.length,
          total_hubspot_only: data.data.unmatchedRecords.hubspotOnly.length,
          total_mismatches: 0 // We'll calculate this from the data
        }
      };

    } catch (error) {
      const apiError = new ApiError({
        type: 'server',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
        retryable: true
      });

      return {
        success: false,
        data: [],
        pagination: {
          page: params.page || 1,
          page_size: params.page_size || 25,
          total: 0,
          has_next: false,
          has_previous: false
        },
        summary: {
          total_matched: 0,
          total_supabase_only: 0,
          total_hubspot_only: 0,
          total_mismatches: 0
        },
        error: apiError.message
      };
    }
  }

  /**
   * Transform API response data to ContactComparison format
   */
  private transformApiResponse(apiData: any): ContactComparison[] {
    const comparisons: ContactComparison[] = [];

    // Add matched records
    apiData.matchedRecords.forEach((matched: any) => {
      comparisons.push({
        id: matched.supabaseContact.id.toString(),
        supabase: {
          id: matched.supabaseContact.id,
          name: `${matched.supabaseContact.firstname || ''} ${matched.supabaseContact.lastname || ''}`.trim() || 'Unknown',
          email: matched.supabaseContact.email || '',
          email_verification_status: matched.supabaseContact.email_verification_status,
          hs_object_id: matched.supabaseContact.hs_object_id,
          created_at: matched.supabaseContact.created_at,
          updated_at: matched.supabaseContact.updated_at
        },
        hubspot: {
          id: matched.hubspotContact.id,
          properties: {
            firstname: matched.hubspotContact.properties?.firstname || '',
            lastname: matched.hubspotContact.properties?.lastname || '',
            email: matched.hubspotContact.properties?.email || '',
            email_verification_status: matched.hubspotContact.properties?.email_verification_status,
            hs_object_id: matched.hubspotContact.id
          },
          createdAt: matched.hubspotContact.createdAt,
          updatedAt: matched.hubspotContact.updatedAt
        },
        match_status: 'matched',
        differences: [],
        last_sync: matched.matchedAt
      });
    });

    // Add unmatched Supabase records
    apiData.unmatchedRecords.supabaseOnly.forEach((record: any) => {
      comparisons.push({
        id: record.id.toString(),
        supabase: {
          id: record.id,
          name: `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'Unknown',
          email: record.email || '',
          email_verification_status: record.email_verification_status,
          hs_object_id: record.hs_object_id,
          created_at: record.created_at,
          updated_at: record.updated_at
        },
        hubspot: null,
        match_status: 'supabase_only',
        differences: [],
        last_sync: null
      });
    });

    // Add unmatched HubSpot records
    apiData.unmatchedRecords.hubspotOnly.forEach((record: any) => {
      comparisons.push({
        id: record.id,
        supabase: null,
        hubspot: {
          id: record.id,
          properties: {
            firstname: record.properties?.firstname || '',
            lastname: record.properties?.lastname || '',
            email: record.properties?.email || '',
            email_verification_status: record.properties?.email_verification_status,
            hs_object_id: record.id
          },
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        },
        match_status: 'hubspot_only',
        differences: [],
        last_sync: null
      });
    });

    return comparisons;
  }
}

// Export singleton instance
export const comparisonApiService = new ComparisonApiServiceImpl();

// Export factory function for testing
export function createComparisonApiService(): ComparisonApiService {
  return new ComparisonApiServiceImpl();
}