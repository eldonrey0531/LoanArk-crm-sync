import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar, User, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Contact {
  id: string;
  hs_object_id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  mobilephone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  createdate: string | null;
  lastmodifieddate: string | null;
  email_verification_status: string | null;
  client_type_vip_status: string | null;
  client_type_prospects: string | null;
}

export default function LatestCreated() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestContacts = async () => {
    try {
      setLoading(true);

      // Fetch top 100 contacts ordered by createdate (newest first)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('createdate', { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to fetch contacts: ' + error.message);
        return;
      }

      setContacts(data || []);
      toast.success(`Loaded ${data?.length || 0} latest contacts`);
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatestContacts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLatestContacts();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getFullName = (contact: Contact) => {
    const name = [contact.firstname, contact.lastname].filter(Boolean).join(' ');
    return name || 'No Name';
  };

  const getContactPhone = (contact: Contact) => {
    return contact.phone || contact.mobilephone || '-';
  };

  const getContactAddress = (contact: Contact) => {
    const parts = [contact.address, contact.city, contact.state, contact.zip]
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const getStatusBadge = (contact: Contact) => {
    if (contact.client_type_vip_status) {
      return <Badge variant="default" className="bg-purple-600">VIP</Badge>;
    }
    if (contact.client_type_prospects) {
      return <Badge variant="secondary">Prospect</Badge>;
    }
    return <Badge variant="outline">Standard</Badge>;
  };

  const getVerificationBadge = (status: string | null) => {
    if (!status) return null;

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'verified': 'default',
      'unverified': 'destructive',
      'pending': 'secondary'
    };

    return (
      <Badge variant={variants[status.toLowerCase()] || 'outline'} className="text-xs">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Latest Created Contacts
          </h1>
          <p className="text-muted-foreground mt-1">
            Showing the 100 most recently created contacts from Supabase
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Email</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.email).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Phone</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.phone || c.mobilephone).length}
                </p>
              </div>
              <Phone className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Clients</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.client_type_vip_status).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <CardDescription>
            Sorted by creation date (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contacts found in the database.</p>
              <p className="text-sm mt-2">Run a sync to import contacts from HubSpot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Last Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact, index) => (
                    <TableRow key={contact.id || contact.hs_object_id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getFullName(contact)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contact.email || '-'}</span>
                          {getVerificationBadge(contact.email_verification_status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getContactPhone(contact)}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={getContactAddress(contact)}>
                        {getContactAddress(contact)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contact)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contact.createdate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contact.lastmodifieddate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
