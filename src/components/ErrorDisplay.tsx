// src/components/ErrorDisplay.tsx

/**
 * Error Display Component
 *
 * Displays error messages with retry functionality and optional details.
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertTriangle,
  AlertCircle,
  Wifi,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';

// Import types
import { ErrorDisplayProps } from '@/types/emailVerificationDataDisplay';

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  type,
  onRetry,
  onDismiss,
  showDetails = false,
  details,
  className,
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className='h-4 w-4' />,
          title: 'Network Error',
          variant: 'destructive' as const,
          description:
            'Unable to connect to the server. Please check your internet connection.',
        };
      case 'auth':
        return {
          icon: <AlertTriangle className='h-4 w-4' />,
          title: 'Authentication Error',
          variant: 'destructive' as const,
          description:
            'You are not authorized to perform this action. Please log in again.',
        };
      case 'validation':
        return {
          icon: <AlertCircle className='h-4 w-4' />,
          title: 'Validation Error',
          variant: 'destructive' as const,
          description: 'The provided data is invalid. Please check your input.',
        };
      case 'server':
        return {
          icon: <AlertTriangle className='h-4 w-4' />,
          title: 'Server Error',
          variant: 'destructive' as const,
          description:
            'An internal server error occurred. Please try again later.',
        };
      default:
        return {
          icon: <AlertCircle className='h-4 w-4' />,
          title: 'Error',
          variant: 'destructive' as const,
          description: 'An unexpected error occurred.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Card className={className}>
      <CardContent className='p-6'>
        <Alert variant={config.variant}>
          {config.icon}
          <AlertTitle className='flex items-center justify-between'>
            <span>{config.title}</span>
            {onDismiss && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onDismiss}
                className='h-6 w-6 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </AlertTitle>
          <AlertDescription className='mt-2'>
            <p>{config.description}</p>
            <p className='mt-2 font-mono text-sm bg-muted p-2 rounded'>
              {error}
            </p>

            {/* Error details */}
            {(showDetails || details) && (
              <Collapsible
                open={showErrorDetails}
                onOpenChange={setShowErrorDetails}
                className='mt-4'
              >
                <CollapsibleTrigger asChild>
                  <Button variant='outline' size='sm'>
                    {showErrorDetails ? (
                      <>
                        <ChevronDown className='h-4 w-4 mr-1' />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronRight className='h-4 w-4 mr-1' />
                        Show Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='mt-2'>
                  <div className='bg-muted p-3 rounded-md'>
                    <pre className='text-xs overflow-auto'>
                      {JSON.stringify(details || { error }, null, 2)}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Action buttons */}
            <div className='flex items-center gap-2 mt-4'>
              {onRetry && (
                <Button variant='outline' size='sm' onClick={onRetry}>
                  <RefreshCw className='h-4 w-4 mr-1' />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button variant='ghost' size='sm' onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
