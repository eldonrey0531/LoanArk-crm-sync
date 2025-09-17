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
import HubSpotDatabase from './pages/HubSpotDatabase';
import HubSpotContacts from './pages/HubSpotContacts';

const queryClient = new QueryClient();

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
                    <Route path='hubspot-database' element={<HubSpotDatabase />} />
                    <Route path='hubspot-contacts' element={<HubSpotContacts />} />
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
