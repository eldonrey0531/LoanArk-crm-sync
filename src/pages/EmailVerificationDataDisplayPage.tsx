// src/pages/EmailVerificationDataDisplayPage.tsx

/**
 * Email Verification Data Display Page
 *
 * Main page component for the Email Verification Data Display feature.
 * Provides a comprehensive view of contact data comparison between Supabase and HubSpot.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Database,
  ArrowRightLeft,
  Loader2,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import our new components
import { EmailVerificationDataDisplay } from '@/components/EmailVerificationDataDisplay';

// Import types
import {
  ContactComparison,
  TableFilters,
} from '@/types/emailVerificationDataDisplay';

export default function EmailVerificationDataDisplayPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Handle loading state changes
   */
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  /**
   * Handle errors
   */
  const handleError = (errorMessage: string) => {
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  };

  /**
   * Handle record selection
   */
  const handleRecordSelect = (comparison: ContactComparison) => {
    toast({
      title: 'Record Selected',
      description: `Selected record: ${comparison.supabase?.name || comparison.hubspot?.properties?.firstname || 'Unknown'}`,
    });
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Email Verification Data Display
          </h1>
          <p className='text-muted-foreground'>
            Compare email verification status between Supabase and HubSpot
            contacts
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Settings className='h-4 w-4 mr-2' />
            )}
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid gap-6'>
        {/* Data Display Component */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ArrowRightLeft className='h-5 w-5' />
              Contact Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerificationDataDisplay
              initialPageSize={25}
              showFilters={true}
              showSummary={true}
              onRecordSelect={handleRecordSelect}
              onError={handleError}
              onLoadingChange={handleLoadingChange}
              theme='light'
            />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm'>Supabase Database</h4>
                <p className='text-sm text-muted-foreground'>
                  Contact records with email verification status from the
                  primary database.
                </p>
                <div className='text-xs text-muted-foreground'>
                  <strong>Columns:</strong> name, email,
                  email_verification_status, hs_object_id
                </div>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm'>HubSpot CRM</h4>
                <p className='text-sm text-muted-foreground'>
                  Matching contact records from HubSpot CRM system.
                </p>
                <div className='text-xs text-muted-foreground'>
                  <strong>Columns:</strong> firstname, lastname, email,
                  email_verification_status
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
