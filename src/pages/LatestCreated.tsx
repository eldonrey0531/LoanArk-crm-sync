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
import { RefreshCw, CheckCircle2, XCircle, Database, TableIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Contact {
  id: string;
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

interface TableInfo {
  table_name: string;
  row_count: number;
}

export default function LatestCreated() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [databaseTables, setDatabaseTables] = useState<TableInfo[]>([]);
  const [debugLoading, setDebugLoading] = useState(false);

  // Test Supabase connection and get table info
  const testConnection = async () => {
    setLoading(true);
    try {
      // Test connection by counting contacts
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Connection error:', error);
        setIsConnected(false);
        toast.error(`Connection failed: ${error.message}`);
      } else {
        setIsConnected(true);
        setTotalCount(count || 0);
        toast.success(`✅ Connected! Found ${count || 0} contacts in database`);

        // Fetch database info after successful connection
        await fetchDatabaseInfo();
      }
    } catch (err: any) {
      setIsConnected(false);
      toast.error('Failed to connect to Supabase');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tables and their counts
  const fetchDatabaseInfo = async () => {
    setDebugLoading(true);
    try {
      // Get list of tables using Supabase's information_schema
      const { data: tables, error: tablesError } = await supabase.rpc('get_tables_info');

      if (tablesError) {
        console.log('Using fallback method to check tables...');
        // Fallback: manually check known tables
        await checkKnownTables();
        return;
      }

      if (tables) {
        setDatabaseTables(tables);
      }
    } catch (err) {
      console.log('RPC not available, checking known tables...');
      // Fallback method
      await checkKnownTables();
    } finally {
      setDebugLoading(false);
    }
  };

  // Fallback method to check known tables
  const checkKnownTables = async () => {
    const knownTables = [
      'contacts',
      'sync_jobs',
      'sync_logs',
      'hubspot_cache',
      'hubspot_contacts',
      'hubspot_modified_contacts'
    ];

    const tableInfo: TableInfo[] = [];

    for (const tableName of knownTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          tableInfo.push({
            table_name: tableName,
            row_count: count || 0
          });
        }
      } catch (err) {
        // Table doesn't exist or no access
        console.log(`Table ${tableName} not accessible`);
      }
    }

    setDatabaseTables(tableInfo);
  };

  // Fetch latest 100 contacts by createdate
  const fetchLatestContacts = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('createdate', { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        toast.error(`Failed to fetch contacts: ${error.message}`);
        return;
      }

      setContacts(data || []);
      setTotalCount(count || 0);
      setIsConnected(true);

      toast.success(`Loaded ${data?.length || 0} latest contacts`);

      // Also fetch database info
      await fetchDatabaseInfo();
    } catch (err: any) {
      toast.error('Error fetching contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchLatestContacts();
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

  // Calculate total records across all tables
  const totalRecords = databaseTables.reduce((sum, table) => sum + table.row_count, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Latest Created Contacts</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Top 100 most recently created contacts from Supabase
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {/* Connection Status Badge */}
              {isConnected !== null && (
                <Badge variant={isConnected ? "success" : "destructive"}>
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

              {/* Total Count Badge */}
              {totalCount > 0 && (
                <Badge variant="outline">
                  <Database className="mr-1 h-3 w-3" />
                  {totalCount} total contacts
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
              onClick={fetchLatestContacts}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List ({contacts.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No contacts found. Click "Test Connection" to verify Supabase connection.
              </p>
              {isConnected && (
                <p className="text-sm text-muted-foreground mt-2">
                  The contacts table exists but is empty. Run a HubSpot sync to import data.
                </p>
              )}
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
                    <TableHead>Client Type</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Last Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact, index) => (
                    <TableRow key={contact.id || contact.hs_object_id}>
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
                        <div className="flex gap-1">
                          {contact.client_type_vip_status && (
                            <Badge variant="secondary" className="text-xs">
                              VIP: {contact.client_type_vip_status}
                            </Badge>
                          )}
                          {contact.client_type_prospects && (
                            <Badge variant="outline" className="text-xs">
                              {contact.client_type_prospects}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(contact.createdate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(contact.lastmodifieddate)}
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

      {/* Enhanced Debug Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Information</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchDatabaseInfo}
              disabled={debugLoading}
            >
              <RefreshCw className={`h-3 w-3 ${debugLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Connection Details
            </h4>
            <div className="text-xs space-y-1 font-mono bg-muted p-3 rounded">
              <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
              <p>Connection Status: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{String(isConnected)}</span></p>
              <p>Anon Key Set: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Database Tables Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Database Tables ({databaseTables.length} tables, {totalRecords} total records)
            </h4>
            <div className="bg-muted rounded p-3">
              {databaseTables.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tables found or unable to fetch table information.
                </p>
              ) : (
                <div className="space-y-1">
                  {databaseTables.map((table) => (
                    <div key={table.table_name} className="flex justify-between text-xs font-mono">
                      <span className="text-blue-600">{table.table_name}</span>
                      <span className={table.row_count > 0 ? 'text-green-600' : 'text-gray-500'}>
                        {table.row_count} records
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Contacts Table</p>
              <p className="font-semibold">{totalCount} records</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Displayed</p>
              <p className="font-semibold">{contacts.length} records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
