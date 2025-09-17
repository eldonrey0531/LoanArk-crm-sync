import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Loader2,
  Database
} from 'lucide-react';
import { SupabaseContact, SyncStatus } from '@/types/emailVerification';

interface EmailVerificationTableProps {
  records: SupabaseContact[];
  syncStatuses: Record<number, SyncStatus>;
  syncErrors: Record<number, string>;
  selectedRecords: Set<number>;
  onRecordSelect: (recordId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSyncRecord: (recordId: number) => void;
  onSyncSelected: () => void;
  isLoading?: boolean;
}

export function EmailVerificationTable({
  records,
  syncStatuses,
  syncErrors,
  selectedRecords,
  onRecordSelect,
  onSelectAll,
  onSyncRecord,
  onSyncSelected,
  isLoading = false
}: EmailVerificationTableProps) {
  const allSelected = records.length > 0 && records.every(record => selectedRecords.has(record.id));
  const someSelected = records.some(record => selectedRecords.has(record.id));

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SyncStatus) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      in_progress: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getVerificationStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Not Set</Badge>;

    const variants = {
      verified: 'default',
      unverified: 'secondary',
      bounced: 'destructive',
      complained: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading records...</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No email verification records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedRecords.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            onClick={onSyncSelected}
            size="sm"
            className="ml-auto"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Sync Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Sync Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const syncStatus = syncStatuses[record.id] || 'pending';
              const syncError = syncErrors[record.id];

              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.has(record.id)}
                      onCheckedChange={(checked) =>
                        onRecordSelect(record.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {record.firstname} {record.lastname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {record.id}
                    </div>
                  </TableCell>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>
                    {getVerificationStatusBadge(record.email_verification_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(syncStatus)}
                      {getStatusBadge(syncStatus)}
                      {syncError && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.updated_at
                        ? new Date(record.updated_at).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onSyncRecord(record.id)}
                      size="sm"
                      variant="outline"
                      disabled={syncStatus === 'in_progress'}
                    >
                      {syncStatus === 'in_progress' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}