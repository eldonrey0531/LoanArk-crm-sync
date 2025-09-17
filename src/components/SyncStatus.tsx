import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SyncStatus as SyncStatusType } from '@/types/emailVerification';

interface SyncStatusProps {
  status: SyncStatusType;
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function SyncStatus({
  status,
  error,
  onRetry,
  showRetry = true,
  className = ''
}: SyncStatusProps) {
  const getStatusConfig = (status: SyncStatusType) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          text: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'failed':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          text: 'Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'in_progress':
        return {
          icon: Loader2,
          variant: 'secondary' as const,
          text: 'In Progress',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'outline' as const,
          text: 'Pending',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'outline' as const,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
        <Icon
          className={`h-4 w-4 ${config.color} ${status === 'in_progress' ? 'animate-spin' : ''}`}
        />
        <Badge variant={config.variant} className="text-xs">
          {config.text}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
            {error}
          </span>
        </div>
      )}

      {status === 'failed' && onRetry && showRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Compact version for use in tables or lists
interface SyncStatusCompactProps {
  status: SyncStatusType;
  className?: string;
}

export function SyncStatusCompact({ status, className = '' }: SyncStatusCompactProps) {
  const getStatusIcon = (status: SyncStatusType) => {
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {getStatusIcon(status)}
    </div>
  );
}

// Text-only version for simple status display
interface SyncStatusTextProps {
  status: SyncStatusType;
  className?: string;
}

export function SyncStatusText({ status, className = '' }: SyncStatusTextProps) {
  const getStatusText = (status: SyncStatusType) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`text-sm ${className}`}>
      {getStatusText(status)}
    </span>
  );
}