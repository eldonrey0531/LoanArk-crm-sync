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
import { RefreshCw, CheckCircle2, XCircle, Database } from 'lucide-react';
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

export default function LatestCreated() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Test Supabase connection
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
      }
    } catch (err: any) {
      setIsConnected(false);
      toast.error('Failed to connect to Supabase');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      {/* Debug Info (Remove in production) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1 font-mono">
            <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
            <p>Connection Status: {String(isConnected)}</p>
            <p>Total Contacts in DB: {totalCount}</p>
            <p>Showing: {contacts.length} contacts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
