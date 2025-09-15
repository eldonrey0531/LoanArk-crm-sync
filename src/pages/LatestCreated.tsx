import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, Database, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SupabaseContact {
  id: number;
  hs_object_id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  mobilephone: string | null;
  createdate: string | null;
  lastmodifieddate: string | null;
  client_type_vip_status: string | null;
  client_type_prospects: string | null;
}

interface HubSpotContact {
  id: number;
  hs_object_id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  company: string | null;
  createdate: string | null;
  hs_lastmodifieddate: string | null;
  lifecyclestage: string | null;
  email_verification_status: string | null;
}

export default function LatestCreated() {
  const [supabaseContacts, setSupabaseContacts] = useState<SupabaseContact[]>([]);
  const [hubspotContacts, setHubspotContacts] = useState<HubSpotContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [supabaseTotalCount, setSupabaseTotalCount] = useState(0);
  const [hubspotTotalCount, setHubspotTotalCount] = useState(0);

  // Test Supabase connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (error) {
        setIsConnected(false);
        toast.error(`Connection failed: ${error.message}`);
      } else {
        setIsConnected(true);
        setSupabaseTotalCount(count || 0);
        toast.success(`✅ Connected! Found ${count || 0} contacts in database`);
      }
    } catch (err: any) {
      setIsConnected(false);
      toast.error('Failed to connect to Supabase');
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest 25 contacts from Supabase
  const fetchSupabaseContacts = async () => {
    try {
      const { data, error, count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('createdate', { ascending: false, nullsFirst: false })
        .limit(25);

      if (error) {
        toast.error(`Failed to fetch Supabase contacts: ${error.message}`);
        return;
      }

      setSupabaseContacts(data || []);
      setSupabaseTotalCount(count || 0);

      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} latest Supabase contacts`);
      }
    } catch (err: any) {
      toast.error('Error fetching Supabase contacts');
    }
  };

  // Fetch latest 25 contacts from HubSpot table
  const fetchHubspotContacts = async () => {
    try {
      const { data, error, count } = await supabase
        .from('hubspot_contacts')
        .select('*', { count: 'exact' })
        .order('createdate', { ascending: false, nullsFirst: false })
        .limit(25);

      if (error) {
        toast.error(`Failed to fetch HubSpot contacts: ${error.message}`);
        return;
      }

      setHubspotContacts(data || []);
      setHubspotTotalCount(count || 0);

      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} latest HubSpot contacts`);
      }
    } catch (err: any) {
      toast.error('Error fetching HubSpot contacts');
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSupabaseContacts(),
        fetchHubspotContacts()
      ]);
      setIsConnected(true);
    } catch (err: any) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Latest Created Records - Dual View</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Top 25 most recently created contacts from both Supabase and HubSpot
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {/* Connection Status Badge */}
              {isConnected !== null && (
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Disconnected
                    </>
                  )}
                </Badge>
              )}

              {/* Total Count Badges */}
              {supabaseTotalCount > 0 && (
                <Badge variant="outline">
                  <Database className="mr-1 h-3 w-3" />
                  Supabase: {supabaseTotalCount.toLocaleString()}
                </Badge>
              )}
              {hubspotTotalCount > 0 && (
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  HubSpot: {hubspotTotalCount.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={loading}
              variant="outline"
            >
              <Database className={`mr-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              Test Connection
            </Button>
            <Button
              onClick={fetchAllData}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dual Table Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Contacts ({supabaseContacts.length} of {supabaseTotalCount.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supabaseContacts.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No Supabase contacts found. Click "Refresh All Data" to load contacts.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supabaseContacts.map((contact, index) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {contact.firstname || contact.lastname ? (
                            <div>
                              <span className="font-medium">
                                {contact.firstname} {contact.lastname}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No name</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.email || (
                            <span className="text-muted-foreground">No email</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone || contact.mobilephone || (
                            <span className="text-muted-foreground">No phone</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {contact.client_type_vip_status && (
                              <Badge variant="secondary" className="text-xs">
                                VIP
                              </Badge>
                            )}
                            {contact.client_type_prospects && (
                              <Badge variant="outline" className="text-xs">
                                Prospect
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(contact.createdate)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HubSpot Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              HubSpot Contacts ({hubspotContacts.length} of {hubspotTotalCount.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hubspotContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No HubSpot contacts found. Click "Refresh All Data" to load contacts.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hubspotContacts.map((contact, index) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {contact.firstname || contact.lastname ? (
                            <div>
                              <span className="font-medium">
                                {contact.firstname} {contact.lastname}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No name</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {contact.email || (
                              <span className="text-muted-foreground">No email</span>
                            )}
                            {contact.email_verification_status === 'valid' && (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.company || (
                            <span className="text-muted-foreground">No company</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.lifecyclestage ? (
                            <Badge variant="outline" className="text-xs">
                              {contact.lifecyclestage}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(contact.createdate)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
