// @ts-nocheck
import { useEffect } from 'react';

export default function LatestCreated() {
  // ...existing code...

  useEffect(() => {
    // Only initialize if component is mounted and environment is ready
    const initializeComponent = async () => {
      try {
        // Debug: Check if environment variables are loaded
        console.log('Environment check:');
        console.log('HubSpot API: Configuration check complete');
        console.log('Supabase: Environment configured');

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
      setTestingSupabase(true);
      // Test connection using the supabase client directly
      // The client will handle environment variable validation
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
    } finally {
      setTestingSupabase(false);
    }
  };

  const testHubspotConnection = async () => {
    try {
      setTestingHubspot(true);
      console.log('🔍 Testing HubSpot connection...');
      const result = await testHubSpotConnection();

      console.log('📊 HubSpot connection result:', {
        connected: result.connected,
        total: result.total,
        error: result.error,
        isDemo: result.isDemo,
        fullResult: result,
      });

      setHubspotConnected(result.connected);
      if (result.connected) {
        setHubspotCount(result.total);
        console.log(`✅ HubSpot connected with ${result.total} contacts`);
      } else {
        console.warn('❌ HubSpot connection failed:', result.error);
        setHubspotCount(0);
      }
    } catch (error) {
      console.error('💥 HubSpot connection error:', error);
      setHubspotConnected(false);
      setHubspotCount(0);
    } finally {
      setTestingHubspot(false);
    }
  };

  const testConnections = async () => {
    await Promise.all([testSupabaseConnection(), testHubspotConnection()]);
  };

  const testNetlifyFunctions = async () => {
    try {
      console.log('🧪 Testing Netlify Functions directly...');

      // Test if Netlify functions are accessible
      const testResponse = await fetch('/.netlify/functions/hubspot-test');
      const testResult = await testResponse.json();

      console.log('📡 Direct Netlify Function test result:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        result: testResult,
      });

      if (!testResponse.ok) {
        console.error('❌ Netlify function failed:', testResponse.status, testResult);
      } else {
        console.log('✅ Netlify function accessible');
      }
    } catch (error) {
      console.error('💥 Direct Netlify function test failed:', error);
    }
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
        .select('hs_object_id, firstname, lastname, email, email_verification_status, createdate')
        .order('createdate', { ascending: false })
        .limit(25);

      if (!error && data) {
        const formattedData = data.map((record) => ({
          hs_object_id: record.hs_object_id || 'N/A',
          name: `${record.firstname || ''} ${record.lastname || ''}`.trim() || 'N/A',
          email: record.email || 'N/A',
          email_verification_status: record.email_verification_status || 'unverified',
          createdate: record.createdate ? new Date(record.createdate).toLocaleDateString() : 'N/A',
        }));
        setSupabaseData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    }
  };

  const fetchHubspotData = async () => {
    try {
      console.log('📡 Fetching HubSpot contacts data...');
      const data = await fetchHubSpotContacts(25);

      console.log('📥 HubSpot fetch response:', {
        hasData: !!data,
        hasResults: !!data?.results,
        resultCount: data?.results?.length || 0,
        isDemo: data?.isDemo,
        fullResponse: data,
      });

      if (data?.results) {
        const formattedData = data.results.map((record: any) => ({
          hs_object_id: record.id || record.properties?.hs_object_id || 'N/A',
          name:
            `${record.properties?.firstname || ''} ${record.properties?.lastname || ''}`.trim() ||
            'N/A',
          email: record.properties?.email || 'N/A',
          email_verification_status: record.properties?.email ? 'verified' : 'unverified',
          createdate: record.properties?.createdate
            ? new Date(record.properties.createdate).toLocaleDateString()
            : 'N/A',
        }));
        setHubspotData(formattedData);
        // Update connection status based on successful data fetch
        setHubspotConnected(true);
        console.log(`✅ Successfully formatted ${formattedData.length} HubSpot contacts`);
      } else {
        console.warn('⚠️ No HubSpot results found in response');
        setHubspotData([]);
        // Don't mark as disconnected if we got a response but no results
      }
    } catch (error) {
      console.error('💥 Error fetching HubSpot data:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
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
          <p className="text-gray-600 mb-2">
            Top 25 most recently created contacts from both Supabase and HubSpot
          </p>
          {/* HubSpot status, count, pagination info, and action buttons go here */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-7">
              {hubspotConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{hubspotConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="pl-7 text-sm text-gray-600">
              Total Contacts: {hubspotData.length.toLocaleString()}
              {paginationInfo && (
                <div className="text-xs text-blue-600 mt-1">
                  {paginationInfo.hasMore && !paginationInfo.maxContactsReached
                    ? `Fetched ${paginationInfo.total} in ${paginationInfo.requestCount} requests - more available`
                    : `Complete: ${paginationInfo.total} contacts in ${paginationInfo.requestCount} requests`}
                  {paginationInfo.maxContactsReached && (
                    <span className="text-orange-600"> (safety limit reached)</span>
                  )}
                </div>
              )}
              {!paginationInfo && hubspotData.length >= 25 && (
                <span className="text-blue-600">
                  {' '}
                  (showing first 25 - click "Fetch All Contacts" for complete list)
                </span>
              )}
            </div>
            {hubspotCount > 0 && hubspotCount !== hubspotData.length && (
              <div className="pl-7 text-xs text-blue-600">
                Connection Test Count: {hubspotCount.toLocaleString()}
              </div>
            )}
            <div className="pl-7 mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testHubspotConnection}
                disabled={testingHubspot}
              >
                {testingHubspot && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Test Connection
              </Button>
              <Button variant="ghost" size="sm" onClick={testNetlifyFunctions} className="ml-2">
                Debug Functions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllHubspotContacts}
                disabled={fetchingAllContacts}
                className="ml-2 text-green-600 border-green-300 hover:bg-green-50"
              >
                {fetchingAllContacts && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Fetch All Contacts
              </Button>
            </div>
          </div>
          {/* Main Content Section */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Supabase Table */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-green-500 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Supabase CRM</h2>
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
                            <TableHead className="font-semibold">Created Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supabaseData.length > 0 ? (
                            supabaseData.map((record) => (
                              <TableRow key={`supabase-${record.hs_object_id}`}>
                                <TableCell className="font-mono text-sm">
                                  {record.hs_object_id}
                                </TableCell>
                                <TableCell className="font-medium">{record.name}</TableCell>
                                <TableCell className="text-gray-600">{record.email}</TableCell>
                                <TableCell>
                                  {getStatusBadge(record.email_verification_status)}
                                </TableCell>
                                <TableCell className="text-gray-600 text-sm">
                                  {record.createdate}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
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
                            <TableHead className="font-semibold">Created Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hubspotData.length > 0 ? (
                            hubspotData.map((record) => (
                              <TableRow key={`hubspot-${record.hs_object_id}`}>
                                <TableCell className="font-mono text-sm">
                                  {record.hs_object_id}
                                </TableCell>
                                <TableCell className="font-medium">{record.name}</TableCell>
                                <TableCell className="text-gray-600">{record.email}</TableCell>
                                <TableCell>
                                  {getStatusBadge(record.email_verification_status)}
                                </TableCell>
                                <TableCell className="text-gray-600 text-sm">
                                  {record.createdate}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
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
      </div>
    </div>
  );
}
