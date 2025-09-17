// src/components/LoadingState.tsx

/**
 * Loading State Component
 *
 * Displays loading indicators for different types of content.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Import types
import { LoadingStateProps } from '@/types/emailVerificationDataDisplay';

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message = 'Loading...',
  className
}) => {
  const renderLoadingContent = () => {
    switch (type) {
      case 'table':
        return (
          <Card className={className}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
              </div>
              {/* Table skeleton */}
              <div className="space-y-3 mt-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        );

      case 'card':
        return (
          <Card className={className}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'inline':
        return (
          <div className={`flex items-center gap-2 ${className || ''}`}>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
        );

      default:
        return (
          <div className={`flex items-center justify-center py-8 ${className || ''}`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        );
    }
  };

  return renderLoadingContent();
};