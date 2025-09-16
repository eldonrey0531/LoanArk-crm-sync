import { useState } from 'react';
import {
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for audit logs
const auditLogs = [
  {
    id: 1,
    timestamp: '2024-01-20 14:30:25',
    user: 'system',
    action: 'update',
    contact: 'John Smith',
    contactId: 'hs_001',
    changedFields: ['email', 'phone'],
    oldValues: { email: 'john@old.com', phone: '555-0100' },
    newValues: { email: 'john@new.com', phone: '555-0200' },
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2024-01-20 14:28:15',
    user: 'admin@loanark.com',
    action: 'create',
    contact: 'Sarah Johnson',
    contactId: 'hs_002',
    changedFields: ['firstname', 'lastname', 'email'],
    oldValues: {},
    newValues: {
      firstname: 'Sarah',
      lastname: 'Johnson',
      email: 'sarah@example.com',
    },
    status: 'success',
  },
  {
    id: 3,
    timestamp: '2024-01-20 14:25:10',
    user: 'system',
    action: 'sync',
    contact: 'Mike Wilson',
    contactId: 'hs_003',
    changedFields: ['client_type_vip_status'],
    oldValues: { client_type_vip_status: 'No' },
    newValues: { client_type_vip_status: 'Yes' },
    status: 'failed',
  },
];

// Mock data for error logs
const errorLogs = [
  {
    id: 1,
    timestamp: '2024-01-20 14:25:10',
    type: 'Sync Error',
    contact: 'Mike Wilson',
    contactId: 'hs_003',
    error: 'HubSpot API rate limit exceeded',
    details: '429 Too Many Requests - Rate limit exceeded',
    retryable: true,
  },
  {
    id: 2,
    timestamp: '2024-01-20 13:15:42',
    type: 'Validation Error',
    contact: 'Invalid Contact',
    contactId: 'hs_004',
    error: 'Invalid email format',
    details: "Email 'not-an-email' is not a valid email address",
    retryable: false,
  },
];

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='w-4 h-4 text-success' />;
      case 'failed':
        return <XCircle className='w-4 h-4 text-destructive' />;
      default:
        return <Clock className='w-4 h-4 text-warning' />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'sync':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>
            Logs & Audit Trail
          </h1>
          <p className='text-muted-foreground mt-1'>
            Complete activity and error tracking
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='sm'>
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='w-4 h-4 mr-2' />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='flex-1 min-w-[300px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  placeholder='Search by contact name, user, or action...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Action' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Actions</SelectItem>
                <SelectItem value='create'>Create</SelectItem>
                <SelectItem value='update'>Update</SelectItem>
                <SelectItem value='delete'>Delete</SelectItem>
                <SelectItem value='sync'>Sync</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='success'>Success</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Filter className='w-4 h-4 mr-2' />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='audit' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='audit'>Activity Log</TabsTrigger>
          <TabsTrigger value='errors'>Error Log</TabsTrigger>
        </TabsList>

        {/* Activity Log */}
        <TabsContent value='audit'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Clock className='w-5 h-5 mr-2' />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className='flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex-shrink-0 mt-1'>
                      {getStatusIcon(log.status)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <span className='font-medium text-foreground'>
                            {log.contact}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            #{log.contactId}
                          </span>
                        </div>
                        <span className='text-sm text-muted-foreground'>
                          {log.timestamp}
                        </span>
                      </div>
                      <div className='mt-2 flex items-center space-x-2'>
                        <User className='w-4 h-4 text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                          {log.user === 'system' ? 'System' : log.user}
                        </span>
                      </div>
                      {log.changedFields.length > 0 && (
                        <div className='mt-2'>
                          <span className='text-sm font-medium text-foreground'>
                            Changed fields:{' '}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {log.changedFields.join(', ')}
                          </span>
                        </div>
                      )}
                      {log.action === 'update' && (
                        <div className='mt-2 text-sm'>
                          {Object.entries(log.newValues).map(
                            ([field, newValue]) => (
                              <div
                                key={field}
                                className='text-muted-foreground'
                              >
                                <span className='font-mono'>{field}:</span>{' '}
                                <span className='text-destructive line-through'>
                                  {log.oldValues[field]}
                                </span>{' '}
                                →{' '}
                                <span className='text-success'>{newValue}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Log */}
        <TabsContent value='errors'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <AlertTriangle className='w-5 h-5 mr-2 text-warning' />
                Error Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {errorLogs.map(error => (
                  <div
                    key={error.id}
                    className='p-4 border border-destructive/20 bg-destructive/5 rounded-lg'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <XCircle className='w-4 h-4 text-destructive' />
                          <Badge variant='destructive'>{error.type}</Badge>
                          <span className='font-medium text-foreground'>
                            {error.contact}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            #{error.contactId}
                          </span>
                        </div>
                        <div className='text-sm text-foreground font-medium mb-1'>
                          {error.error}
                        </div>
                        <div className='text-sm text-muted-foreground mb-2'>
                          {error.details}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {error.timestamp}
                        </div>
                      </div>
                      {error.retryable && (
                        <Button variant='outline' size='sm'>
                          <RefreshCw className='w-4 h-4 mr-2' />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
