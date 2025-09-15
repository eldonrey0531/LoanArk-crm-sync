import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Cloud } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactsViewer() {
  const [supabaseContacts, setSupabaseContacts] = useState<any[]>([]);
  const [syncJobs, setSyncJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSupabaseContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('lastmodifieddate', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSupabaseContacts(data || []);
      toast.success(`Loaded ${data?.length || 0} contacts from Supabase`);
    } catch (error: any) {
      toast.error('Failed to fetch contacts: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncJobs(data || []);
    } catch (error: any) {
      console.error('Failed to fetch sync jobs:', error);
    }
  };

  useEffect(() => {
    fetchSupabaseContacts();
    fetchSyncJobs();
  }, []);

  const createTestSyncJob = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_jobs')
        .insert({
          type: 'manual',
          status: 'pending',
          metadata: { test: true, created_from: 'UI' }
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Test sync job created!');
      fetchSyncJobs();
    } catch (error: any) {
      toast.error('Failed to create sync job: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contacts Viewer</h1>
        <div className="flex gap-2">
          <Button onClick={fetchSupabaseContacts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={createTestSyncJob} variant="outline">
            Create Test Sync Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">
            <Database className="mr-2 h-4 w-4" />
            Supabase Contacts ({supabaseContacts.length})
          </TabsTrigger>
          <TabsTrigger value="sync-jobs">
            <Cloud className="mr-2 h-4 w-4" />
            Sync Jobs ({syncJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts in Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              {supabaseContacts.length === 0 ? (
                <p className="text-muted-foreground">No contacts found. Run a sync to import from HubSpot.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Client Type</TableHead>
                        <TableHead>Last Modified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supabaseContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">
                            {contact.firstname} {contact.lastname}
                          </TableCell>
                          <TableCell>{contact.email || '-'}</TableCell>
                          <TableCell>{contact.phone || contact.mobilephone || '-'}</TableCell>
                          <TableCell>
                            {contact.client_type_vip_status && (
                              <Badge variant="secondary">{contact.client_type_vip_status}</Badge>
                            )}
                            {contact.client_type_prospects && (
                              <Badge variant="outline">{contact.client_type_prospects}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.lastmodifieddate
                              ? new Date(contact.lastmodifieddate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-jobs">
          <Card>
            <CardHeader>
              <CardTitle>Sync Job History</CardTitle>
            </CardHeader>
            <CardContent>
              {syncJobs.length === 0 ? (
                <p className="text-muted-foreground">No sync jobs yet. Create one to test!</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Failed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === 'completed' ? 'success' :
                                job.status === 'failed' ? 'destructive' :
                                job.status === 'processing' ? 'secondary' :
                                'outline'
                              }
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            {new Date(job.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{job.records_processed || 0}</TableCell>
                          <TableCell>{job.records_failed || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
