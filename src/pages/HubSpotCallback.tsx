import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import HubSpotAuthService from '../services/hubspot-auth';

const HubSpotCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        const authService = HubSpotAuthService.getInstance();
        await authService.exchangeCodeForToken(code, state);

        setStatus('success');

        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/settings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            HubSpot Authentication
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your authentication...'}
            {status === 'success' && 'Successfully authenticated with HubSpot!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have been successfully authenticated with HubSpot.
                Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HubSpotCallback;