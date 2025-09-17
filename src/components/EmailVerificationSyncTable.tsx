// src/components/EmailVerificationSyncTable.tsx

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
  Database,
  ArrowRight
} from 'lucide-react';
import { ContactComparison } from '@/types/emailVerificationDataDisplay';

interface EmailVerificationSyncTableProps {
  data: ContactComparison[];
  selectedIds: Set<string>;
  onRecordSelect: (recordId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSyncRecord: (recordId: string) => void;
  onSyncSelected: () => void;
  isLoading?: boolean;
}

export function EmailVerificationSyncTable({
  data,
  selectedIds,
  onRecordSelect,
  onSelectAll,
  onSyncRecord,
  onSyncSelected,
  isLoading = false
}: EmailVerificationSyncTableProps) {
  const allSelected = data.length > 0 && data.every(comparison => selectedIds.has(comparison.id));
  const someSelected = data.some(comparison => selectedIds.has(comparison.id));

  const getVerificationStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Not Set</Badge>;

    switch (status.toLowerCase()) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMatchStatusBadge = (matchStatus: string) => {
    switch (matchStatus) {
      case 'matched':
        return <Badge variant="default" className="bg-green-500">Matched</Badge>;
      case 'supabase_only':
        return <Badge variant="secondary">Supabase Only</Badge>;
      case 'hubspot_only':
        return <Badge variant="outline">HubSpot Only</Badge>;
      case 'mismatch':
        return <Badge variant="destructive">Mismatch</Badge>;
      default:
        return <Badge variant="outline">{matchStatus}</Badge>;
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No email verification records found</p>
        <p className="text-sm">Records with email verification status will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} record{selectedIds.size !== 1 ? 's' : ''} selected
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

      {/* Side-by-side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Data Table */}
        <div className="border rounded-lg bg-blue-50/30">
          <div className="p-4 border-b bg-blue-100/50">
            <h3 className="font-semibold text-blue-900">Supabase Data</h3>
            <p className="text-sm text-blue-700">Source records with verification status</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((comparison) => {
                  if (!comparison.supabase) return null;

                  const record = comparison.supabase;
                  const isSelected = selectedIds.has(comparison.id);

                  return (
                    <TableRow key={`supabase-${comparison.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            onRecordSelect(comparison.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {record.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>
                        {getVerificationStatusBadge(record.email_verification_status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onSyncRecord(comparison.id)}
                          size="sm"
                          variant="outline"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* HubSpot Data Table */}
        <div className="border rounded-lg bg-green-50/30">
          <div className="p-4 border-b bg-green-100/50">
            <h3 className="font-semibold text-green-900">HubSpot Data</h3>
            <p className="text-sm text-green-700">Matching HubSpot contact records</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HS ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((comparison) => {
                  const hubspotData = comparison.hubspot;

                  return (
                    <TableRow key={`hubspot-${comparison.id}`}>
                      <TableCell>
                        {getMatchStatusBadge(comparison.match_status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {hubspotData
                            ? `${hubspotData.properties.firstname || ''} ${hubspotData.properties.lastname || ''}`.trim() || 'N/A'
                            : 'No match'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {hubspotData?.properties.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {hubspotData
                          ? getVerificationStatusBadge(hubspotData.properties.email_verification_status)
                          : <Badge variant="secondary">No data</Badge>
                        }
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {comparison.supabase?.hs_object_id || 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}