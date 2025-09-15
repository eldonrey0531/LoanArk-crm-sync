import { useState } from 'react';
import { Menu, X, Database, Cloud, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gray-900 text-white transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4">
            {sidebarOpen && (
              <span className="text-xl font-semibold">LoanArk CRM</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-gray-800"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <a
              href="/latest"
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gray-800"
            >
              <FileText size={20} />
              {sidebarOpen && <span className="ml-3">Latest Created</span>}
            </a>
            <a
              href="/sync"
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gray-800"
            >
              <Cloud size={20} />
              {sidebarOpen && <span className="ml-3">Sync Status</span>}
            </a>
            <a
              href="/database"
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gray-800"
            >
              <Database size={20} />
              {sidebarOpen && <span className="ml-3">Database</span>}
            </a>
            <a
              href="/settings"
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gray-800"
            >
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
