import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, Mail } from 'lucide-react';

export default function LatestCreated() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('createdate', { ascending: false })
          .limit(10);

        if (error) throw error;
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching latest contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestContacts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading latest contacts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Latest Created Contacts</h1>

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              No contacts found
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {contact.firstname} {contact.lastname}
                  </CardTitle>
                  <Badge variant="outline">
                    {contact.client_type_vip_status || 'Contact'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{contact.phone || contact.mobilephone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>
                      Created: {contact.createdate
                        ? new Date(contact.createdate).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
