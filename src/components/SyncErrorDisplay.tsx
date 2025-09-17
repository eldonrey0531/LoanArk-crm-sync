// src/components/SyncErrorDisplay.tsx

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SyncError {
  source: string;
  error: Error;
}

interface SyncErrorDisplayProps {
  errors: (SyncError | false)[];
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Component for displaying sync-related errors
 */
export function SyncErrorDisplay({ errors, onRetry, onDismiss }: SyncErrorDisplayProps) {
  const validErrors = errors.filter((error): error is SyncError => error !== false);

  if (validErrors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validErrors.map((error, index) => (
        <Alert key={index} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>Sync Error - {error.source}</span>
            <div className="flex items-center gap-2">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="text-sm">{error.error.message}</p>
              {error.error.stack && (
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
                    Show technical details
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {error.error.stack}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}