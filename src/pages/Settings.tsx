import { useState } from 'react';
import {
  Key,
  Clock,
  Shield,
  Database,
  Webhook,
  Mail,
  MessageSquare,
  TestTube,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const [hubspotApiKey, setHubspotApiKey] = useState('');
  const [syncFrequency, setSyncFrequency] = useState('12h');
  const [autoSync, setAutoSync] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('admin@loanark.com');

  const [connectionStatus, setConnectionStatus] = useState({
    hubspot: 'connected',
    supabase: 'connected',
    slack: 'disconnected',
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'testing':
        return <Clock className="w-4 h-4 text-warning animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success text-success-foreground">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const testConnection = async (service: string) => {
    setConnectionStatus((prev) => ({ ...prev, [service]: 'testing' }));
    // Simulate API test
    setTimeout(() => {
      setConnectionStatus((prev) => ({ ...prev, [service]: 'connected' }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuration & Settings</h1>
          <p className="text-muted-foreground mt-1">Manage integrations and sync preferences</p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="grid gap-6">
            {/* HubSpot Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    HubSpot Configuration
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.hubspot)}
                    {getStatusBadge(connectionStatus.hubspot)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hubspot-api-key">API Key</Label>
                  <Input
                    id="hubspot-api-key"
                    type="password"
                    placeholder="Enter HubSpot Private App Token"
                    value={hubspotApiKey}
                    onChange={(e) => setHubspotApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a private app in HubSpot and generate an access token
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection('hubspot')}
                    disabled={connectionStatus.hubspot === 'testing'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="outline">View Rate Limits</Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Field Mapping Configuration</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">HubSpot Email → Supabase email</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">HubSpot First Name → Supabase firstname</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">HubSpot Phone → Supabase phone</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Configure Field Mapping
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Supabase Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Supabase Configuration
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.supabase)}
                    {getStatusBadge(connectionStatus.supabase)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Project URL</Label>
                    <div className="text-sm text-muted-foreground">
                      {import.meta.env.VITE_SUPABASE_URL ||
                        'https://opwagkvnbgxjkcvauyfq.supabase.co'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Database Status</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">Online</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Database Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sync Settings */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Synchronization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync contacts between HubSpot and Supabase
                  </p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div>
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Every Hour</SelectItem>
                    <SelectItem value="6h">Every 6 Hours</SelectItem>
                    <SelectItem value="12h">Every 12 Hours</SelectItem>
                    <SelectItem value="24h">Daily</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Note: Actual syncing runs via GitHub Actions workflow
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">Conflict Resolution Rules</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Data Conflicts</div>
                      <div className="text-sm text-muted-foreground">
                        When same contact exists in both systems
                      </div>
                    </div>
                    <Select defaultValue="hubspot-wins">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hubspot-wins">HubSpot Wins</SelectItem>
                        <SelectItem value="supabase-wins">Supabase Wins</SelectItem>
                        <SelectItem value="manual">Manual Review</SelectItem>
                        <SelectItem value="newer-wins">Newer Wins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Fields to Sync</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Email', 'First Name', 'Last Name', 'Phone', 'Company', 'VIP Status'].map(
                    (field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="text-sm">{field}</Label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about sync failures and errors
                    </p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>

                <div>
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Alert Types</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { name: 'Sync Failures', enabled: true },
                      { name: 'Rate Limit Exceeded', enabled: true },
                      { name: 'Data Conflicts', enabled: false },
                      { name: 'Daily Sync Summary', enabled: true },
                    ].map((alert) => (
                      <div key={alert.name} className="flex items-center justify-between">
                        <Label className="text-sm">{alert.name}</Label>
                        <Switch defaultChecked={alert.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Slack Integration
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.slack)}
                    {getStatusBadge(connectionStatus.slack)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => testConnection('slack')}
                  disabled={connectionStatus.slack === 'testing'}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Slack Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="w-5 h-5 mr-2" />
                  Webhook Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-app.com/webhook/sync-events"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive real-time sync events at this endpoint
                  </p>
                </div>
                <div>
                  <Label className="text-base font-medium">Events to Send</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      'Sync Started',
                      'Sync Completed',
                      'Sync Failed',
                      'Contact Created',
                      'Contact Updated',
                    ].map((event) => (
                      <div key={event} className="flex items-center justify-between">
                        <Label className="text-sm">{event}</Label>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">API Key Management</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">HubSpot API Key</div>
                        <div className="text-sm text-muted-foreground">Last rotated: Never</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Rotate Key
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Access Control</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Require 2FA for settings changes</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Log all configuration changes</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable IP restrictions</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                  <Textarea
                    id="allowed-ips"
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    One IP address or CIDR block per line. Leave empty to allow all IPs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
