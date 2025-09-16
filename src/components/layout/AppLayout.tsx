import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  FileText,
  RefreshCw,
  Activity,
  FileSearch,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Latest Created', href: '/latest-created', icon: FileText },
  { name: 'Latest Updated', href: '/latest-updated', icon: RefreshCw },
  { name: 'Sync Monitor', href: '/sync-monitor', icon: Activity },
  { name: 'Logs & Audit', href: '/logs', icon: FileSearch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out border-r border-white/10',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && <span className="text-xl font-semibold">LoanArk CRM</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn('text-white hover:bg-gray-800', !sidebarOpen && 'mx-auto')}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg px-2 py-2 transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  !sidebarOpen && 'justify-center'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className={cn('flex-shrink-0', sidebarOpen ? 'w-5 h-5 mr-3' : 'w-5 h-5')} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="border-t border-gray-800 p-4 mt-auto">
            <div className="text-xs text-gray-400">
              <div>Version 1.0.0</div>
              <div>© 2025 LoanArk</div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area - adjusts based on sidebar state */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
        )}
      >
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
