// src/services/hubspotApiService.ts

/**
 * HubSpot API Service for Email Verification Data Display
 *
 * This service implements the HubSpotApiService interface defined in the contracts,
 * providing methods to fetch contact data from HubSpot for the data display feature.
 */

import {
  HubSpotApiService,
  HubSpotContactsRequest,
  HubSpotContactsResponse,
  HubSpotContactRequest,
  HubSpotContactResponse,
  HubSpotContact,
  HubSpotFilterGroup,
  ApiError,
} from '../types/emailVerificationDataDisplay';

// Mock HubSpot client - in production, this would be the actual HubSpot API client
let hubspotClient: any = null;

/**
 * Initialize the HubSpot API service with the API client
 */
export function initializeHubSpotApiService(client: any) {
  hubspotClient = client;
}

/**
 * HubSpot API Service implementation
 */
export class HubSpotApiServiceImpl implements HubSpotApiService {
  /**
   * Fetch contacts from HubSpot
   *
   * @param params - The request parameters
   * @returns Promise<HubSpotContactsResponse> - The response with contacts and pagination
   */
  async fetchContacts(
    params: HubSpotContactsRequest = {}
  ): Promise<HubSpotContactsResponse> {
    try {
      if (!hubspotClient) {
        throw new ApiError({
          type: 'server',
          message: 'HubSpot client not initialized',
          retryable: false,
        });
      }

      const {
        after,
        limit = 100,
        properties = [
          'firstname',
          'lastname',
          'email',
          'email_verification_status',
          'hs_object_id',
        ],
        filterGroups,
      } = params;

      // Build the request payload
      const requestBody: any = {
        properties,
        limit,
      };

      // Add pagination
      if (after) {
        requestBody.after = after;
      }

      // Add filters if provided
      if (filterGroups && filterGroups.length > 0) {
        requestBody.filterGroups = filterGroups;
      }

      // Execute the API call
      const response = await hubspotClient.post(
        '/crm/v3/objects/contacts/search',
        requestBody
      );

      if (!response.data) {
        throw new ApiError({
          type: 'server',
          message: 'Invalid response from HubSpot API',
          retryable: true,
        });
      }

      // Transform data to match our interface
      const contacts: HubSpotContact[] = (response.data.results || []).map(
        (contact: any) => ({
          id: contact.id,
          properties: {
            firstname: contact.properties?.firstname || '',
            lastname: contact.properties?.lastname || '',
            email: contact.properties?.email || '',
            email_verification_status:
              contact.properties?.email_verification_status,
            hs_object_id: contact.properties?.hs_object_id || contact.id,
          },
          createdAt: contact.createdAt || contact.properties?.createdate || '',
          updatedAt:
            contact.updatedAt || contact.properties?.lastmodifieddate || '',
        })
      );

      // Extract pagination info
      const pagination = response.data.paging || {};
      const nextAfter = pagination.next?.after;
      const hasMore = !!nextAfter;

      return {
        success: true,
        data: contacts,
        pagination: {
          next_after: nextAfter,
          has_more: hasMore,
        },
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        return {
          success: false,
          data: [],
          pagination: {
            has_more: false,
          },
          error: error.message,
        };
      }

      // Handle HubSpot API errors
      if (error.response) {
        const status = error.response.status;
        const hubspotError = error.response.data;

        if (status === 401) {
          return {
            success: false,
            data: [],
            pagination: { has_more: false },
            error: 'HubSpot authentication failed. Please re-authenticate.',
          };
        }

        if (status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          return {
            success: false,
            data: [],
            pagination: { has_more: false },
            error: 'HubSpot API rate limit exceeded. Please try again later.',
          };
        }

        return {
          success: false,
          data: [],
          pagination: { has_more: false },
          error: hubspotError?.message || `HubSpot API error: ${status}`,
        };
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          data: [],
          pagination: { has_more: false },
          error: 'Network error. Please check your connection and try again.',
        };
      }

      // Handle unexpected errors
      const apiError = new ApiError({
        type: 'server',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
        retryable: true,
      });

      return {
        success: false,
        data: [],
        pagination: { has_more: false },
        error: apiError.message,
      };
    }
  }

  /**
   * Fetch individual contact from HubSpot
   *
   * @param params - The request parameters containing the contact ID
   * @returns Promise<HubSpotContactResponse> - The response with contact data or null
   */
  async fetchContact(
    params: HubSpotContactRequest
  ): Promise<HubSpotContactResponse> {
    try {
      if (!hubspotClient) {
        throw new ApiError({
          type: 'server',
          message: 'HubSpot client not initialized',
          retryable: false,
        });
      }

      const {
        contactId,
        properties = [
          'firstname',
          'lastname',
          'email',
          'email_verification_status',
          'hs_object_id',
        ],
      } = params;

      // Validate input
      if (!contactId || typeof contactId !== 'string') {
        throw new ApiError({
          type: 'validation',
          message: 'Invalid contact ID provided',
          retryable: false,
        });
      }

      // Build the properties query string
      const propertiesQuery = properties.join(',');

      // Execute the API call
      const response = await hubspotClient.get(
        `/crm/v3/objects/contacts/${contactId}`,
        {
          params: { properties: propertiesQuery },
        }
      );

      if (!response.data) {
        throw new ApiError({
          type: 'server',
          message: 'Invalid response from HubSpot API',
          retryable: true,
        });
      }

      // Transform data to match our interface
      const contact: HubSpotContact = {
        id: response.data.id,
        properties: {
          firstname: response.data.properties?.firstname || '',
          lastname: response.data.properties?.lastname || '',
          email: response.data.properties?.email || '',
          email_verification_status:
            response.data.properties?.email_verification_status,
          hs_object_id:
            response.data.properties?.hs_object_id || response.data.id,
        },
        createdAt:
          response.data.createdAt || response.data.properties?.createdate || '',
        updatedAt:
          response.data.updatedAt ||
          response.data.properties?.lastmodifieddate ||
          '',
      };

      return {
        success: true,
        data: contact,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      // Handle HubSpot API errors
      if (error.response) {
        const status = error.response.status;
        const hubspotError = error.response.data;

        if (status === 404) {
          return {
            success: true,
            data: null,
          };
        }

        if (status === 401) {
          return {
            success: false,
            data: null,
            error: 'HubSpot authentication failed. Please re-authenticate.',
          };
        }

        if (status === 429) {
          return {
            success: false,
            data: null,
            error: 'HubSpot API rate limit exceeded. Please try again later.',
          };
        }

        return {
          success: false,
          data: null,
          error: hubspotError?.message || `HubSpot API error: ${status}`,
        };
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          data: null,
          error: 'Network error. Please check your connection and try again.',
        };
      }

      // Handle unexpected errors
      const apiError = new ApiError({
        type: 'server',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
        retryable: true,
      });

      return {
        success: false,
        data: null,
        error: apiError.message,
      };
    }
  }
}

// Export singleton instance
export const hubspotApiService = new HubSpotApiServiceImpl();

// Export factory function for testing
export function createHubSpotApiService(): HubSpotApiService {
  return new HubSpotApiServiceImpl();
}
