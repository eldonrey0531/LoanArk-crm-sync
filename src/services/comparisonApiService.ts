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
import { supabaseApiService } from './supabaseApiService';
import { hubspotApiService } from './hubspotApiService';

/**
 * Comparison API Service implementation
 */
export class ComparisonApiServiceImpl implements ComparisonApiService {

  /**
   * Fetch side-by-side comparison data
   *
   * @param params - The request parameters
   * @returns Promise<ComparisonResponse> - The response with comparison data and summary
   */
  async fetchComparison(params: ComparisonRequest = {}): Promise<ComparisonResponse> {
    try {
      const {
        page = 1,
        page_size = 25,
        filter_status = 'all',
        search
      } = params;

      // Fetch data from both sources in parallel
      const [supabaseResponse, hubspotResponse] = await Promise.allSettled([
        this.fetchSupabaseContacts(params),
        this.fetchHubSpotContacts(params)
      ]);

      // Handle Supabase response
      let supabaseContacts: SupabaseContact[] = [];
      if (supabaseResponse.status === 'fulfilled') {
        supabaseContacts = supabaseResponse.value;
      } else {
        console.warn('Failed to fetch Supabase contacts:', supabaseResponse.reason);
      }

      // Handle HubSpot response
      let hubspotContacts: HubSpotContact[] = [];
      if (hubspotResponse.status === 'fulfilled') {
        hubspotContacts = hubspotResponse.value;
      } else {
        console.warn('Failed to fetch HubSpot contacts:', hubspotResponse.reason);
      }

      // Create comparison data
      const comparisons = this.createComparisons(supabaseContacts, hubspotContacts);

      // Apply filters
      let filteredComparisons = this.applyFilters(comparisons, filter_status, search);

      // Calculate summary
      const summary = this.calculateSummary(comparisons);

      // Apply pagination
      const total = filteredComparisons.length;
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedComparisons = filteredComparisons.slice(startIndex, endIndex);

      // Calculate pagination info
      const totalPages = Math.ceil(total / page_size);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      return {
        success: true,
        data: paginatedComparisons,
        pagination: {
          page,
          page_size,
          total,
          has_next: hasNext,
          has_previous: hasPrevious
        },
        summary
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
   * Fetch contacts from Supabase with filtering
   */
  private async fetchSupabaseContacts(params: ComparisonRequest): Promise<SupabaseContact[]> {
    const request = {
      page: 1,
      page_size: 1000, // Fetch more to allow for client-side filtering
      search: params.search,
      sort_by: 'created_at' as const,
      sort_order: 'desc' as const
    };

    const response = await supabaseApiService.fetchContacts(request);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch Supabase contacts');
    }

    return response.data;
  }

  /**
   * Fetch contacts from HubSpot with filtering
   */
  private async fetchHubSpotContacts(params: ComparisonRequest): Promise<HubSpotContact[]> {
    const request = {
      limit: 1000, // Fetch more to allow for client-side filtering
      properties: ['firstname', 'lastname', 'email', 'email_verification_status', 'hs_object_id']
    };

    const response = await hubspotApiService.fetchContacts(request);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch HubSpot contacts');
    }

    return response.data;
  }

  /**
   * Create comparison objects from Supabase and HubSpot data
   */
  private createComparisons(supabaseContacts: SupabaseContact[], hubspotContacts: HubSpotContact[]): ContactComparison[] {
    const comparisons: ContactComparison[] = [];
    const processedHubSpotIds = new Set<string>();

    // Create map of HubSpot contacts by hs_object_id for efficient lookup
    const hubspotByObjectId = new Map<string, HubSpotContact>();
    hubspotContacts.forEach(contact => {
      if (contact.properties.hs_object_id) {
        hubspotByObjectId.set(contact.properties.hs_object_id, contact);
      }
    });

    // Process Supabase contacts
    supabaseContacts.forEach(supabaseContact => {
      const hubspotContact = hubspotByObjectId.get(supabaseContact.hs_object_id);

      if (hubspotContact) {
        // Matched contact
        processedHubSpotIds.add(hubspotContact.id);
        const differences = this.compareContacts(supabaseContact, hubspotContact);
        const matchStatus = differences.length > 0 ? 'mismatch' : 'matched';

        comparisons.push({
          id: `comparison-${supabaseContact.id}`,
          supabase: supabaseContact,
          hubspot: hubspotContact,
          match_status: matchStatus,
          differences,
          last_sync: new Date().toISOString()
        });
      } else {
        // Supabase only
        comparisons.push({
          id: `comparison-${supabaseContact.id}`,
          supabase: supabaseContact,
          hubspot: null,
          match_status: 'supabase_only',
          differences: [],
          last_sync: null
        });
      }
    });

    // Process remaining HubSpot contacts (HubSpot only)
    hubspotContacts.forEach(hubspotContact => {
      if (!processedHubSpotIds.has(hubspotContact.id)) {
        comparisons.push({
          id: `comparison-${hubspotContact.id}`,
          supabase: null,
          hubspot: hubspotContact,
          match_status: 'hubspot_only',
          differences: [],
          last_sync: null
        });
      }
    });

    return comparisons;
  }

  /**
   * Compare two contacts and identify differences
   */
  private compareContacts(supabase: SupabaseContact, hubspot: HubSpotContact): ContactDifference[] {
    const differences: ContactDifference[] = [];

    // Compare email verification status
    if (supabase.email_verification_status !== hubspot.properties.email_verification_status) {
      differences.push({
        field: 'email_verification_status',
        supabase_value: supabase.email_verification_status,
        hubspot_value: hubspot.properties.email_verification_status,
        severity: 'warning'
      });
    }

    // Compare email
    if (supabase.email !== hubspot.properties.email) {
      differences.push({
        field: 'email',
        supabase_value: supabase.email,
        hubspot_value: hubspot.properties.email,
        severity: 'error'
      });
    }

    // Compare names (basic comparison)
    const supabaseName = supabase.name.toLowerCase().trim();
    const hubspotName = `${hubspot.properties.firstname || ''} ${hubspot.properties.lastname || ''}`.toLowerCase().trim();

    if (supabaseName !== hubspotName && supabaseName !== '' && hubspotName !== '') {
      differences.push({
        field: 'name',
        supabase_value: supabase.name,
        hubspot_value: hubspotName,
        severity: 'info'
      });
    }

    return differences;
  }

  /**
   * Apply filters to comparison data
   */
  private applyFilters(
    comparisons: ContactComparison[],
    filterStatus: string,
    search?: string
  ): ContactComparison[] {
    let filtered = comparisons;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(comparison => comparison.match_status === filterStatus);
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filtered = filtered.filter(comparison => {
        const supabaseMatch = comparison.supabase &&
          (comparison.supabase.name.toLowerCase().includes(searchTerm) ||
           comparison.supabase.email.toLowerCase().includes(searchTerm));

        const hubspotMatch = comparison.hubspot &&
          ((comparison.hubspot.properties.firstname + ' ' + comparison.hubspot.properties.lastname).toLowerCase().includes(searchTerm) ||
           comparison.hubspot.properties.email.toLowerCase().includes(searchTerm));

        return supabaseMatch || hubspotMatch;
      });
    }

    return filtered;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(comparisons: ContactComparison[]) {
    const summary = {
      total_matched: 0,
      total_supabase_only: 0,
      total_hubspot_only: 0,
      total_mismatches: 0
    };

    comparisons.forEach(comparison => {
      switch (comparison.match_status) {
        case 'matched':
          summary.total_matched++;
          break;
        case 'supabase_only':
          summary.total_supabase_only++;
          break;
        case 'hubspot_only':
          summary.total_hubspot_only++;
          break;
        case 'mismatch':
          summary.total_mismatches++;
          break;
      }
    });

    return summary;
  }
}

// Export singleton instance
export const comparisonApiService = new ComparisonApiServiceImpl();

// Export factory function for testing
export function createComparisonApiService(): ComparisonApiService {
  return new ComparisonApiServiceImpl();
}