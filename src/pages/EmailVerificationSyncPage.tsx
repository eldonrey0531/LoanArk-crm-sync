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
import { useEmailVerificationSyncDisplay } from '@/hooks/useEmailVerificationSyncDisplay';
import { EmailVerificationSyncTable } from '@/components/EmailVerificationSyncTable';
import { ContactComparison, TableFilters } from '@/types/emailVerificationDataDisplay';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Use the new sync display hook
  const {
    data: comparisons,
    isLoading,
    error,
    refetch
  } = useEmailVerificationSyncDisplay({
    search: searchTerm,
    status: 'all'
  });

  // Filter records based on search
  const filteredComparisons = comparisons?.filter(comparison => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const supabaseName = comparison.supabase?.name?.toLowerCase() || '';
    const supabaseEmail = comparison.supabase?.email?.toLowerCase() || '';
    const hubspotName = comparison.hubspot
      ? `${comparison.hubspot.properties.firstname || ''} ${comparison.hubspot.properties.lastname || ''}`.trim().toLowerCase()
      : '';
    const hubspotEmail = comparison.hubspot?.properties.email?.toLowerCase() || '';

    return supabaseName.includes(searchLower) ||
           supabaseEmail.includes(searchLower) ||
           hubspotName.includes(searchLower) ||
           hubspotEmail.includes(searchLower);
  }) || [];

  const handleRecordSelect = (recordId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(filteredComparisons.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSyncRecord = async (recordId: string) => {
    const comparison = filteredComparisons.find(c => c.id === recordId);
    if (!comparison?.supabase) return;

    toast({
      title: "Sync Started",
      description: `Syncing ${comparison.supabase.name} to HubSpot...`,
    });

    // TODO: Implement actual sync logic
    console.log('Syncing record:', comparison.supabase);
  };

  const handleSyncSelected = async () => {
    if (selectedIds.size === 0) return;

    toast({
      title: "Bulk Sync Started",
      description: `Syncing ${selectedIds.size} record${selectedIds.size !== 1 ? 's' : ''} to HubSpot...`,
    });

    // TODO: Implement bulk sync logic
    console.log('Syncing selected records:', Array.from(selectedIds));

    setSelectedIds(new Set()); // Clear selection after sync
  };

  const handleRefresh = () => {
    refetch();
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
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={handleSyncSelected}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Sync Selected ({selectedIds.size})
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
                    Error loading records: {error?.message || 'Unknown error'}
                  </div>
                )}

                <EmailVerificationSyncTable
                  data={filteredComparisons}
                  selectedIds={selectedIds}
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
                {selectedIds.size === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync operations in progress</p>
                    <p className="text-sm">Select records above to initiate sync operations</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {selectedIds.size} record{selectedIds.size !== 1 ? 's' : ''} selected
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ready for sync
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
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