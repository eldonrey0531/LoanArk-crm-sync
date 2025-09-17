// src/components/SyncControls.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  RotateCcw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SyncControlsProps {
  isAutoSyncEnabled?: boolean;
  onToggleAutoSync?: () => void;
  onManualSync?: () => void;
  onPauseSync?: () => void;
  onResumeSync?: () => void;
  onSettings?: () => void;
  syncStatus?: 'idle' | 'running' | 'paused' | 'error';
  pendingOperations?: number;
  failedOperations?: number;
}

/**
 * Component for sync operation controls
 */
export function SyncControls({
  isAutoSyncEnabled = false,
  onToggleAutoSync,
  onManualSync,
  onPauseSync,
  onResumeSync,
  onSettings,
  syncStatus = 'idle',
  pendingOperations = 0,
  failedOperations = 0
}: SyncControlsProps) {
  const getStatusDisplay = () => {
    switch (syncStatus) {
      case 'running':
        return {
          icon: RotateCcw,
          text: 'Running',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'paused':
        return {
          icon: Pause,
          text: 'Paused',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          text: 'Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: Clock,
          text: 'Idle',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      {/* Status Display */}
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${statusDisplay.bgColor}`}>
          <StatusIcon className={`w-4 h-4 ${statusDisplay.color} ${
            syncStatus === 'running' ? 'animate-spin' : ''
          }`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Sync Status</span>
            <Badge variant={
              syncStatus === 'running' ? 'default' :
              syncStatus === 'paused' ? 'secondary' :
              syncStatus === 'error' ? 'destructive' : 'outline'
            }>
              {statusDisplay.text}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {pendingOperations > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingOperations} pending
              </span>
            )}
            {failedOperations > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {failedOperations} failed
              </span>
            )}
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Auto-sync {isAutoSyncEnabled ? 'enabled' : 'disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {onSettings && (
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        )}

        <Separator orientation="vertical" className="h-6" />

        {onToggleAutoSync && (
          <Button
            variant={isAutoSyncEnabled ? "default" : "outline"}
            size="sm"
            onClick={onToggleAutoSync}
          >
            {isAutoSyncEnabled ? 'Disable' : 'Enable'} Auto-sync
          </Button>
        )}

        {syncStatus === 'running' && onPauseSync && (
          <Button variant="outline" size="sm" onClick={onPauseSync}>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}

        {syncStatus === 'paused' && onResumeSync && (
          <Button variant="outline" size="sm" onClick={onResumeSync}>
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        )}

        {onManualSync && (
          <Button size="sm" onClick={onManualSync} disabled={syncStatus === 'running'}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Manual Sync
          </Button>
        )}
      </div>
    </div>
  );
}