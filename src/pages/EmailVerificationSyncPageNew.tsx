import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
  Building2,
  ArrowRightLeft,
  ArrowDown,
  Loader2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import custom hooks
import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';

// Import toast
import { toast } from '@/hooks/use-toast';

export default function EmailVerificationSyncPage() {
  // State management
  const [activeTab, setActiveTab] = useState('comparison');
  const [selectedSupabaseContact, setSelectedSupabaseContact] = useState(null);
  const [selectedHubspotContact, setSelectedHubspotContact] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Custom hooks for data fetching
  const {
    data: supabaseRecords,
    isLoading: supabaseLoading,
    error: supabaseError,
    refetch: refetchSupabase
  } = useEmailVerificationRecords();

  // Mock HubSpot data for now
  const hubspotContacts = [
    {
      id: 'contact_123',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        email_verification_status: 'unverified'
      }
    },
    {
      id: 'contact_124',
      properties: {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        email_verification_status: 'verified'
      }
    },
    {
      id: 'contact_125',
      properties: {
        firstname: 'Bob',
        lastname: 'Johnson',
        email: 'bob.johnson@example.com',
        email_verification_status: 'pending'
      }
    }
  ];

  // Handle manual sync between selected contacts
  const handleManualSync = async () => {
    if (!selectedSupabaseContact || !selectedHubspotContact) return;

    try {
      setIsSyncing(true);
      toast({
        title: 'Starting sync...',
        description: `Syncing ${selectedSupabaseContact.email} to HubSpot`,
      });

      // TODO: Implement actual sync logic here
      // This will call the sync service to update HubSpot contact

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast({
        title: 'Sync completed',
        description: `Successfully synced ${selectedSupabaseContact.email}`,
      });

      // Reset selections
      setSelectedSupabaseContact(null);
      setSelectedHubspotContact(null);

    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Verification Sync</h1>
          <p className="text-muted-foreground">
            Manually sync email verification status between Supabase and HubSpot
          </p>
        </div>
        <Button
          onClick={() => {
            refetchSupabase();
          }}
          disabled={supabaseLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${supabaseLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
          <TabsTrigger value="operations">Sync Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Supabase Contacts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Supabase Contacts</h2>
              </div>

              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {supabaseLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading contacts...</span>
                  </div>
                ) : supabaseError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load Supabase contacts</p>
                    <p className="text-sm text-muted-foreground">{supabaseError.message}</p>
                  </div>
                ) : supabaseRecords?.records?.length > 0 ? (
                  supabaseRecords.records.map((contact) => (
                    <Card
                      key={contact.id}
                      className={`cursor-pointer transition-colors ${
                        selectedSupabaseContact?.id === contact.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSupabaseContact(contact)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: {contact.email_verification_status || 'unknown'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              contact.email_verification_status === 'verified'
                                ? 'default'
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
          <div className="text-center py-8 text-muted-foreground">
            <p>Sync operations history will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}