import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  ArrowUpDown,
  ArrowRight,
  Eye,
  Edit,
  RefreshCw,
  Plus,
  UserCheck,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock contact data
const hubspotContacts = [
  {
    id: "hs-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    clientType: "VIP Client",
    lastModified: "2024-01-15 10:30:00",
    inSupabase: true,
    syncStatus: "synced"
  },
  {
    id: "hs-002", 
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 234-5678",
    clientType: "Prospect",
    lastModified: "2024-01-15 09:15:00",
    inSupabase: false,
    syncStatus: "pending"
  },
  {
    id: "hs-003",
    name: "Mike Wilson", 
    email: "mike.wilson@example.com",
    phone: "+1 (555) 345-6789",
    clientType: "Lead",
    lastModified: "2024-01-15 08:45:00",
    inSupabase: true,
    syncStatus: "conflict"
  }
];

const supabaseContacts = [
  {
    id: "sb-001",
    hsObjectId: "hs-001",
    name: "John Smith",
    email: "john.smith@example.com", 
    phone: "+1 (555) 123-4567",
    clientType: "VIP Client",
    lastModified: "2024-01-15 10:30:00",
    syncStatus: "synced"
  },
  {
    id: "sb-003",
    hsObjectId: "hs-003",
    name: "Michael Wilson", // Different name - conflict!
    email: "mike.wilson@example.com",
    phone: "+1 (555) 345-6789", 
    clientType: "VIP Client", // Different type - conflict!
    lastModified: "2024-01-15 07:30:00",
    syncStatus: "conflict"
  },
  {
    id: "sb-004",
    hsObjectId: null,
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "+1 (555) 456-7890",
    clientType: "Lead",
    lastModified: "2024-01-15 11:00:00",
    syncStatus: "local_only"
  }
];

function ContactTable({ contacts, type, onSync }: { 
  contacts: any[], 
  type: 'hubspot' | 'supabase',
  onSync: (id: string) => void 
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Client Type</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Badge 
                  variant={
                    contact.syncStatus === 'synced' ? 'secondary' :
                    contact.syncStatus === 'conflict' ? 'destructive' :
                    contact.syncStatus === 'pending' ? 'secondary' :
                    'outline'
                  }
                  className={
                    contact.syncStatus === 'synced' ? 'bg-success-muted text-success' :
                    contact.syncStatus === 'conflict' ? 'bg-destructive text-destructive-foreground' :
                    contact.syncStatus === 'pending' ? 'bg-warning-muted text-warning' :
                    'bg-muted text-muted-foreground'
                  }
                >
                  {contact.syncStatus === 'synced' ? 'Synced' :
                   contact.syncStatus === 'conflict' ? 'Conflict' :
                   contact.syncStatus === 'pending' ? 'Pending' :
                   'Local Only'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  contact.clientType === 'VIP Client' ? 'border-primary text-primary' :
                  contact.clientType === 'Prospect' ? 'border-warning text-warning' :
                  'border-muted-foreground text-muted-foreground'
                }>
                  {contact.clientType}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {contact.lastModified}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {type === 'supabase' && (
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSync(contact.id)}
                    disabled={contact.syncStatus === 'synced'}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleSync = (id: string) => {
    console.log("Syncing contact:", id);
    // Will implement actual sync logic later
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground mt-1">Manage contacts across HubSpot and Supabase</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HubSpot Contacts</CardTitle>
            <Users className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{hubspotContacts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase Contacts</CardTitle>
            <Users className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{supabaseContacts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <UserCheck className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search contacts..." 
                  className="pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vip">VIP Clients</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Tables */}
      <Tabs defaultValue="hubspot" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hubspot">HubSpot Contacts</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Contacts</TabsTrigger>
          <TabsTrigger value="comparison">Comparison View</TabsTrigger>
        </TabsList>

        <TabsContent value="hubspot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HubSpot Contacts (Read-Only)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Live data from HubSpot. Use "Pull to Supabase" to sync individual contacts.
              </p>
            </CardHeader>
            <CardContent>
              <ContactTable contacts={hubspotContacts} type="hubspot" onSync={handleSync} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Contacts (Editable)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Local database contacts. Changes can be pushed back to HubSpot.
              </p>
            </CardHeader>
            <CardContent>
              <ContactTable contacts={supabaseContacts} type="supabase" onSync={handleSync} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Side-by-Side Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare contacts between systems and resolve conflicts.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Comparison View</h3>
                <p className="text-muted-foreground mb-4">
                  Select contacts from the other tabs to compare them here.
                </p>
                <Button variant="outline">
                  View All Conflicts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}