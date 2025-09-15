import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting HubSpot contact sync...');

    // Fetch contacts from HubSpot
    const hubspotUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const response = await fetch(`${hubspotUrl}?properties=email,firstname,lastname,phone,company,createdate,lastmodifieddate&limit=100`, {
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const hubspotData = await response.json();
    console.log(`Fetched ${hubspotData.results?.length || 0} contacts from HubSpot`);

    let newContacts = 0;
    let updatedContacts = 0;

    // Process each contact
    for (const contact of hubspotData.results || []) {
      const contactData = {
        hs_object_id: contact.id,
        email: contact.properties.email,
        firstname: contact.properties.firstname,
        lastname: contact.properties.lastname,
        phone: contact.properties.phone,
        company: contact.properties.company,
        createdate: contact.properties.createdate ? new Date(contact.properties.createdate) : null,
        lastmodifieddate: contact.properties.lastmodifieddate ? new Date(contact.properties.lastmodifieddate) : null,
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

        if (!error) {
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

        if (!error) {
          newContacts++;
        }
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
        status: 'success',
      });

    console.log(`Sync complete: ${newContacts} new, ${updatedContacts} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync complete: ${newContacts} new contacts, ${updatedContacts} updated`,
        newContacts,
        updatedContacts,
        totalProcessed: hubspotData.results?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('HubSpot sync error:', error);
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('sync_logs')
        .insert({
          sync_type: 'hubspot_sync',
          last_sync_time: new Date().toISOString(),
          status: 'failed',
          error_message: error.message,
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});