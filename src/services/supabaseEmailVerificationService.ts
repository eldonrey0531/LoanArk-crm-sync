// src/services/supabaseEmailVerificationService.ts

/**
 * Supabase Email Verification Service
 *
 * This service handles all Supabase database operations for the email verification
 * sync feature, including contact retrieval, validation, and data access.
 */

import {
  SupabaseContact,
  SupabaseEmailVerificationService as ISupabaseEmailVerificationService,
  GetEmailVerificationRecordsParams,
  PaginationInfo,
} from '../types/emailVerification';

// Mock Supabase client - in production, this would be the actual Supabase client
let supabaseClient: any = null;

/**
 * Initialize the Supabase service with the database client
 */
export function initializeSupabaseEmailVerificationService(client: any) {
  supabaseClient = client;
}

/**
 * Supabase Email Verification Service implementation
 */
export class SupabaseEmailVerificationService
  implements ISupabaseEmailVerificationService
{
  /**
   * Get contacts with email verification status
   *
   * @param params - The query parameters
   * @returns Promise<{ records: SupabaseContact[]; pagination: PaginationInfo }> - The paginated results
   */
  async getContactsWithEmailVerification(
    params?: GetEmailVerificationRecordsParams
  ): Promise<{ records: SupabaseContact[]; pagination: PaginationInfo }> {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabaseClient
        .from('contacts')
        .select('*')
        .not('email_verification_status', 'is', null)
        .not('hs_object_id', 'is', null);

      // Apply sorting
      const sortBy = params?.sortBy || 'updated_at';
      const sortOrder = params?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = params?.page || 1;
      const limit = Math.min(params?.limit || 25, 100); // Max 100
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      // Get total count for pagination
      const { count: totalCount } = await supabaseClient
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .not('email_verification_status', 'is', null)
        .not('hs_object_id', 'is', null);

      const pagination: PaginationInfo = {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: page * limit < (totalCount || 0),
        hasPrev: page > 1,
      };

      return {
        records: data || [],
        pagination,
      };
    } catch (error) {
      console.error('Error fetching contacts with email verification:', error);
      throw error;
    }
  }

  /**
   * Get a single contact by ID
   *
   * @param contactId - The Supabase contact ID
   * @returns Promise<SupabaseContact | null> - The contact or null if not found
   */
  async getContactById(contactId: number): Promise<SupabaseContact | null> {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Supabase query error: ${error.message}`);
      }

      return data as SupabaseContact;
    } catch (error) {
      console.error(`Error fetching contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Validate that a contact exists and has required fields for sync
   *
   * @param contactId - The Supabase contact ID
   * @returns Promise<boolean> - True if valid for sync, false otherwise
   */
  async validateContactForSync(contactId: number): Promise<boolean> {
    try {
      const contact = await this.getContactById(contactId);

      if (!contact) {
        return false;
      }

      // Check required fields for sync
      return !!(
        contact.email_verification_status &&
        contact.hs_object_id &&
        contact.email
      );
    } catch (error) {
      console.error(`Error validating contact ${contactId} for sync:`, error);
      return false;
    }
  }

  /**
   * Get contacts that need email verification status sync
   *
   * @param limit - Maximum number of contacts to return
   * @returns Promise<SupabaseContact[]> - Array of contacts needing sync
   */
  async getContactsNeedingSync(
    limit: number = 100
  ): Promise<SupabaseContact[]> {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .not('email_verification_status', 'is', null)
        .not('hs_object_id', 'is', null)
        .not('email', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching contacts needing sync:', error);
      throw error;
    }
  }

  /**
   * Update the last sync timestamp for a contact
   *
   * @param contactId - The Supabase contact ID
   * @param syncTimestamp - The timestamp of the sync operation
   * @returns Promise<void>
   */
  async updateLastSyncTimestamp(
    contactId: number,
    syncTimestamp: Date
  ): Promise<void> {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabaseClient
        .from('contacts')
        .update({
          last_sync_at: syncTimestamp.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId);

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }
    } catch (error) {
      console.error(
        `Error updating sync timestamp for contact ${contactId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get sync statistics for reporting
   *
   * @returns Promise<object> - Statistics about email verification statuses
   */
  async getSyncStatistics(): Promise<{
    totalContacts: number;
    verifiedContacts: number;
    unverifiedContacts: number;
    pendingContacts: number;
    lastSyncDate?: string;
  }> {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // Get total count
      const { count: totalContacts } = await supabaseClient
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .not('email_verification_status', 'is', null);

      // Get counts by status
      const { data: statusCounts, error } = await supabaseClient
        .from('contacts')
        .select('email_verification_status')
        .not('email_verification_status', 'is', null);

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      const stats = {
        verified: 0,
        unverified: 0,
        pending: 0,
      };

      statusCounts?.forEach(
        (contact: { email_verification_status: string }) => {
          const status = contact.email_verification_status.toLowerCase();
          if (status === 'verified') stats.verified++;
          else if (status === 'unverified') stats.unverified++;
          else if (status === 'pending') stats.pending++;
        }
      );

      // Get last sync date
      const { data: lastSyncData } = await supabaseClient
        .from('contacts')
        .select('last_sync_at')
        .not('last_sync_at', 'is', null)
        .order('last_sync_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalContacts: totalContacts || 0,
        verifiedContacts: stats.verified,
        unverifiedContacts: stats.unverified,
        pendingContacts: stats.pending,
        lastSyncDate: lastSyncData?.last_sync_at,
      };
    } catch (error) {
      console.error('Error fetching sync statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseEmailVerificationService =
  new SupabaseEmailVerificationService();

// Export the service class and instance
export default SupabaseEmailVerificationService;
