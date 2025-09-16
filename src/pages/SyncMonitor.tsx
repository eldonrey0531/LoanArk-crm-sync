import { useState } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Timer,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Mock sync history data
const syncHistory = [
  {
    id: 'sync-001',
    timestamp: '2024-01-15 14:30:00',
    direction: 'HubSpot → Supabase',
    status: 'success',
    recordsProcessed: 45,
    recordsUpdated: 12,
    recordsCreated: 3,
    recordsFailed: 0,
    duration: '00:02:34',
  },
  {
    id: 'sync-002',
    timestamp: '2024-01-15 02:30:00',
    direction: 'Supabase → HubSpot',
    status: 'partial',
    recordsProcessed: 23,
    recordsUpdated: 18,
    recordsCreated: 2,
    recordsFailed: 3,
    duration: '00:01:45',
  },
  {
    id: 'sync-003',
    timestamp: '2024-01-14 14:30:00',
    direction: 'HubSpot → Supabase',
    status: 'failed',
    recordsProcessed: 67,
    recordsUpdated: 0,
    recordsCreated: 0,
    recordsFailed: 67,
    duration: '00:00:12',
  },
];

const syncMetrics = [
  { time: '00:00', synced: 1245, failed: 2 },
  { time: '04:00', synced: 1248, failed: 1 },
  { time: '08:00', synced: 1250, failed: 3 },
  { time: '12:00', synced: 1253, failed: 1 },
  { time: '16:00', synced: 1255, failed: 0 },
  { time: '20:00', synced: 1257, failed: 1 },
];

export default function SyncMonitor() {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    // Simulate sync progress
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setCurrentProgress(0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='w-4 h-4 text-success' />;
      case 'partial':
        return <AlertTriangle className='w-4 h-4 text-warning' />;
      case 'failed':
        return <XCircle className='w-4 h-4 text-destructive' />;
      default:
        return <Clock className='w-4 h-4 text-muted-foreground' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-3xl font-bold'>Sync Monitor</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time synchronization monitoring and control
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='w-4 h-4 mr-2' />
            Export Logs
          </Button>
          <Button
            variant={syncEnabled ? 'destructive' : 'default'}
            size='sm'
            onClick={() => setSyncEnabled(!syncEnabled)}
          >
            {syncEnabled ? (
              <>
                <Pause className='w-4 h-4 mr-2' />
                Pause Sync
              </>
            ) : (
              <>
                <Play className='w-4 h-4 mr-2' />
                Resume Sync
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sync Status Panel */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Activity className='w-5 h-5' />
              <span>Current Sync Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSyncing
                      ? 'bg-warning animate-pulse'
                      : syncEnabled
                        ? 'bg-success'
                        : 'bg-muted-foreground'
                  }`}
                />
                <span className='font-medium'>
                  {isSyncing ? 'Syncing...' : syncEnabled ? 'Ready' : 'Paused'}
                </span>
              </div>
              <Badge
                variant={syncEnabled ? 'secondary' : 'outline'}
                className={syncEnabled ? 'bg-success-muted text-success' : ''}
              >
                {syncEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {isSyncing && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Progress</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className='w-full' />
              </div>
            )}

            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
              <div>
                <p className='text-sm text-muted-foreground'>Last Sync</p>
                <p className='font-medium'>5 minutes ago</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Next Sync</p>
                <p className='font-medium'>02:34:12</p>
              </div>
            </div>

            <Button
              className='w-full'
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <RotateCw
                className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`}
              />
              Manual Sync
            </Button>
          </CardContent>
        </Card>

        {/* Sync Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <TrendingUp className='w-5 h-5' />
              <span>Sync Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-success'>1,257</p>
                <p className='text-xs text-muted-foreground'>
                  Records Synced Today
                </p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-warning'>8</p>
                <p className='text-xs text-muted-foreground'>Failed Records</p>
              </div>
            </div>

            <ResponsiveContainer width='100%' height={120}>
              <LineChart data={syncMetrics}>
                <XAxis dataKey='time' hide />
                <YAxis hide />
                <Line
                  type='monotone'
                  dataKey='synced'
                  stroke='hsl(var(--success))'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='failed'
                  stroke='hsl(var(--warning))'
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Success Rate: 99.4%</span>
              <span>Avg Duration: 2m 15s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Database className='w-5 h-5' />
            <span>System Health Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
              <div>
                <p className='font-medium'>HubSpot API</p>
                <p className='text-xs text-muted-foreground'>
                  Rate Limit: 85/100
                </p>
              </div>
              <CheckCircle className='w-5 h-5 text-success' />
            </div>
            <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
              <div>
                <p className='font-medium'>Supabase DB</p>
                <p className='text-xs text-muted-foreground'>Response: 45ms</p>
              </div>
              <CheckCircle className='w-5 h-5 text-success' />
            </div>
            <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
              <div>
                <p className='font-medium'>GitHub Actions</p>
                <p className='text-xs text-muted-foreground'>
                  Workflow: Active
                </p>
              </div>
              <CheckCircle className='w-5 h-5 text-success' />
            </div>
            <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
              <div>
                <p className='font-medium'>Data Quality</p>
                <p className='text-xs text-muted-foreground'>Issues: 3 Found</p>
              </div>
              <AlertTriangle className='w-5 h-5 text-warning' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync History Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Clock className='w-5 h-5' />
            <span>Sync History</span>
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Last 100 synchronization operations
          </p>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncHistory.map(sync => (
                  <TableRow key={sync.id}>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(sync.status)}
                        <Badge
                          variant='outline'
                          className={
                            sync.status === 'success'
                              ? 'border-success text-success'
                              : sync.status === 'partial'
                                ? 'border-warning text-warning'
                                : 'border-destructive text-destructive'
                          }
                        >
                          {sync.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>
                      {sync.timestamp}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{sync.direction}</Badge>
                    </TableCell>
                    <TableCell>{sync.recordsProcessed}</TableCell>
                    <TableCell className='text-success'>
                      {sync.recordsUpdated}
                    </TableCell>
                    <TableCell className='text-primary'>
                      {sync.recordsCreated}
                    </TableCell>
                    <TableCell className='text-destructive'>
                      {sync.recordsFailed}
                    </TableCell>
                    <TableCell className='font-mono text-sm'>
                      {sync.duration}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button variant='ghost' size='sm'>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
