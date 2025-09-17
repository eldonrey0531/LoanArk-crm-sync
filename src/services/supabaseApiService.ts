// src/services/supabaseApiService.ts

/**
 * Supabase API Service for Email Verification Data Display
 *
 * This service implements the SupabaseApiService interface defined in the contracts,
 * providing methods to fetch contact data from Supabase for the data display feature.
 */

import {
  SupabaseApiService,
  SupabaseContactsRequest,
  SupabaseContactsResponse,
  SupabaseContactRequest,
  SupabaseContactResponse,
  SupabaseContact,
  ApiError
} from '../types/emailVerificationDataDisplay';

// Mock Supabase client - in production, this would be the actual Supabase client
let supabaseClient: any = null;

/**
 * Initialize the Supabase API service with the database client
 */
export function initializeSupabaseApiService(client: any) {
  supabaseClient = client;
}

/**
 * Supabase API Service implementation
 */
export class SupabaseApiServiceImpl implements SupabaseApiService {

  /**
   * Fetch contacts with email verification data
   *
   * @param params - The request parameters
   * @returns Promise<SupabaseContactsResponse> - The response with contacts and pagination
   */
  async fetchContacts(params: SupabaseContactsRequest = {}): Promise<SupabaseContactsResponse> {
    try {
      if (!supabaseClient) {
        throw new ApiError({
          type: 'server',
          message: 'Supabase client not initialized',
          retryable: false
        });
      }

      const {
        page = 1,
        page_size = 25,
        filter_verified,
        search,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * page_size;

      // Build the query
      let query = supabaseClient
        .from('contacts')
        .select('*', { count: 'exact' })
        .range(offset, offset + page_size - 1);

      // Apply filters
      if (filter_verified !== undefined) {
        if (filter_verified) {
          query = query.not('email_verification_status', 'is', null);
        } else {
          query = query.is('email_verification_status', null);
        }
      }

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        throw new ApiError({
          type: 'server',
          message: `Database query failed: ${error.message}`,
          details: error,
          retryable: true
        });
      }

      // Transform data to match our interface
      const contacts: SupabaseContact[] = (data || []).map((contact: any) => ({
        id: contact.id,
        name: `${contact.firstname || ''} ${contact.lastname || ''}`.trim() || 'Unknown',
        email: contact.email || '',
        email_verification_status: contact.email_verification_status,
        hs_object_id: contact.hs_object_id || '',
        created_at: contact.created_at || contact.createdate || '',
        updated_at: contact.updated_at || contact.lastmodifieddate || ''
      }));

      // Calculate pagination info
      const total = count || 0;
      const totalPages = Math.ceil(total / page_size);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      return {
        success: true,
        data: contacts,
        pagination: {
          page,
          page_size,
          total,
          has_next: hasNext,
          has_previous: hasPrevious
        }
      };

    } catch (error) {
      if (error instanceof ApiError) {
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
          error: error.message
        };
      }

      // Handle unexpected errors
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
        error: apiError.message
      };
    }
  }

  /**
   * Fetch individual contact by ID
   *
   * @param params - The request parameters containing the contact ID
   * @returns Promise<SupabaseContactResponse> - The response with contact data or null
   */
  async fetchContact(params: SupabaseContactRequest): Promise<SupabaseContactResponse> {
    try {
      if (!supabaseClient) {
        throw new ApiError({
          type: 'server',
          message: 'Supabase client not initialized',
          retryable: false
        });
      }

      const { id } = params;

      // Validate input
      if (!id || typeof id !== 'number') {
        throw new ApiError({
          type: 'validation',
          message: 'Invalid contact ID provided',
          retryable: false
        });
      }

      // Execute the query
      const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return {
            success: true,
            data: null
          };
        }

        throw new ApiError({
          type: 'server',
          message: `Database query failed: ${error.message}`,
          details: error,
          retryable: true
        });
      }

      // Transform data to match our interface
      const contact: SupabaseContact = {
        id: data.id,
        name: `${data.firstname || ''} ${data.lastname || ''}`.trim() || 'Unknown',
        email: data.email || '',
        email_verification_status: data.email_verification_status,
        hs_object_id: data.hs_object_id || '',
        created_at: data.created_at || data.createdate || '',
        updated_at: data.updated_at || data.lastmodifieddate || ''
      };

      return {
        success: true,
        data: contact
      };

    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      // Handle unexpected errors
      const apiError = new ApiError({
        type: 'server',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
        retryable: true
      });

      return {
        success: false,
        data: null,
        error: apiError.message
      };
    }
  }
}

// Export singleton instance
export const supabaseApiService = new SupabaseApiServiceImpl();

// Export factory function for testing
export function createSupabaseApiService(): SupabaseApiService {
  return new SupabaseApiServiceImpl();
}