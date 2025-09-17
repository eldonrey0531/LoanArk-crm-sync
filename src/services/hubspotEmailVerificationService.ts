// src/services/hubspotEmailVerificationService.ts

/**
 * HubSpot Email Verification Service
 *
 * This service handles all HubSpot CRM operations for the email verification
 * sync feature, including contact updates and API interactions.
 */

import {
  HubSpotContact,
  HubSpotEmailVerificationService as IHubSpotEmailVerificationService,
} from '../types/emailVerification';

// Mock HubSpot client - in production, this would be the actual HubSpot API client
let hubspotClient: any = null;

/**
 * Initialize the HubSpot service with the API client
 */
export function initializeHubSpotEmailVerificationService(client: any) {
  hubspotClient = client;
}

/**
 * HubSpot Email Verification Service implementation
 */
export class HubSpotEmailVerificationService
  implements IHubSpotEmailVerificationService
{
  /**
   * Update a contact's email verification status in HubSpot
   *
   * @param contactId - The HubSpot contact ID
   * @param status - The email verification status to set
   * @returns Promise<any> - The HubSpot API response
   */
  async updateEmailVerificationStatus(
    contactId: string,
    status: string
  ): Promise<any> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      // Validate the status
      if (!this.validateStatus(status)) {
        throw new Error(`Invalid email verification status: ${status}`);
      }

      // Prepare the update payload
      const updatePayload = {
        properties: {
          email_verification_status: status,
        },
      };

      // Make the API call to update the contact
      const response = await hubspotClient.crm.contacts.basicApi.update(
        contactId,
        updatePayload
      );

      return {
        id: contactId,
        updatedAt: new Date().toISOString(),
        properties: {
          email_verification_status: status,
        },
        ...response,
      };
    } catch (error: any) {
      console.error(`Error updating HubSpot contact ${contactId}:`, error);

      // Handle specific HubSpot API errors
      if (error.response?.status === 404) {
        throw new Error(`HubSpot contact ${contactId} not found`);
      }

      if (error.response?.status === 429) {
        throw new Error('HubSpot API rate limit exceeded');
      }

      if (error.response?.status === 401) {
        throw new Error('HubSpot authentication failed');
      }

      // Re-throw with more context
      throw new Error(`HubSpot API error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a contact by ID from HubSpot
   *
   * @param contactId - The HubSpot contact ID
   * @returns Promise<HubSpotContact | null> - The contact or null if not found
   */
  async getContactById(contactId: string): Promise<HubSpotContact | null> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      const response = await hubspotClient.crm.contacts.basicApi.getById(
        contactId,
        [
          'firstname',
          'lastname',
          'email',
          'email_verification_status',
          'createdate',
          'lastmodifieddate',
        ]
      );

      return {
        id: contactId,
        properties: response.properties,
      } as HubSpotContact;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      throw new Error(
        `Failed to get HubSpot contact: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Validate that a contact exists in HubSpot
   *
   * @param contactId - The HubSpot contact ID
   * @returns Promise<boolean> - True if contact exists, false otherwise
   */
  async validateContactExists(contactId: string): Promise<boolean> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      // Attempt to get the contact (this will throw if not found)
      await hubspotClient.crm.contacts.basicApi.getById(
        contactId,
        ['email_verification_status'] // Only fetch the property we need
      );

      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }

      // For other errors, re-throw
      throw new Error(
        `HubSpot contact validation failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Batch update multiple contacts' email verification status
   *
   * @param updates - Array of contact updates
   * @returns Promise<any[]> - Array of update results
   */
  async batchUpdateEmailVerificationStatus(
    updates: Array<{ contactId: string; status: string }>
  ): Promise<any[]> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      // Validate all statuses first
      for (const update of updates) {
        if (!this.validateStatus(update.status)) {
          throw new Error(
            `Invalid email verification status: ${update.status}`
          );
        }
      }

      // Prepare batch update payload
      const batchInputs = updates.map(update => ({
        id: update.contactId,
        properties: {
          email_verification_status: update.status,
        },
      }));

      // Execute batch update
      const response = await hubspotClient.crm.contacts.batchApi.update({
        inputs: batchInputs,
      });

      // Return results with additional metadata
      return response.results.map((result: any, index: number) => ({
        contactId: updates[index].contactId,
        status: updates[index].status,
        updatedAt: new Date().toISOString(),
        ...result,
      }));
    } catch (error: any) {
      console.error('Error in batch update:', error);
      throw new Error(
        `HubSpot batch update failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Search for contacts in HubSpot by email
   *
   * @param email - The email address to search for
   * @returns Promise<HubSpotContact | null> - The contact or null if not found
   */
  async searchContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      const searchRequest = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: [
          'firstname',
          'lastname',
          'email',
          'email_verification_status',
          'createdate',
          'lastmodifieddate',
        ],
      };

      const response =
        await hubspotClient.crm.contacts.searchApi.doSearch(searchRequest);

      if (response.results && response.results.length > 0) {
        const contact = response.results[0];
        return {
          id: contact.id,
          properties: contact.properties,
        } as HubSpotContact;
      }

      return null;
    } catch (error: any) {
      console.error(
        `Error searching HubSpot contact by email ${email}:`,
        error
      );
      throw new Error(
        `HubSpot search failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get multiple contacts by their IDs
   *
   * @param contactIds - Array of HubSpot contact IDs
   * @returns Promise<HubSpotContact[]> - Array of contacts
   */
  async getContactsByIds(contactIds: string[]): Promise<HubSpotContact[]> {
    try {
      if (!hubspotClient) {
        throw new Error('HubSpot client not initialized');
      }

      if (contactIds.length === 0) {
        return [];
      }

      // HubSpot batch API has limits, so we'll process in chunks if needed
      const batchSize = 100;
      const results: HubSpotContact[] = [];

      for (let i = 0; i < contactIds.length; i += batchSize) {
        const batch = contactIds.slice(i, i + batchSize);

        const batchRequest = {
          inputs: batch.map(id => ({ id })),
          properties: [
            'firstname',
            'lastname',
            'email',
            'email_verification_status',
          ],
        };

        const response =
          await hubspotClient.crm.contacts.batchApi.read(batchRequest);

        if (response.results) {
          results.push(
            ...response.results.map(
              (result: any) =>
                ({
                  id: result.id,
                  properties: result.properties,
                }) as HubSpotContact
            )
          );
        }
      }

      return results;
    } catch (error: any) {
      console.error('Error fetching contacts by IDs:', error);
      throw new Error(
        `HubSpot batch read failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Validate email verification status value
   *
   * @param status - The status value to validate
   * @returns boolean - True if valid, false otherwise
   */
  validateStatus(status: string): boolean {
    const validStatuses = [
      'verified',
      'unverified',
      'pending',
      'bounced',
      'complained',
    ];

    return validStatuses.includes(status.toLowerCase());
  }

  /**
   * Check if HubSpot API is accessible and authenticated
   *
   * @returns Promise<boolean> - True if API is accessible, false otherwise
   */
  async checkApiConnectivity(): Promise<boolean> {
    try {
      if (!hubspotClient) {
        return false;
      }

      // Simple API call to check connectivity
      await hubspotClient.crm.contacts.basicApi.getPage({
        limit: 1,
        properties: ['email'],
      });

      return true;
    } catch (error) {
      console.error('HubSpot API connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Get API rate limit status
   *
   * @returns Promise<object> - Rate limit information
   */
  async getRateLimitStatus(): Promise<{
    remaining: number;
    limit: number;
    resetTime: Date | null;
  }> {
    try {
      // This would typically come from HubSpot API response headers
      // For now, return mock data
      return {
        remaining: 100, // Mock remaining calls
        limit: 120, // Mock limit per minute
        resetTime: new Date(Date.now() + 60000), // Mock reset in 1 minute
      };
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hubspotEmailVerificationService =
  new HubSpotEmailVerificationService();

// Export the service class and instance
export default HubSpotEmailVerificationService;
