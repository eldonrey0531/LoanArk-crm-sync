// src/components/SyncOperationTable.tsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { SyncOperation } from '@/types/emailVerification';
import { RotateCcw, Eye } from 'lucide-react';

interface SyncOperationTableProps {
  operations: SyncOperation[];
  loading?: boolean;
  onOperationSelect?: (operationIds: string[]) => void;
  selectedOperations?: string[];
  onRetryOperation?: (operationId: string) => void;
  onViewOperation?: (operation: SyncOperation) => void;
}

/**
 * Table component for displaying sync operations
 */
export function SyncOperationTable({
  operations,
  loading = false,
  onOperationSelect,
  selectedOperations = [],
  onRetryOperation,
  onViewOperation
}: SyncOperationTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onOperationSelect?.(operations.map(op => op.id));
    } else {
      onOperationSelect?.([]);
    }
  };

  const handleSelectOperation = (operationId: string, checked: boolean) => {
    if (checked) {
      onOperationSelect?.([...selectedOperations, operationId]);
    } else {
      onOperationSelect?.(selectedOperations.filter(id => id !== operationId));
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No sync operations found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {onOperationSelect && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedOperations.length === operations.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Status</TableHead>
            <TableHead>Contact ID</TableHead>
            <TableHead>Source Value</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => (
            <TableRow key={operation.id}>
              {onOperationSelect && (
                <TableCell>
                  <Checkbox
                    checked={selectedOperations.includes(operation.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOperation(operation.id, checked as boolean)
                    }
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  <SyncStatusIndicator status={operation.status} size="sm" />
                  <Badge variant={
                    operation.status === 'completed' ? 'default' :
                    operation.status === 'failed' ? 'destructive' :
                    operation.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {operation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Supabase: {operation.supabaseContactId}</div>
                  <div className="text-muted-foreground">HubSpot: {operation.hubspotContactId}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{operation.sourceValue}</span>
                  {operation.targetValue && operation.targetValue !== operation.sourceValue && (
                    <span className="text-muted-foreground">→ {operation.targetValue}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(operation.startedAt).toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDuration(operation.startedAt, operation.completedAt)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onViewOperation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOperation(operation)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {operation.status === 'failed' && operation.error?.canRetry && onRetryOperation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetryOperation(operation.id)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}