// src/components/SyncProgressBar.tsx

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface SyncProgressBarProps {
  total: number;
  completed: number;
  failed?: number;
  pending?: number;
  showDetails?: boolean;
  className?: string;
}

/**
 * Component for displaying sync operation progress
 */
export function SyncProgressBar({
  total,
  completed,
  failed = 0,
  pending = 0,
  showDetails = true,
  className = '',
}: SyncProgressBarProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const inProgress = total - completed - failed - pending;

  const getProgressColor = () => {
    if (failed > 0) return 'bg-red-500';
    if (progress === 100) return 'bg-green-500';
    if (inProgress > 0) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (progress === 100) return 'Complete';
    if (failed > 0) return 'In Progress (with errors)';
    if (inProgress > 0) return 'In Progress';
    if (pending > 0) return 'Pending';
    return 'Not Started';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className='space-y-1'>
        <div className='flex justify-between items-center text-sm'>
          <span className='font-medium'>Sync Progress</span>
          <div className='flex items-center gap-2'>
            <span>{Math.round(progress)}%</span>
            <Badge variant='outline' className='text-xs'>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <Progress
          value={progress}
          className='w-full h-2'
          // Note: In a real implementation, you might need to customize the progress bar color
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className='flex justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1'>
              <CheckCircle className='w-3 h-3 text-green-500' />
              {completed} completed
            </span>
            {inProgress > 0 && (
              <span className='flex items-center gap-1'>
                <Clock className='w-3 h-3 text-blue-500' />
                {inProgress} in progress
              </span>
            )}
            {pending > 0 && (
              <span className='flex items-center gap-1'>
                <Clock className='w-3 h-3 text-yellow-500' />
                {pending} pending
              </span>
            )}
            {failed > 0 && (
              <span className='flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3 text-red-500' />
                {failed} failed
              </span>
            )}
          </div>
          <span>Total: {total}</span>
        </div>
      )}

      {/* Error Summary */}
      {failed > 0 && (
        <div className='text-xs text-red-600 bg-red-50 p-2 rounded'>
          <AlertTriangle className='w-3 h-3 inline mr-1' />
          {failed} operation{failed !== 1 ? 's' : ''} failed. Check the
          operations table for details.
        </div>
      )}
    </div>
  );
}
