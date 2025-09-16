// @ts-nocheck
import { useEffect, useState } from 'react';
import { testHubSpotConnection, fetchHubSpotContacts } from '@/api/hubspot';
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
import { Loader2, RefreshCw, CheckCircle, XCircle, Database, Cloud } from 'lucide-react';

interface DataRecord {
  hs_object_id: string;
  name: string;
  email: string;
  email_verification_status: string;
}

export default function LatestCreated() {
  const [supabaseData, setSupabaseData] = useState<DataRecord[]>([]);
  const [hubspotData, setHubspotData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [supabaseCount, setSupabaseCount] = useState(0);
  const [hubspotCount, setHubspotCount] = useState(0);

  useEffect(() => {
    // Only initialize if component is mounted and environment is ready
    const initializeComponent = async () => {
      try {
        // Debug: Check if environment variables are loaded
        console.log('Environment check:');
        console.log('VITE_HUBSPOT_API_KEY exists:', !!import.meta.env.VITE_HUBSPOT_API_KEY);
        console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

        // Test connections first without making direct API calls
        await testConnections();

        // Only fetch data if connections are available
        await fetchAllData();
      } catch (error) {
        console.error('Error initializing component:', error);
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // Don't test if no environment variables are set
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase environment variables not configured');
        setSupabaseConnected(false);
        return;
      }

      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        setSupabaseConnected(true);
        setSupabaseCount(count || 0);
      } else {
        console.warn('Supabase connection test failed:', error.message);
        setSupabaseConnected(false);
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setSupabaseConnected(false);
    }
  };

  const testHubspotConnection = async () => {
    try {
      // Don't test if no API key is available
      if (!import.meta.env.VITE_HUBSPOT_API_KEY) {
        console.warn('HubSpot API key not configured');
        setHubspotConnected(false);
        return;
      }

      const result = await testHubSpotConnection();
      setHubspotConnected(result.connected);
      if (result.connected) {
        setHubspotCount(result.total);
      } else {
        console.warn('HubSpot connection failed:', result.error);
      }
    } catch (error) {
      console.error('HubSpot connection error:', error);
      setHubspotConnected(false);
    }
  };

  const testConnections = async () => {
    await Promise.all([testSupabaseConnection(), testHubspotConnection()]);
  };

  const fetchAllData = async () => {
    setLoading(true);

    try {
      await Promise.all([fetchSupabaseData(), fetchHubspotData()]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('hs_object_id, firstname, lastname, email, email_verification_status, created_at')
        .order('created_at', { ascending: false })
        .limit(25);

      if (!error && data) {
        const formattedData = data.map((record) => ({
          hs_object_id: record.hs_object_id || 'N/A',
          name: `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'N/A',
          email: record.email || 'N/A',
          email_verification_status: record.email_verification_status || 'unverified',
        }));
        setSupabaseData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    }
  };

  const fetchHubspotData = async () => {
    try {
      const data = await fetchHubSpotContacts(25);
      if (data && data.results) {
        const formattedData = data.results.map((record: any) => ({
          hs_object_id: record.id || record.properties?.hs_object_id || 'N/A',
          name:
            `${record.properties?.firstname || ''} ${record.properties?.lastname || ''}`.trim() ||
            'N/A',
          email: record.properties?.email || 'N/A',
          email_verification_status: record.properties?.email ? 'verified' : 'unverified',
        }));
        setHubspotData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching HubSpot data:', error);
      setHubspotData([]);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal padding for maximum content width */}
      <div className="px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Latest Created Records - Dual View
          </h1>
          <p className="text-gray-600 mb-6">
            Top 25 most recently created contacts from both Supabase and HubSpot
          </p>

          {/* Connection Status - Separated for each system */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
            {/* Supabase Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Supabase Database</span>
              </div>

              <div className="flex items-center gap-2 pl-7">
                {supabaseConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{supabaseConnected ? 'Connected' : 'Disconnected'}</span>
              </div>

              <div className="pl-7 text-sm text-gray-600">
                Total Records: {supabaseCount.toLocaleString()}
              </div>

              <div className="pl-7">
                <Button variant="outline" size="sm" onClick={testSupabaseConnection}>
                  Test Connection
                </Button>
              </div>
            </div>

            {/* HubSpot Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">HubSpot CRM</span>
              </div>

              <div className="flex items-center gap-2 pl-7">
                {hubspotConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{hubspotConnected ? 'Connected' : 'Disconnected'}</span>
              </div>

              <div className="pl-7 text-sm text-gray-600">
                Total Contacts: {hubspotCount.toLocaleString()}
              </div>

              <div className="pl-7">
                <Button variant="outline" size="sm" onClick={testHubspotConnection}>
                  Test Connection
                </Button>
              </div>
            </div>
          </div>

          {/* Refresh All Button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={fetchAllData} size="sm">
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
                        <TableHead className="font-semibold">HS Object ID</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Email Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supabaseData.length > 0 ? (
                        supabaseData.map((record, index) => (
                          <TableRow key={`supabase-${index}`}>
                            <TableCell className="font-mono text-sm">
                              {record.hs_object_id}
                            </TableCell>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell className="text-gray-600">{record.email}</TableCell>
                            <TableCell>
                              {getStatusBadge(record.email_verification_status)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
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
                        <TableHead className="font-semibold">HS Object ID</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Email Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hubspotData.length > 0 ? (
                        hubspotData.map((record, index) => (
                          <TableRow key={`hubspot-${index}`}>
                            <TableCell className="font-mono text-sm">
                              {record.hs_object_id}
                            </TableCell>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell className="text-gray-600">{record.email}</TableCell>
                            <TableCell>
                              {getStatusBadge(record.email_verification_status)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
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
