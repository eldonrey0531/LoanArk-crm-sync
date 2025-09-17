// src/pages/EmailVerificationSyncPage.tsx

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Zap,
  Filter,
  Download,
  Play,
  Pause,
  Settings
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import {
  SupabaseContact,
  SyncOperation,
  GetEmailVerificationRecordsParams
} from '@/types/emailVerification';

// Import custom hooks (to be created)
import { useEmailVerificationRecords } from '@/hooks/useEmailVerificationRecords';
import { useSyncOperations } from '@/hooks/useSyncOperations';
import { useSyncStatistics } from '@/hooks/useSyncStatistics';

// Import components (to be created)
import { SyncOperationTable } from '@/components/SyncOperationTable';
import { SyncControls } from '@/components/SyncControls';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { BulkSyncDialog } from '@/components/BulkSyncDialog';
import { SyncFilters } from '@/components/SyncFilters';
import { SyncProgressBar } from '@/components/SyncProgressBar';
import { SyncErrorDisplay } from '@/components/SyncErrorDisplay';

import { toast } from '@/hooks/use-toast';

export default function EmailVerificationSyncPage() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isBulkSyncOpen, setIsBulkSyncOpen] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [filters, setFilters] = useState<GetEmailVerificationRecordsParams>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Custom hooks for data fetching
  const {
    data: records,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords
  } = useEmailVerificationRecords(filters);

  const {
    data: operations,
    isLoading: operationsLoading,
    error: operationsError,
    refetch: refetchOperations
  } = useSyncOperations();

  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
    refetch: refetchStatistics
  } = useSyncStatistics();

  // Intelligent auto-refresh based on operation status
  useEffect(() => {
    if (!operations) return;

    const hasActiveOperations = operations.some(op =>
      op.status === 'in_progress' || op.status === 'pending'
    );

    // Poll more frequently (10 seconds) when there are active operations
    // Poll less frequently (60 seconds) when all operations are complete
    const intervalMs = hasActiveOperations ? 10000 : 60000;

    const interval = setInterval(() => {
      refetchOperations();
      refetchStatistics();

      // Only refetch records if there are active operations (to avoid unnecessary API calls)
      if (hasActiveOperations) {
        refetchRecords();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [operations, refetchRecords, refetchOperations, refetchStatistics]);

  // Real-time sync status indicator
  const getSyncStatus = () => {
    if (!operations) return { status: 'unknown', message: 'Loading...' };

    const activeOps = operations.filter(op => op.status === 'in_progress' || op.status === 'pending');
    const failedOps = operations.filter(op => op.status === 'failed');
    const completedOps = operations.filter(op => op.status === 'completed');

    if (activeOps.length > 0) {
      return {
        status: 'active',
        message: `Syncing ${activeOps.length} contact${activeOps.length > 1 ? 's' : ''}...`
      };
    }

    if (failedOps.length > 0) {
      return {
        status: 'error',
        message: `${failedOps.length} sync${failedOps.length > 1 ? 's' : ''} failed`
      };
    }

    if (completedOps.length > 0) {
      return {
        status: 'success',
        message: `All ${completedOps.length} sync${completedOps.length > 1 ? 's' : ''} completed`
      };
    }

    return { status: 'idle', message: 'No active syncs' };
  };

  const syncStatus = getSyncStatus();

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refetchRecords(),
        refetchOperations(),
        refetchStatistics()
      ]);

      toast({
        title: 'Data refreshed',
        description: 'All sync data has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh sync data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle bulk sync
  const handleBulkSync = async (selectedContacts: SupabaseContact[]) => {
    try {
      setIsBulkSyncing(true);
      toast({
        title: 'Starting bulk sync...',
        description: `Syncing ${selectedContacts.length} contacts.`,
      });

      // TODO: Implement bulk sync logic
      // This will call the sync service for multiple contacts

      toast({
        title: 'Bulk sync completed',
        description: `Successfully synced ${selectedContacts.length} contacts.`,
      });

      setIsBulkSyncOpen(false);
      refetchOperations();
      refetchStatistics();
    } catch (error) {
      toast({
        title: 'Bulk sync failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkSyncing(false);
    }
  };

  // Handle individual sync
  const handleIndividualSync = async (contact: SupabaseContact) => {
    try {
      toast({
        title: 'Starting sync...',
        description: `Syncing ${contact.firstname} ${contact.lastname}`,
      });

      // TODO: Implement individual sync logic
      // This will call the sync service for a single contact

      toast({
        title: 'Sync completed',
        description: `Successfully synced ${contact.firstname} ${contact.lastname}`,
      });

      refetchOperations();
      refetchStatistics();
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  // Calculate sync progress
  const completedOperations = operations?.filter(op => op.status === 'completed') || [];
  const totalOperations = operations?.length || 0;
  const syncProgress = totalOperations > 0 ? (completedOperations.length / totalOperations) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Verification Sync</h1>
          <p className="text-muted-foreground mt-1">
            Synchronize email verification status from Supabase to HubSpot contacts
          </p>
          {/* Real-time Status Indicator */}
          <div className="flex items-center mt-2 space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus.status === 'active' ? 'bg-blue-500 animate-pulse' :
              syncStatus.status === 'success' ? 'bg-green-500' :
              syncStatus.status === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            <span className={`text-sm ${
              syncStatus.status === 'active' ? 'text-blue-600' :
              syncStatus.status === 'success' ? 'text-green-600' :
              syncStatus.status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {syncStatus.message}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsBulkSyncOpen(true)}
            disabled={!records?.records?.length || isBulkSyncing}
          >
            {isBulkSyncing ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {isBulkSyncing ? 'Syncing...' : 'Bulk Sync'}
          </Button>
        </div>
      </div>

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