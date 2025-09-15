import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    createdate?: string;
    lastmodifieddate?: string;
  };
}

interface HubSpotResponse {
  results: HubSpotContact[];
  total?: number;
}

export const hubspotSyncHandler = async (req: Request, res: Response) => {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !hubspotApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing required environment variables',
      });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting HubSpot contact sync...');

    // Fetch contacts from HubSpot
    const hubspotUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const response = await fetch(
      `${hubspotUrl}?properties=email,firstname,lastname,phone,company,createdate,lastmodifieddate&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const hubspotData: HubSpotResponse = await response.json();
    console.log(`Fetched ${hubspotData.results?.length || 0} contacts from HubSpot`);

    let newContacts = 0;
    let updatedContacts = 0;
    let failedContacts = 0;

    // Process each contact
    for (const contact of hubspotData.results || []) {
      try {
        const contactData = {
          hs_object_id: contact.id,
          email: contact.properties.email || null,
          firstname: contact.properties.firstname || null,
          lastname: contact.properties.lastname || null,
          phone: contact.properties.phone || null,
          company: contact.properties.company || null,
          createdate: contact.properties.createdate 
            ? new Date(contact.properties.createdate).toISOString() 
            : null,
          lastmodifieddate: contact.properties.lastmodifieddate 
            ? new Date(contact.properties.lastmodifieddate).toISOString() 
            : null,
          sync_source: 'hubspot',
        };

        // Check if contact exists
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id, updated_at')
          .eq('hs_object_id', contact.id)
          .single();

        if (existingContact) {
          // Update existing contact
          const { error } = await supabase
            .from('contacts')
            .update({
              ...contactData,
              updated_at: new Date().toISOString(),
            })
            .eq('hs_object_id', contact.id);

          if (error) {
            console.error(`Error updating contact ${contact.id}:`, error);
            failedContacts++;
          } else {
            updatedContacts++;
          }
        } else {
          // Insert new contact
          const { error } = await supabase
            .from('contacts')
            .insert({
              ...contactData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error(`Error inserting contact ${contact.id}:`, error);
            failedContacts++;
          } else {
            newContacts++;
          }
        }
      } catch (contactError) {
        console.error(`Error processing contact ${contact.id}:`, contactError);
        failedContacts++;
      }
    }

    // Log the sync operation
    await supabase
      .from('sync_logs')
      .insert({
        sync_type: 'hubspot_sync',
        last_sync_time: new Date().toISOString(),
        records_processed: hubspotData.results?.length || 0,
        new_records: newContacts,
        updated_records: updatedContacts,
        failed_records: failedContacts,
        status: failedContacts === 0 ? 'success' : 'partial',
      });

    console.log(`Sync complete: ${newContacts} new, ${updatedContacts} updated, ${failedContacts} failed`);

    return res.json({
      success: true,
      message: `Sync complete: ${newContacts} new contacts, ${updatedContacts} updated, ${failedContacts} failed`,
      newContacts,
      updatedContacts,
      failedContacts,
      totalProcessed: hubspotData.results?.length || 0,
    });

  } catch (error) {
    console.error('HubSpot sync error:', error);
    
    // Log the error
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('sync_logs')
          .insert({
            sync_type: 'hubspot_sync',
            last_sync_time: new Date().toISOString(),
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
};