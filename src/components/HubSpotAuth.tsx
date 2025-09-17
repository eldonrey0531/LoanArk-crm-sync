import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useHubSpot } from '../contexts/HubSpotContext';
import {
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const HubSpotAuth: React.FC = () => {
  const {
    isAuthenticated,
    authError,
    user,
    hubspotConnected,
    isLoading,
    error,
    hubspotCount,
    login,
    logout,
    getAuthUrl,
    clearError,
  } = useHubSpot();

  const handleLogin = () => {
    clearError();
    login();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOpenAuthUrl = () => {
    const url = getAuthUrl();
    window.open(url, '_blank', 'width=600,height=700');
  };

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ExternalLink className='h-5 w-5' />
          HubSpot Authentication
        </CardTitle>
        <CardDescription>
          Connect your HubSpot account to enable CRM synchronization
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Authentication Status */}
        <div className='flex items-center justify-between p-4 border rounded-lg'>
          <div className='flex items-center gap-3'>
            {isAuthenticated ? (
              <CheckCircle className='h-5 w-5 text-green-500' />
            ) : (
              <XCircle className='h-5 w-5 text-red-500' />
            )}
            <div>
              <p className='font-medium'>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </p>
              {user && (
                <p className='text-sm text-gray-600'>
                  {user.email || 'User connected'}
                </p>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
            {!isAuthenticated ? (
              <>
                <Button onClick={handleLogin} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <LogIn className='h-4 w-4 mr-2' />
                  )}
                  Connect HubSpot
                </Button>
                <Button variant='outline' onClick={handleOpenAuthUrl}>
                  <ExternalLink className='h-4 w-4 mr-2' />
                  Open Auth Page
                </Button>
              </>
            ) : (
              <Button variant='outline' onClick={handleLogout}>
                <LogOut className='h-4 w-4 mr-2' />
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {isAuthenticated && (
          <div className='p-4 border rounded-lg'>
            <div className='flex items-center justify-between mb-2'>
              <span className='font-medium'>CRM Connection</span>
              <Badge variant={hubspotConnected ? 'default' : 'destructive'}>
                {hubspotConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {hubspotConnected && hubspotCount !== null && (
              <p className='text-sm text-gray-600'>
                {hubspotCount.toLocaleString()} contacts available
              </p>
            )}
          </div>
        )}

        {/* Error Messages */}
        {authError && (
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertDescription>
              Authentication Error: {authError}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertDescription>Connection Error: {error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        {!isAuthenticated && (
          <Alert>
            <ExternalLink className='h-4 w-4' />
            <AlertDescription>
              Click "Connect HubSpot" to authenticate with your HubSpot account.
              You'll be redirected to HubSpot's authorization page.
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Scopes */}
        <div className='text-sm text-gray-600'>
          <p className='font-medium mb-2'>Required Permissions:</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Read contacts and companies</li>
            <li>Write contacts and companies</li>
            <li>Read and write deals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HubSpotAuth;
