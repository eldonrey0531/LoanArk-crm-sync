// src/components/SyncStatusIndicator.tsx

import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Component for displaying sync operation status with appropriate icon and color
 */
export function SyncStatusIndicator({
  status,
  size = 'md',
  showText = false,
  className,
}: SyncStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          text: 'Completed',
          badgeVariant: 'default' as const,
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: 'Failed',
          badgeVariant: 'destructive' as const,
        };
      case 'in_progress':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          text: 'In Progress',
          badgeVariant: 'secondary' as const,
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          text: 'Pending',
          badgeVariant: 'outline' as const,
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: 'Unknown',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (showText) {
    return (
      <Badge
        variant={config.badgeVariant}
        className={cn('flex items-center gap-1', className)}
      >
        <Icon className={cn(sizeClasses[size], 'animate-spin')} />
        {config.text}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full p-1',
        config.bgColor,
        className
      )}
    >
      <Icon
        className={cn(
          sizeClasses[size],
          config.color,
          status === 'in_progress' && 'animate-spin'
        )}
      />
    </div>
  );
}
