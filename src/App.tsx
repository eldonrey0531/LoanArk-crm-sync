import { useEffect } from 'react';
import { debugEnvironment } from '@/utils/debug';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HubSpotProvider } from './contexts/HubSpotContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactsViewer from './pages/ContactsViewer';
import LatestCreated from './pages/LatestCreated';
import LatestUpdated from './pages/LatestUpdated';
import SyncMonitor from './pages/SyncMonitor';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import HubSpotCallback from './pages/HubSpotCallback';
import SupabaseDatabase from './pages/SupabaseDatabase';
import HubSpotContacts from './pages/HubSpotContacts';
import EmailVerificationSyncPage from './pages/EmailVerificationSyncPage';
import EmailVerificationDataDisplayPage from './pages/EmailVerificationDataDisplayPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000
    }
  }
});

const App = () => {
  useEffect(() => {
    try {
      if (import.meta.env.DEV) {
        debugEnvironment();
      }
    } catch (error) {
      console.warn('Debug environment check failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HubSpotProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path='/' element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path='contacts' element={<Contacts />} />
                    <Route
                      path='contacts-viewer'
                      element={<ContactsViewer />}
                    />
                    <Route
                      path='latest-created'
                      element={
                        <ErrorBoundary>
                          <LatestCreated />
                        </ErrorBoundary>
                      }
                    />
                    <Route path='latest-updated' element={<LatestUpdated />} />
                    <Route path='sync-monitor' element={<SyncMonitor />} />
                    <Route path='logs' element={<Logs />} />
                    <Route path='settings' element={<Settings />} />
                    <Route path='supabase-database' element={<SupabaseDatabase />} />
                    <Route path='hubspot-contacts' element={<HubSpotContacts />} />
                    <Route path='email-verification-sync' element={
                      <ErrorBoundary>
                        <EmailVerificationSyncPage />
                      </ErrorBoundary>
                    } />
                    <Route path='email-verification-data-display' element={
                      <ErrorBoundary>
                        <EmailVerificationDataDisplayPage />
                      </ErrorBoundary>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  </Route>
                  <Route path='/auth/hubspot/callback' element={<HubSpotCallback />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </HubSpotProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
