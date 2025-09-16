import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, XCircle, Database, Cloud, TestTube } from 'lucide-react';
import { format } from 'date-fns';
import { useHubSpot } from '@/contexts/HubSpotContext';
import { toast } from 'sonner';

interface DataRecord {
  hs_object_id: string;
  name: string;
  email: string;
  email_verification_status: string;
  createdate: string | null;
}

export default function LatestCreated() {
  const [supabaseData, setSupabaseData] = useState<DataRecord[]>([]);
  const [hubspotData, setHubspotData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [supabaseCount, setSupabaseCount] = useState(0);

  // Use HubSpot context for connection status and actions
  const {
    hubspotConnected,
    hubspotCount,
    checkConnection: testHubSpotConnection,
    isLoading: hubspotLoading,
  } = useHubSpot();

  useEffect(() => {
    testConnections();
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testConnections = async () => {
    // Test Supabase connection
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        setSupabaseConnected(true);
        setSupabaseCount(count || 0);
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
      toast.error('Supabase connection failed');
    }

    // Test HubSpot connection via context
    try {
      await testHubSpotConnection();
    } catch (err) {
      console.error('HubSpot connection error:', err);
      toast.error('HubSpot connection test failed');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);

    try {
      await Promise.all([fetchSupabaseData(), fetchHubspotData()]);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseData = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('hs_object_id, firstname, lastname, email, email_verification_status, createdate')
      .order('createdate', { ascending: false })
      .limit(25);

    if (!error && data) {
      const formatted = data.map(mapSupabaseRecordToDataRecord);
      setSupabaseData(formatted);
    } else if (error) {
      console.error('Supabase fetch error:', error);
      toast.error('Failed to load Supabase data');
    }
  };

  const fetchHubspotData = async () => {
    try {
      const response = await fetch('/.netlify/functions/hubspot-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 25,
          sorts: [
            {
              propertyName: 'createdate',
              direction: 'DESCENDING',
            },
          ],
          properties: [
            'hs_object_id',
            'firstname',
            'lastname',
            'email',
            'email_verification_status',
            'createdate',
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.results?.map(mapHubspotRecordToDataRecord) || [];

        setHubspotData(formattedData);
      } else {
        const text = await response.text();
        console.error('HubSpot API error:', text);
        toast.error('Failed to load HubSpot data');
      }
    } catch (err) {
      console.error('Error fetching HubSpot data:', err);
      toast.error('Failed to fetch HubSpot data');
    }
  };

  // Helpers to normalize records from Supabase and HubSpot into DataRecord
  const mapSupabaseRecordToDataRecord = (r: any): DataRecord => ({
    hs_object_id: r.hs_object_id,
    name: `${r.firstname || ''} ${r.lastname || ''}`.trim(),
    email: r.email || 'N/A',
    email_verification_status: r.email_verification_status || 'unverified',
    createdate: r.createdate || null,
  });

  const mapHubspotRecordToDataRecord = (record: any): DataRecord => ({
    hs_object_id: record.id,
    name: `${record.properties?.firstname || ''} ${record.properties?.lastname || ''}`.trim(),
    email: record.properties?.email || 'N/A',
    email_verification_status: record.properties?.email_verification_status || 'unverified',
    createdate: record.properties?.createdate || null,
  });

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || 'unverified';

    if (statusLower === 'verified') {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      // Use a friendlier, 12-hour format with AM/PM
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full width container with minimal padding */}
      <div className="px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Latest Created Records - Dual View
          </h1>
          <p className="text-gray-600 mb-4">
            Top 25 most recently created contacts from both Supabase and HubSpot
          </p>

          {/* Connection Status */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              {supabaseConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Supabase: {supabaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hubspotConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                HubSpot: {hubspotConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Database className="h-5 w-5" />
              <span>Supabase: {supabaseCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Cloud className="h-5 w-5" />
              <span>HubSpot: {hubspotCount?.toLocaleString?.() ?? '0'}</span>
            </div>

            <Button variant="outline" size="sm" onClick={testConnections} disabled={hubspotLoading}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>

            <Button onClick={fetchAllData} size="sm" className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All Data
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Supabase Table */}
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-blue-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Supabase Database</h2>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {supabaseData.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold w-40">HS Object ID</TableHead>
                        <TableHead className="font-semibold w-48">Name</TableHead>
                        <TableHead className="font-semibold w-56">Email</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell w-36">
                          Email Status
                        </TableHead>
                        <TableHead className="font-semibold w-44">Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supabaseData.map((record, index) => (
                        <TableRow key={record.hs_object_id || index}>
                          <TableCell
                            className="font-mono text-sm truncate"
                            title={record.hs_object_id}
                          >
                            {record.hs_object_id || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium truncate" title={record.name}>
                            {record.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-600 truncate" title={record.email}>
                            {record.email || 'N/A'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {getStatusBadge(record.email_verification_status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(record.createdate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* HubSpot Table */}
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-orange-500 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">HubSpot CRM</h2>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {hubspotData.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold w-40">HS Object ID</TableHead>
                        <TableHead className="font-semibold w-48">Name</TableHead>
                        <TableHead className="font-semibold w-56">Email</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell w-36">
                          Email Status
                        </TableHead>
                        <TableHead className="font-semibold w-44">Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hubspotData.map((record, index) => (
                        <TableRow key={record.hs_object_id || index}>
                          <TableCell
                            className="font-mono text-sm truncate"
                            title={record.hs_object_id}
                          >
                            {record.hs_object_id || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium truncate" title={record.name}>
                            {record.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-600 truncate" title={record.email}>
                            {record.email || 'N/A'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {getStatusBadge(record.email_verification_status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(record.createdate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
