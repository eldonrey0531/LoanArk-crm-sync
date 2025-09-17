import React, { useState } from 'react';import React, { useState } from 'react';import React, { useState } from 'react';import React, { useState } from 'react';

import {

  RefreshCw,import {

  CheckCircle,

  AlertTriangle,  RefreshCw,import {import {

  Database,

  Building2,  CheckCircle,

  ArrowRightLeft,

  ArrowDown,  AlertTriangle,  RefreshCw,  RefreshCw,

  Loader2

} from 'lucide-react';  Database,



import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  Building2,  CheckCircle,  CheckCircle,

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';  ArrowRightLeft,

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

  ArrowDown,  AlertTriangle,  AlertTriangle,

// Import custom hooks

import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';  Loader2



// Import toast} from 'lucide-react';  Database,  Database,

import { toast } from '@/hooks/use-toast';



export default function EmailVerificationSyncPage() {

  // State managementimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  Building2,  Building2,

  const [activeTab, setActiveTab] = useState('comparison');

  const [selectedSupabaseContact, setSelectedSupabaseContact] = useState(null);import { Button } from '@/components/ui/button';

  const [selectedHubspotContact, setSelectedHubspotContact] = useState(null);

  const [isSyncing, setIsSyncing] = useState(false);import { Badge } from '@/components/ui/badge';  ArrowRightLeft,  ArrowRightLeft,



  // Custom hooks for data fetchingimport { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

  const {

    data: supabaseRecords,  ArrowDown,  ArrowDown,

    isLoading: supabaseLoading,

    error: supabaseError,// Import custom hooks

    refetch: refetchSupabase

  } = useEmailVerificationRecords();import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';  Loader2  Loader2



  // Mock HubSpot data for now

  const hubspotContacts = [

    {// Import toast} from 'lucide-react';} from 'lucide-react';

      id: 'contact_123',

      properties: {import { toast } from '@/hooks/use-toast';

        firstname: 'John',

        lastname: 'Doe',

        email: 'john.doe@example.com',

        email_verification_status: 'unverified'export default function EmailVerificationSyncPage() {

      }

    },  // State managementimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    {

      id: 'contact_124',  const [activeTab, setActiveTab] = useState('comparison');

      properties: {

        firstname: 'Jane',  const [selectedSupabaseContact, setSelectedSupabaseContact] = useState(null);import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

        lastname: 'Smith',

        email: 'jane.smith@example.com',  const [selectedHubspotContact, setSelectedHubspotContact] = useState(null);

        email_verification_status: 'verified'

      }  const [isSyncing, setIsSyncing] = useState(false);import { Badge } from '@/components/ui/badge';import { Badge } from '@/components/ui/badge';

    },

    {

      id: 'contact_125',

      properties: {  // Custom hooks for data fetchingimport { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

        firstname: 'Bob',

        lastname: 'Johnson',  const {

        email: 'bob.johnson@example.com',

        email_verification_status: 'pending'    data: supabaseRecords,

      }

    }    isLoading: supabaseLoading,

  ];

    error: supabaseError,// Import custom hooks// Import custom hooks

  // Handle manual sync between selected contacts

  const handleManualSync = async () => {    refetch: refetchSupabase

    if (!selectedSupabaseContact || !selectedHubspotContact) return;

  } = useEmailVerificationRecords();import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';

    try {

      setIsSyncing(true);

      toast({

        title: 'Starting sync...',  // Mock HubSpot data for now

        description: `Syncing ${selectedSupabaseContact.email} to HubSpot`,

      });  const hubspotContacts = [



      // TODO: Implement actual sync logic here    {// Import toast// Import toast

      // This will call the sync service to update HubSpot contact

      id: 'contact_123',

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      properties: {import { toast } from '@/hooks/use-toast';import { toast } from '@/hooks/use-toast';

      toast({

        title: 'Sync completed',        firstname: 'John',

        description: `Successfully synced ${selectedSupabaseContact.email}`,

      });        lastname: 'Doe',



      // Reset selections        email: 'john.doe@example.com',

      setSelectedSupabaseContact(null);

      setSelectedHubspotContact(null);        email_verification_status: 'unverified'export default function EmailVerificationSyncPage() {export default function EmailVerificationSyncPage() {



    } catch (error) {      }

      toast({

        title: 'Sync failed',    },  // State management  // State management

        description: error instanceof Error ? error.message : 'Unknown error occurred.',

        variant: 'destructive',    {

      });

    } finally {      id: 'contact_124',  const [activeTab, setActiveTab] = useState('comparison');  const [activeTab, setActiveTab] = useState('comparison');

      setIsSyncing(false);

    }      properties: {

  };

        firstname: 'Jane',  const [selectedSupabaseContact, setSelectedSupabaseContact] = useState(null);  const [selectedSupabaseContact, setSelectedSupabaseContact] = useState(null);

  return (

    <div className="container mx-auto p-6 space-y-6">        lastname: 'Smith',

      <div className="flex items-center justify-between">

        <div>        email: 'jane.smith@example.com',  const [selectedHubspotContact, setSelectedHubspotContact] = useState(null);  const [selectedHubspotContact, setSelectedHubspotContact] = useState(null);

          <h1 className="text-3xl font-bold">Email Verification Sync</h1>

          <p className="text-muted-foreground">        email_verification_status: 'verified'

            Manually sync email verification status between Supabase and HubSpot

          </p>      }  const [isSyncing, setIsSyncing] = useState(false);  const [isSyncing, setIsSyncing] = useState(false);

        </div>

        <Button    },

          onClick={() => {

            refetchSupabase();    {

          }}

          disabled={supabaseLoading}      id: 'contact_125',

          variant="outline"

        >      properties: {  // Custom hooks for data fetching  // Custom hooks for data fetching

          <RefreshCw className={`h-4 w-4 mr-2 ${supabaseLoading ? 'animate-spin' : ''}`} />

          Refresh        firstname: 'Bob',

        </Button>

      </div>        lastname: 'Johnson',  const {  const {



      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">        email: 'bob.johnson@example.com',

        <TabsList className="grid w-full grid-cols-2">

          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>        email_verification_status: 'pending'    data: supabaseRecords,    data: supabaseRecords,

          <TabsTrigger value="operations">Sync Operations</TabsTrigger>

        </TabsList>      }



        <TabsContent value="comparison" className="space-y-6">    }    isLoading: supabaseLoading,    isLoading: supabaseLoading,

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Supabase Contacts */}  ];

            <div className="space-y-4">

              <div className="flex items-center gap-2">    error: supabaseError,    error: supabaseError,

                <Database className="h-5 w-5 text-blue-500" />

                <h2 className="text-xl font-semibold">Supabase Contacts</h2>  // Handle manual sync between selected contacts

              </div>

  const handleManualSync = async () => {    refetch: refetchSupabase    refetch: refetchSupabase

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                {supabaseLoading ? (    if (!selectedSupabaseContact || !selectedHubspotContact) return;

                  <div className="flex items-center justify-center py-8">

                    <Loader2 className="h-6 w-6 animate-spin" />  } = useEmailVerificationRecords();  } = useEmailVerificationRecords();

                    <span className="ml-2">Loading contacts...</span>

                  </div>    try {

                ) : supabaseError ? (

                  <div className="text-center py-8 text-red-500">      setIsSyncing(true);

                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />

                    <p>Failed to load Supabase contacts</p>      toast({

                    <p className="text-sm text-muted-foreground">{supabaseError.message}</p>

                  </div>        title: 'Starting sync...',  // Mock HubSpot data for now  // Mock HubSpot data for now

                ) : supabaseRecords?.records?.length > 0 ? (

                  supabaseRecords.records.map((contact) => (        description: `Syncing ${selectedSupabaseContact.email} to HubSpot`,

                    <Card

                      key={contact.id}      });  const hubspotContacts = [  const hubspotContacts = [

                      className={`cursor-pointer transition-colors ${

                        selectedSupabaseContact?.id === contact.id

                          ? 'ring-2 ring-blue-500 bg-blue-50'

                          : 'hover:bg-gray-50'      // TODO: Implement actual sync logic here    {    {

                      }`}

                      onClick={() => setSelectedSupabaseContact(contact)}      // This will call the sync service to update HubSpot contact

                    >

                      <CardContent className="p-4">      id: 'contact_123',      id: 'contact_123',

                        <div className="flex items-center justify-between">

                          <div>      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

                            <p className="font-medium">{contact.email}</p>

                            <p className="text-sm text-muted-foreground">      properties: {      properties: {

                              Status: {contact.email_verification_status || 'unknown'}

                            </p>      toast({

                          </div>

                          <Badge        title: 'Sync completed',        firstname: 'John',        firstname: 'John',

                            variant={

                              contact.email_verification_status === 'verified'        description: `Successfully synced ${selectedSupabaseContact.email}`,

                                ? 'default'

                                : contact.email_verification_status === 'pending'      });        lastname: 'Doe',        lastname: 'Doe',

                                ? 'secondary'

                                : 'destructive'

                            }

                          >      // Reset selections        email: 'john.doe@example.com',        email: 'john.doe@example.com',

                            {contact.email_verification_status || 'unknown'}

                          </Badge>      setSelectedSupabaseContact(null);

                        </div>

                      </CardContent>      setSelectedHubspotContact(null);        email_verification_status: 'unverified'        email_verification_status: 'unverified'

                    </Card>

                  ))

                ) : (

                  <div className="text-center py-8 text-muted-foreground">    } catch (error) {      }      }

                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />

                    <p>No Supabase contacts found</p>      toast({

                  </div>

                )}        title: 'Sync failed',    },    },

              </div>

            </div>        description: error instanceof Error ? error.message : 'Unknown error occurred.',



            {/* Sync Controls */}        variant: 'destructive',    {    {

            <div className="space-y-4">

              <div className="flex items-center gap-2">      });

                <ArrowRightLeft className="h-5 w-5 text-green-500" />

                <h2 className="text-xl font-semibold">Sync Controls</h2>    } finally {      id: 'contact_124',      id: 'contact_124',

              </div>

      setIsSyncing(false);

              <Card className="p-4">

                <div className="space-y-4">    }      properties: {      properties: {

                  {selectedSupabaseContact && selectedHubspotContact ? (

                    <>  };

                      <div className="text-center">

                        <h3 className="font-medium mb-2">Ready to Sync</h3>        firstname: 'Jane',        firstname: 'Jane',

                        <p className="text-sm text-muted-foreground mb-4">

                          Sync email verification status from Supabase to HubSpot  return (

                        </p>

                      </div>    <div className="container mx-auto p-6 space-y-6">        lastname: 'Smith',        lastname: 'Smith',



                      <div className="space-y-2">      <div className="flex items-center justify-between">

                        <div className="flex justify-between text-sm">

                          <span>From:</span>        <div>        email: 'jane.smith@example.com',        email: 'jane.smith@example.com',

                          <Badge variant="outline">

                            {selectedSupabaseContact.email_verification_status}          <h1 className="text-3xl font-bold">Email Verification Sync</h1>

                          </Badge>

                        </div>          <p className="text-muted-foreground">        email_verification_status: 'verified'        email_verification_status: 'verified'

                        <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

                        <div className="flex justify-between text-sm">            Manually sync email verification status between Supabase and HubSpot

                          <span>To:</span>

                          <Badge variant="outline">          </p>      }      }

                            {selectedHubspotContact.properties.email_verification_status}

                          </Badge>        </div>

                        </div>

                      </div>        <Button    },    },



                      <Button          onClick={() => {

                        onClick={handleManualSync}

                        disabled={isSyncing}            refetchSupabase();    {    {

                        className="w-full"

                      >          }}

                        {isSyncing ? (

                          <>          disabled={supabaseLoading}      id: 'contact_125',      id: 'contact_125',

                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                            Syncing...          variant="outline"

                          </>

                        ) : (        >      properties: {      properties: {

                          <>

                            <CheckCircle className="h-4 w-4 mr-2" />          <RefreshCw className={`h-4 w-4 mr-2 ${supabaseLoading ? 'animate-spin' : ''}`} />

                            Sync Status

                          </>          Refresh        firstname: 'Bob',        firstname: 'Bob',

                        )}

                      </Button>        </Button>

                    </>

                  ) : (      </div>        lastname: 'Johnson',        lastname: 'Johnson',

                    <div className="text-center py-8 text-muted-foreground">

                      <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />

                      <p className="text-sm">

                        Select one contact from each side to sync      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">        email: 'bob.johnson@example.com',        email: 'bob.johnson@example.com',

                      </p>

                    </div>        <TabsList className="grid w-full grid-cols-2">

                  )}

                </div>          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>        email_verification_status: 'pending'        email_verification_status: 'pending'

              </Card>

            </div>          <TabsTrigger value="operations">Sync Operations</TabsTrigger>



            {/* HubSpot Contacts */}        </TabsList>      }      }

            <div className="space-y-4">

              <div className="flex items-center gap-2">

                <Building2 className="h-5 w-5 text-orange-500" />

                <h2 className="text-xl font-semibold">HubSpot Contacts</h2>        <TabsContent value="comparison" className="space-y-6">    }    }

              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                {hubspotContacts.map((contact) => (            {/* Supabase Contacts */}  ];  ];

                  <Card

                    key={contact.id}            <div className="space-y-4">

                    className={`cursor-pointer transition-colors ${

                      selectedHubspotContact?.id === contact.id              <div className="flex items-center gap-2">

                        ? 'ring-2 ring-orange-500 bg-orange-50'

                        : 'hover:bg-gray-50'                <Database className="h-5 w-5 text-blue-500" />

                    }`}

                    onClick={() => setSelectedHubspotContact(contact)}                <h2 className="text-xl font-semibold">Supabase Contacts</h2>  // Handle manual sync between selected contacts  // Intelligent auto-refresh based on operation status

                  >

                    <CardContent className="p-4">              </div>

                      <div className="flex items-center justify-between">

                        <div>  const handleManualSync = async () => {  useEffect(() => {

                          <p className="font-medium">{contact.properties.email}</p>

                          <p className="text-sm text-muted-foreground">              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                            {contact.properties.firstname} {contact.properties.lastname}

                          </p>                {supabaseLoading ? (    if (!selectedSupabaseContact || !selectedHubspotContact) return;    if (!operations) return;

                          <p className="text-sm text-muted-foreground">

                            Status: {contact.properties.email_verification_status}                  <div className="flex items-center justify-center py-8">

                          </p>

                        </div>                    <Loader2 className="h-6 w-6 animate-spin" />

                        <Badge

                          variant={                    <span className="ml-2">Loading contacts...</span>

                            contact.properties.email_verification_status === 'verified'

                              ? 'default'                  </div>    try {    const hasActiveOperations = operations.some(op =>

                              : contact.properties.email_verification_status === 'pending'

                              ? 'secondary'                ) : supabaseError ? (

                              : 'destructive'

                          }                  <div className="text-center py-8 text-red-500">      setIsSyncing(true);      op.status === 'in_progress' || op.status === 'pending'

                        >

                          {contact.properties.email_verification_status}                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />

                        </Badge>

                      </div>                    <p>Failed to load Supabase contacts</p>      toast({    );

                    </CardContent>

                  </Card>                    <p className="text-sm text-muted-foreground">{supabaseError.message}</p>

                ))}

              </div>                  </div>        title: 'Starting sync...',

            </div>

          </div>                ) : supabaseRecords?.records?.length > 0 ? (

        </TabsContent>

                  supabaseRecords.records.map((contact) => (        description: `Syncing ${selectedSupabaseContact.email} to HubSpot`,    // Poll more frequently (10 seconds) when there are active operations

        <TabsContent value="operations" className="space-y-6">

          <div className="text-center py-8 text-muted-foreground">                    <Card

            <p>Sync operations history will be displayed here</p>

          </div>                      key={contact.id}      });    // Poll less frequently (60 seconds) when all operations are complete

        </TabsContent>

      </Tabs>                      className={`cursor-pointer transition-colors ${

    </div>

  );                        selectedSupabaseContact?.id === contact.id    const intervalMs = hasActiveOperations ? 10000 : 60000;

}
                          ? 'ring-2 ring-blue-500 bg-blue-50'

                          : 'hover:bg-gray-50'      // TODO: Implement actual sync logic here

                      }`}

                      onClick={() => setSelectedSupabaseContact(contact)}      // This will call the sync service to update HubSpot contact    const interval = setInterval(() => {

                    >

                      <CardContent className="p-4">      refetchOperations();

                        <div className="flex items-center justify-between">

                          <div>      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call      refetchStatistics();

                            <p className="font-medium">{contact.email}</p>

                            <p className="text-sm text-muted-foreground">

                              Status: {contact.email_verification_status || 'unknown'}

                            </p>      toast({      // Only refetch records if there are active operations (to avoid unnecessary API calls)

                          </div>

                          <Badge        title: 'Sync completed',      if (hasActiveOperations) {

                            variant={

                              contact.email_verification_status === 'verified'        description: `Successfully synced ${selectedSupabaseContact.email}`,        refetchRecords();

                                ? 'default'

                                : contact.email_verification_status === 'pending'      });      }

                                ? 'secondary'

                                : 'destructive'    }, intervalMs);

                            }

                          >      // Reset selections

                            {contact.email_verification_status || 'unknown'}

                          </Badge>      setSelectedSupabaseContact(null);    return () => clearInterval(interval);

                        </div>

                      </CardContent>      setSelectedHubspotContact(null);  }, [operations, refetchRecords, refetchOperations, refetchStatistics]);

                    </Card>

                  ))

                ) : (

                  <div className="text-center py-8 text-muted-foreground">    } catch (error) {  // Real-time sync status indicator

                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />

                    <p>No Supabase contacts found</p>      toast({  const getSyncStatus = () => {

                  </div>

                )}        title: 'Sync failed',    if (!operations) return { status: 'unknown', message: 'Loading...' };

              </div>

            </div>        description: error instanceof Error ? error.message : 'Unknown error occurred.',



            {/* Sync Controls */}        variant: 'destructive',    const activeOps = operations.filter(op => op.status === 'in_progress' || op.status === 'pending');

            <div className="space-y-4">

              <div className="flex items-center gap-2">      });    const failedOps = operations.filter(op => op.status === 'failed');

                <ArrowRightLeft className="h-5 w-5 text-green-500" />

                <h2 className="text-xl font-semibold">Sync Controls</h2>    } finally {    const completedOps = operations.filter(op => op.status === 'completed');

              </div>

      setIsSyncing(false);

              <Card className="p-4">

                <div className="space-y-4">    }    if (activeOps.length > 0) {

                  {selectedSupabaseContact && selectedHubspotContact ? (

                    <>  };      return {

                      <div className="text-center">

                        <h3 className="font-medium mb-2">Ready to Sync</h3>        status: 'active',

                        <p className="text-sm text-muted-foreground mb-4">

                          Sync email verification status from Supabase to HubSpot  return (        message: `Syncing ${activeOps.length} contact${activeOps.length > 1 ? 's' : ''}...`

                        </p>

                      </div>    <div className="container mx-auto p-6 space-y-6">      };



                      <div className="space-y-2">      <div className="flex items-center justify-between">    }

                        <div className="flex justify-between text-sm">

                          <span>From:</span>        <div>

                          <Badge variant="outline">

                            {selectedSupabaseContact.email_verification_status}          <h1 className="text-3xl font-bold">Email Verification Sync</h1>    if (failedOps.length > 0) {

                          </Badge>

                        </div>          <p className="text-muted-foreground">      return {

                        <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

                        <div className="flex justify-between text-sm">            Manually sync email verification status between Supabase and HubSpot        status: 'error',

                          <span>To:</span>

                          <Badge variant="outline">          </p>        message: `${failedOps.length} sync${failedOps.length > 1 ? 's' : ''} failed`

                            {selectedHubspotContact.properties.email_verification_status}

                          </Badge>        </div>      };

                        </div>

                      </div>        <Button    }



                      <Button          onClick={() => {

                        onClick={handleManualSync}

                        disabled={isSyncing}            refetchSupabase();    if (completedOps.length > 0) {

                        className="w-full"

                      >          }}      return {

                        {isSyncing ? (

                          <>          disabled={supabaseLoading}        status: 'success',

                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                            Syncing...          variant="outline"        message: `All ${completedOps.length} sync${completedOps.length > 1 ? 's' : ''} completed`

                          </>

                        ) : (        >      };

                          <>

                            <CheckCircle className="h-4 w-4 mr-2" />          <RefreshCw className={`h-4 w-4 mr-2 ${supabaseLoading ? 'animate-spin' : ''}`} />    }

                            Sync Status

                          </>          Refresh

                        )}

                      </Button>        </Button>    return { status: 'idle', message: 'No active syncs' };

                    </>

                  ) : (      </div>  };

                    <div className="text-center py-8 text-muted-foreground">

                      <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />

                      <p className="text-sm">

                        Select one contact from each side to sync      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">  const syncStatus = getSyncStatus();

                      </p>

                    </div>        <TabsList className="grid w-full grid-cols-2">

                  )}

                </div>          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>  // Handle manual refresh

              </Card>

            </div>          <TabsTrigger value="operations">Sync Operations</TabsTrigger>  const handleRefresh = async () => {



            {/* HubSpot Contacts */}        </TabsList>    try {

            <div className="space-y-4">

              <div className="flex items-center gap-2">      setIsRefreshing(true);

                <Building2 className="h-5 w-5 text-orange-500" />

                <h2 className="text-xl font-semibold">HubSpot Contacts</h2>        <TabsContent value="comparison" className="space-y-6">      await Promise.all([

              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">        refetchRecords(),

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                {hubspotContacts.map((contact) => (            {/* Supabase Contacts */}        refetchOperations(),

                  <Card

                    key={contact.id}            <div className="space-y-4">        refetchStatistics()

                    className={`cursor-pointer transition-colors ${

                      selectedHubspotContact?.id === contact.id              <div className="flex items-center gap-2">      ]);

                        ? 'ring-2 ring-orange-500 bg-orange-50'

                        : 'hover:bg-gray-50'                <Database className="h-5 w-5 text-blue-500" />

                    }`}

                    onClick={() => setSelectedHubspotContact(contact)}                <h2 className="text-xl font-semibold">Supabase Contacts</h2>      toast({

                  >

                    <CardContent className="p-4">              </div>        title: 'Data refreshed',

                      <div className="flex items-center justify-between">

                        <div>        description: 'All sync data has been updated.',

                          <p className="font-medium">{contact.properties.email}</p>

                          <p className="text-sm text-muted-foreground">              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">      });

                            {contact.properties.firstname} {contact.properties.lastname}

                          </p>                {supabaseLoading ? (    } catch (error) {

                          <p className="text-sm text-muted-foreground">

                            Status: {contact.properties.email_verification_status}                  <div className="flex items-center justify-center py-8">      toast({

                          </p>

                        </div>                    <Loader2 className="h-6 w-6 animate-spin" />        title: 'Refresh failed',

                        <Badge

                          variant={                    <span className="ml-2">Loading contacts...</span>        description: 'Failed to refresh sync data.',

                            contact.properties.email_verification_status === 'verified'

                              ? 'default'                  </div>        variant: 'destructive',

                              : contact.properties.email_verification_status === 'pending'

                              ? 'secondary'                ) : supabaseError ? (      });

                              : 'destructive'

                          }                  <div className="text-center py-8 text-red-500">    } finally {

                        >

                          {contact.properties.email_verification_status}                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />      setIsRefreshing(false);

                        </Badge>

                      </div>                    <p>Failed to load Supabase contacts</p>    }

                    </CardContent>

                  </Card>                    <p className="text-sm text-muted-foreground">{supabaseError.message}</p>  };

                ))}

              </div>                  </div>

            </div>

          </div>                ) : supabaseRecords?.records?.length > 0 ? (  // Handle bulk sync

        </TabsContent>

                  supabaseRecords.records.map((contact) => (  const handleBulkSync = async (selectedContacts: SupabaseContact[]) => {

        <TabsContent value="operations" className="space-y-6">

          <div className="text-center py-8 text-muted-foreground">                    <Card    try {

            <p>Sync operations history will be displayed here</p>

          </div>                      key={contact.id}      setIsBulkSyncing(true);

        </TabsContent>

      </Tabs>                      className={`cursor-pointer transition-colors ${      toast({

    </div>

  );                        selectedSupabaseContact?.id === contact.id        title: 'Starting bulk sync...',

}
                          ? 'ring-2 ring-blue-500 bg-blue-50'        description: `Syncing ${selectedContacts.length} contacts.`,

                          : 'hover:bg-gray-50'      });

                      }`}

                      onClick={() => setSelectedSupabaseContact(contact)}      // TODO: Implement bulk sync logic

                    >      // This will call the sync service for multiple contacts

                      <CardContent className="p-4">

                        <div className="flex items-center justify-between">      toast({

                          <div>        title: 'Bulk sync completed',

                            <p className="font-medium">{contact.email}</p>        description: `Successfully synced ${selectedContacts.length} contacts.`,

                            <p className="text-sm text-muted-foreground">      });

                              Status: {contact.email_verification_status || 'unknown'}

                            </p>      setIsBulkSyncOpen(false);

                          </div>      refetchOperations();

                          <Badge      refetchStatistics();

                            variant={    } catch (error) {

                              contact.email_verification_status === 'verified'      toast({

                                ? 'default'        title: 'Bulk sync failed',

                                : contact.email_verification_status === 'pending'        description: error instanceof Error ? error.message : 'Unknown error occurred.',

                                ? 'secondary'        variant: 'destructive',

                                : 'destructive'      });

                            }    } finally {

                          >      setIsBulkSyncing(false);

                            {contact.email_verification_status || 'unknown'}    }

                          </Badge>  };

                        </div>

                      </CardContent>  // Handle individual sync

                    </Card>  const handleIndividualSync = async (contact: SupabaseContact) => {

                  ))    try {

                ) : (      toast({

                  <div className="text-center py-8 text-muted-foreground">        title: 'Starting sync...',

                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />        description: `Syncing ${contact.firstname} ${contact.lastname}`,

                    <p>No Supabase contacts found</p>      });

                  </div>

                )}      // TODO: Implement individual sync logic

              </div>      // This will call the sync service for a single contact

            </div>

      toast({

            {/* Sync Controls */}        title: 'Sync completed',

            <div className="space-y-4">        description: `Successfully synced ${contact.firstname} ${contact.lastname}`,

              <div className="flex items-center gap-2">      });

                <ArrowRightLeft className="h-5 w-5 text-green-500" />

                <h2 className="text-xl font-semibold">Sync Controls</h2>      refetchOperations();

              </div>      refetchStatistics();

    } catch (error) {

              <Card className="p-4">      toast({

                <div className="space-y-4">        title: 'Sync failed',

                  {selectedSupabaseContact && selectedHubspotContact ? (        description: error instanceof Error ? error.message : 'Unknown error occurred.',

                    <>        variant: 'destructive',

                      <div className="text-center">      });

                        <h3 className="font-medium mb-2">Ready to Sync</h3>    }

                        <p className="text-sm text-muted-foreground mb-4">  };

                          Sync email verification status from Supabase to HubSpot

                        </p>  // Handle manual sync between selected contacts

                      </div>  const handleManualSync = async () => {

    if (!selectedSupabaseContact || !selectedHubspotContact) return;

                      <div className="space-y-2">

                        <div className="flex justify-between text-sm">    try {

                          <span>From:</span>      setIsSyncing(true);

                          <Badge variant="outline">      toast({

                            {selectedSupabaseContact.email_verification_status}        title: 'Starting sync...',

                          </Badge>        description: `Syncing ${selectedSupabaseContact.email} to HubSpot`,

                        </div>      });

                        <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

                        <div className="flex justify-between text-sm">      // TODO: Implement actual sync logic here

                          <span>To:</span>      // This will call the sync service to update HubSpot contact

                          <Badge variant="outline">

                            {selectedHubspotContact.properties.email_verification_status}      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

                          </Badge>

                        </div>      toast({

                      </div>        title: 'Sync completed',

        description: `Successfully synced ${selectedSupabaseContact.email}`,

                      <Button      });

                        onClick={handleManualSync}

                        disabled={isSyncing}      // Reset selections

                        className="w-full"      setSelectedSupabaseContact(null);

                      >      setSelectedHubspotContact(null);

                        {isSyncing ? (

                          <>    } catch (error) {

                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />      toast({

                            Syncing...        title: 'Sync failed',

                          </>        description: error instanceof Error ? error.message : 'Unknown error occurred.',

                        ) : (        variant: 'destructive',

                          <>      });

                            <CheckCircle className="h-4 w-4 mr-2" />    } finally {

                            Sync Status      setIsSyncing(false);

                          </>    }

                        )}  };

                      </Button>

                    </>  return (

                  ) : (    <div className="container mx-auto p-6 space-y-6">

                    <div className="text-center py-8 text-muted-foreground">      <div className="flex items-center justify-between">

                      <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />        <div>

                      <p className="text-sm">          <h1 className="text-3xl font-bold">Email Verification Sync</h1>

                        Select one contact from each side to sync          <p className="text-muted-foreground">

                      </p>            Manually sync email verification status between Supabase and HubSpot

                    </div>          </p>

                  )}        </div>

                </div>        <Button

              </Card>          onClick={() => {

            </div>            refetchSupabase();

          }}

            {/* HubSpot Contacts */}          disabled={supabaseLoading}

            <div className="space-y-4">          variant="outline"

              <div className="flex items-center gap-2">        >

                <Building2 className="h-5 w-5 text-orange-500" />          <RefreshCw className={`h-4 w-4 mr-2 ${supabaseLoading ? 'animate-spin' : ''}`} />

                <h2 className="text-xl font-semibold">HubSpot Contacts</h2>          Refresh

              </div>        </Button>

      </div>

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                {hubspotContacts.map((contact) => (      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                  <Card        <TabsList className="grid w-full grid-cols-2">

                    key={contact.id}          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>

                    className={`cursor-pointer transition-colors ${          <TabsTrigger value="operations">Sync Operations</TabsTrigger>

                      selectedHubspotContact?.id === contact.id        </TabsList>

                        ? 'ring-2 ring-orange-500 bg-orange-50'

                        : 'hover:bg-gray-50'        <TabsContent value="comparison" className="space-y-6">

                    }`}          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    onClick={() => setSelectedHubspotContact(contact)}            {/* Supabase Contacts */}

                  >            <div className="space-y-4">

                    <CardContent className="p-4">              <div className="flex items-center gap-2">

                      <div className="flex items-center justify-between">                <Database className="h-5 w-5 text-blue-500" />

                        <div>                <h2 className="text-xl font-semibold">Supabase Contacts</h2>

                          <p className="font-medium">{contact.properties.email}</p>              </div>

                          <p className="text-sm text-muted-foreground">

                            {contact.properties.firstname} {contact.properties.lastname}              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">

                          </p>                {supabaseLoading ? (

                          <p className="text-sm text-muted-foreground">                  <div className="flex items-center justify-center py-8">

                            Status: {contact.properties.email_verification_status}                    <Loader2 className="h-6 w-6 animate-spin" />

                          </p>                    <span className="ml-2">Loading contacts...</span>

                        </div>                  </div>

                        <Badge                ) : supabaseError ? (

                          variant={                  <div className="text-center py-8 text-red-500">

                            contact.properties.email_verification_status === 'verified'                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />

                              ? 'default'                    <p>Failed to load Supabase contacts</p>

                              : contact.properties.email_verification_status === 'pending'                    <p className="text-sm text-muted-foreground">{supabaseError.message}</p>

                              ? 'secondary'                  </div>

                              : 'destructive'                ) : supabaseRecords?.records?.length > 0 ? (

                          }                  supabaseRecords.records.map((contact) => (

                        >                    <Card

                          {contact.properties.email_verification_status}                      key={contact.id}

                        </Badge>                      className={`cursor-pointer transition-colors ${

                      </div>                        selectedSupabaseContact?.id === contact.id

                    </CardContent>                          ? 'ring-2 ring-blue-500 bg-blue-50'

                  </Card>                          : 'hover:bg-gray-50'

                ))}                      }`}

              </div>                      onClick={() => setSelectedSupabaseContact(contact)}

            </div>                    >

          </div>                      <CardContent className="p-4">

        </TabsContent>                        <div className="flex items-center justify-between">

                          <div>

        <TabsContent value="operations" className="space-y-6">                            <p className="font-medium">{contact.email}</p>

          <div className="text-center py-8 text-muted-foreground">                            <p className="text-sm text-muted-foreground">

            <p>Sync operations history will be displayed here</p>                              Status: {contact.email_verification_status || 'unknown'}

          </div>                            </p>

        </TabsContent>                          </div>

      </Tabs>                          <Badge

    </div>                            variant={

  );                              contact.email_verification_status === 'verified'

}                                ? 'default'
                                : contact.email_verification_status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {contact.email_verification_status || 'unknown'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No Supabase contacts found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold">Sync Controls</h2>
              </div>

              <Card className="p-4">
                <div className="space-y-4">
                  {selectedSupabaseContact && selectedHubspotContact ? (
                    <>
                      <div className="text-center">
                        <h3 className="font-medium mb-2">Ready to Sync</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sync email verification status from Supabase to HubSpot
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>From:</span>
                          <Badge variant="outline">
                            {selectedSupabaseContact.email_verification_status}
                          </Badge>
                        </div>
                        <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />
                        <div className="flex justify-between text-sm">
                          <span>To:</span>
                          <Badge variant="outline">
                            {selectedHubspotContact.properties.email_verification_status}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="w-full"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sync Status
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        Select one contact from each side to sync
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* HubSpot Contacts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold">HubSpot Contacts</h2>
              </div>

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {hubspotContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`cursor-pointer transition-colors ${
                      selectedHubspotContact?.id === contact.id
                        ? 'ring-2 ring-orange-500 bg-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedHubspotContact(contact)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{contact.properties.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.properties.firstname} {contact.properties.lastname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {contact.properties.email_verification_status}
                          </p>
                        </div>
                        <Badge
                          variant={
                            contact.properties.email_verification_status === 'verified'
                              ? 'default'
                              : contact.properties.email_verification_status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {contact.properties.email_verification_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <SyncOperationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.totalContacts?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              With email verification data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Contacts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {statistics?.verifiedContacts?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Email verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {operationsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">
                {operations?.filter(op => op.status === 'pending' || op.status === 'in_progress').length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Operations in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Sync</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {operationsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {operations?.filter(op => op.status === 'failed').length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Operations failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Sync Progress
            <div className={`w-2 h-2 rounded-full ${
              syncStatus.status === 'active' ? 'bg-blue-500 animate-pulse' :
              syncStatus.status === 'success' ? 'bg-green-500' :
              syncStatus.status === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{Math.round(syncProgress)}%</span>
            </div>
            <Progress
              value={syncProgress}
              className={`w-full ${
                syncStatus.status === 'error' ? '[&>div]:bg-red-500' :
                syncStatus.status === 'success' ? '[&>div]:bg-green-500' :
                syncStatus.status === 'active' ? '[&>div]:bg-blue-500' :
                ''
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedOperations.length} of {totalOperations} operations completed</span>
              <span>
                {operationsLoading ? 'Updating...' :
                 syncStatus.status === 'active' ? 'Real-time updates active' :
                 'Last updated: ' + new Date().toLocaleTimeString()}
              </span>
            </div>
            {/* Operation Status Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{completedOperations.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {operations?.filter(op => op.status === 'in_progress').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {operations?.filter(op => op.status === 'pending').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {operations?.filter(op => op.status === 'failed').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Operations</CardTitle>
              </CardHeader>
              <CardContent>
                {operationsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : operations?.length ? (
                  <div className="space-y-2">
                    {operations.slice(0, 5).map((operation) => (
                      <div key={operation.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <SyncStatusIndicator status={operation.status} size="sm" />
                          <div>
                            <p className="text-sm font-medium">
                              Contact {operation.supabaseContactId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(operation.startedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          operation.status === 'completed' ? 'default' :
                          operation.status === 'failed' ? 'destructive' :
                          operation.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {operation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No operations found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supabase Connection</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HubSpot API</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="text-sm text-muted-foreground">
                      {statistics?.lastSyncDate ?
                        new Date(statistics.lastSyncDate).toLocaleString() :
                        'Never'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sync Operations</CardTitle>
                <SyncFilters filters={filters} onFiltersChange={setFilters} />
              </div>
            </CardHeader>
            <CardContent>
              <SyncOperationTable
                operations={operations || []}
                loading={operationsLoading}
                onOperationSelect={setSelectedOperations}
                selectedOperations={selectedOperations}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Verification Contacts</CardTitle>
                <div className="flex space-x-2">
                  <SyncFilters filters={filters} onFiltersChange={setFilters} />
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : records?.records?.length ? (
                <div className="space-y-2">
                  {records.records.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {contact.firstname} {contact.lastname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.email}
                          </p>
                        </div>
                        <Badge variant={
                          contact.email_verification_status === 'verified' ? 'default' :
                          contact.email_verification_status === 'unverified' ? 'secondary' :
                          'outline'
                        }>
                          {contact.email_verification_status || 'unknown'}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIndividualSync(contact)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No contacts found with email verification data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync new contacts
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Batch Size</p>
                    <p className="text-sm text-muted-foreground">
                      Number of contacts to sync per batch
                    </p>
                  </div>
                  <Badge variant="outline">50</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Retry Policy</p>
                    <p className="text-sm text-muted-foreground">
                      Automatic retry settings for failed operations
                    </p>
                  </div>
                  <Badge variant="outline">3 attempts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Sync Dialog */}
      <BulkSyncDialog
        open={isBulkSyncOpen}
        onOpenChange={setIsBulkSyncOpen}
        contacts={records?.records || []}
        onSync={handleBulkSync}
      />

      {/* Error Display */}
      {(recordsError || operationsError || statisticsError) && (
        <SyncErrorDisplay
          errors={[
            recordsError && { source: 'Records', error: recordsError },
            operationsError && { source: 'Operations', error: operationsError },
            statisticsError && { source: 'Statistics', error: statisticsError }
          ].filter(Boolean)}
        />
      )}
    </div>
  );
}