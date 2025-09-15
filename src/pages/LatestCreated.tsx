import { useState } from "react";
import { 
  Users, 
  Search, 
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  Eye,
  Edit,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTop100ByCreated, useHubSpotSync } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function LatestCreated() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: contacts, isLoading, error, refetch } = useTop100ByCreated();
  const hubSpotSync = useHubSpotSync();

  const handleRefresh = () => {
    refetch();
  };

  const handleSync = async () => {
    try {
      await hubSpotSync.mutateAsync();
      toast({ title: "Sync completed", description: "Contacts synchronized from HubSpot." });
      refetch();
    } catch (e) {
      toast({ title: "Sync failed", description: e instanceof Error ? e.message : "An error occurred.", variant: "destructive" });
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading contacts: {error.message}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Latest Created Contacts</h1>
          <p className="text-muted-foreground mt-1">Top 100 most recently created contacts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/latest-updated">
              <ArrowRight className="w-4 h-4 mr-2" />
              Latest Updated
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts (Top 100)</CardTitle>
          <Calendar className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-1">
            {isLoading ? "Loading..." : filteredContacts.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Ordered by creation date (newest first)
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
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
          </div>
        </CardHeader>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contacts sorted by creation date, showing the 100 most recent entries.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms." : "No contacts available. Try syncing from HubSpot."}
              </p>
              <Button onClick={handleSync} disabled={hubSpotSync.isPending}>
                {hubSpotSync.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {hubSpotSync.isPending ? "Syncing..." : "Sync from HubSpot"}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Time Ago</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {[contact.firstname, contact.lastname].filter(Boolean).join(' ') || 'No Name'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.phone || 'No phone'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          new Date().getTime() - new Date(contact.created_at).getTime() < 24 * 60 * 60 * 1000
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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