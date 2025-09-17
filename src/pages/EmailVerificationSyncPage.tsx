import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Database,
  ArrowRightLeft,
  Loader2,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmailVerificationSync } from '@/hooks/useEmailVerificationSync';
import { EmailVerificationTable } from '@/components/EmailVerificationTable';
import { SyncStatus } from '@/components/SyncStatus';

interface SupabaseContact {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  email_verification_status: string;
  created_at: string;
  updated_at: string;
  hs_object_id?: string;
}

export default function EmailVerificationSyncPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Use the comprehensive email verification sync hook
  const {
    records,
    isLoading,
    error,
    syncStatuses,
    syncErrors,
    loadRecords,
    syncRecord,
    retrySync
  } = useEmailVerificationSync();

  // Filter records based on search
  const filteredRecords = records?.filter(record => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      record.email?.toLowerCase().includes(searchLower) ||
      record.firstname?.toLowerCase().includes(searchLower) ||
      record.lastname?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleRecordSelect = (recordId: number, selected: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (selected) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  const handleSyncRecord = async (recordId: number) => {
    try {
      const record = records?.find(r => r.id === recordId);
      if (!record) {
        throw new Error(`Record ${recordId} not found`);
      }

      await syncRecord(record);
      toast({
        title: "Sync initiated",
        description: "Email verification sync has been started for this record.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to initiate sync for this record.",
        variant: "destructive"
      });
    }
  };

  const handleSyncSelected = async () => {
    if (selectedRecords.size === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to sync.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Sync each selected record
      const syncPromises = Array.from(selectedRecords).map(async (recordId) => {
        const record = records?.find(r => r.id === recordId);
        if (record) {
          return syncRecord(record);
        }
      });

      await Promise.all(syncPromises);

      toast({
        title: "Bulk sync initiated",
        description: `Sync has been started for ${selectedRecords.size} record${selectedRecords.size !== 1 ? 's' : ''}.`,
      });
      setSelectedRecords(new Set()); // Clear selection after sync
    } catch (error) {
      toast({
        title: "Bulk sync failed",
        description: "Failed to initiate sync for selected records.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Verification Sync</h1>
          <p className="text-muted-foreground">
            Sync email verification status from Supabase to HubSpot contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadRecords()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={handleSyncSelected}
            disabled={selectedRecords.size === 0}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Sync Selected ({selectedRecords.size})
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Email Verification Records</TabsTrigger>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Email Verification Records
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 max-w-sm"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                    Error loading records: {error}
                  </div>
                )}

                <EmailVerificationTable
                  records={filteredRecords}
                  syncStatuses={syncStatuses}
                  syncErrors={syncErrors}
                  selectedRecords={selectedRecords}
                  onRecordSelect={handleRecordSelect}
                  onSelectAll={handleSelectAll}
                  onSyncRecord={handleSyncRecord}
                  onSyncSelected={handleSyncSelected}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Operations Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(syncStatuses).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync operations in progress</p>
                    <p className="text-sm">Sync status will appear here when operations are initiated</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(syncStatuses).map(([recordId, status]) => {
                      const record = records?.find(r => r.id === parseInt(recordId));

                      return (
                        <div key={recordId} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">
                              {record ? `${record.firstname} ${record.lastname}` : `Record ${recordId}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {record?.email}
                            </div>
                          </div>
                          <SyncStatus
                            status={status}
                            showRetry={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}