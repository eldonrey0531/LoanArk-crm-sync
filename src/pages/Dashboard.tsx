import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useContacts, useContactStats, useSyncLogs, useHubSpotSync } from "@/hooks/useContacts";
import { toast } from "@/hooks/use-toast";

// Mock data
const syncData = [
  { time: "00:00", hubspot: 1247, supabase: 1245 },
  { time: "04:00", hubspot: 1248, supabase: 1248 },
  { time: "08:00", hubspot: 1251, supabase: 1250 },
  { time: "12:00", hubspot: 1253, supabase: 1253 },
  { time: "16:00", hubspot: 1255, supabase: 1254 },
  { time: "20:00", hubspot: 1257, supabase: 1257 }
];

const clientTypeData = [
  { name: "VIP Clients", value: 234, color: "hsl(var(--chart-1))" },
  { name: "Prospects", value: 567, color: "hsl(var(--chart-2))" },
  { name: "Leads", value: 456, color: "hsl(var(--chart-3))" }
];

const recentActivity = [
  { time: "2 min ago", action: "Contact synced", contact: "John Smith", status: "success" },
  { time: "5 min ago", action: "Manual sync triggered", contact: "Batch (45 contacts)", status: "success" },
  { time: "12 min ago", action: "Contact updated", contact: "Sarah Johnson", status: "success" },
  { time: "18 min ago", action: "Sync failed", contact: "Mike Wilson", status: "error" },
  { time: "25 min ago", action: "Contact created", contact: "Emma Davis", status: "success" }
];

export default function Dashboard() {
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: stats, isLoading: statsLoading } = useContactStats();
  const { data: syncLogs, isLoading: logsLoading } = useSyncLogs();
  const hubSpotSync = useHubSpotSync();

  const handleManualSync = async () => {
    try {
      toast({
        title: "Starting HubSpot sync...",
        description: "This may take a few moments.",
      });
      
      await hubSpotSync.mutateAsync();
      
      toast({
        title: "Sync completed successfully!",
        description: "Contacts have been updated from HubSpot.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "An error occurred during sync.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time contact management and sync monitoring</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button 
            size="sm" 
            onClick={handleManualSync}
            disabled={hubSpotSync.isPending}
          >
            <Database className={`w-4 h-4 mr-2 ${hubSpotSync.isPending ? 'animate-spin' : ''}`} />
            {hubSpotSync.isPending ? 'Syncing...' : 'Manual Sync'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "Loading..." : stats?.totalContacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">
                {stats?.withEmail || 0}
              </span> with email addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "Loading..." : stats?.verifiedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">
                {stats?.pendingCount || 0}
              </span> pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Online</div>
            <p className="text-xs text-muted-foreground">
              Last sync: 5 min ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">3</div>
            <p className="text-xs text-muted-foreground">
              In last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Count Comparison</CardTitle>
            <p className="text-sm text-muted-foreground">HubSpot vs Supabase over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={syncData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="hubspot" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="HubSpot"
                />
                <Line 
                  type="monotone" 
                  dataKey="supabase" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Supabase"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown by client type</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {clientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest sync operations and contact updates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success' : 'bg-destructive'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.contact}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">HubSpot API</span>
              <Badge variant="secondary" className="bg-success-muted text-success">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Supabase DB</span>
              <Badge variant="secondary" className="bg-success-muted text-success">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Sync</span>
              <Badge variant="secondary" className="bg-success-muted text-success">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Quality</span>
              <Badge variant="secondary" className="bg-warning-muted text-warning">
                3 Issues
              </Badge>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Next Sync In</p>
              <div className="text-2xl font-mono font-bold text-primary">02:34:12</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}