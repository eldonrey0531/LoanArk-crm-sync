// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Mail, Calendar } from 'lucide-react';

export default function LatestUpdated() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestUpdated = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('lastmodifieddate', { ascending: false })
          .limit(10);

        if (error) throw error;
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching updated contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUpdated();
  }, []);

  const getTimeSinceUpdate = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diff = now.getTime() - updated.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading recently updated contacts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Recently Updated Contacts</h1>

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              No recently updated contacts
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
                  <div className="flex gap-2">
                    {contact.lastmodifieddate && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeSinceUpdate(contact.lastmodifieddate)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {contact.client_type_prospects || 'Contact'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email || 'No email'}</span>
                    {contact.email_verification_status && (
                      <Badge variant={
                        contact.email_verification_status === 'valid' ? 'success' : 'secondary'
                      } className="text-xs">
                        {contact.email_verification_status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{contact.phone || contact.mobilephone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Last updated: {contact.lastmodifieddate
                        ? new Date(contact.lastmodifieddate).toLocaleString()
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
