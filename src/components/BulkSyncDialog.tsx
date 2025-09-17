// src/components/BulkSyncDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SupabaseContact } from '@/types/emailVerification';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface BulkSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: SupabaseContact[];
  onSync: (selectedContacts: SupabaseContact[]) => Promise<void>;
}

/**
 * Dialog component for bulk sync operations
 */
export function BulkSyncDialog({
  open,
  onOpenChange,
  contacts,
  onSync
}: BulkSyncDialogProps) {
  const [selectedContacts, setSelectedContacts] = useState<SupabaseContact[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedContacts(contacts);
      setProgress(0);
      setCompleted(0);
      setErrors([]);
    }
  }, [open, contacts]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(contacts);
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contact: SupabaseContact, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    }
  };

  const handleSync = async () => {
    if (selectedContacts.length === 0) return;

    setIsSyncing(true);
    setProgress(0);
    setCompleted(0);
    setErrors([]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      await onSync(selectedContacts);

      clearInterval(progressInterval);
      setProgress(100);
      setCompleted(selectedContacts.length);

      // Close dialog after successful sync
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
    } finally {
      setIsSyncing(false);
    }
  };

  const getVerificationStatusColor = (status: string | null) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bulk Email Verification Sync</DialogTitle>
          <DialogDescription>
            Select contacts to sync their email verification status from Supabase to HubSpot.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 overflow-hidden">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedContacts.length === contacts.length}
                onCheckedChange={handleSelectAll}
                disabled={isSyncing}
              />
              <span className="text-sm">
                Select All ({contacts.length} contacts)
              </span>
            </div>
            <Badge variant="outline">
              {selectedContacts.length} selected
            </Badge>
          </div>

          {/* Progress Bar */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing contacts...</span>
                <span>{completed}/{selectedContacts.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Success Message */}
          {!isSyncing && progress === 100 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully synced {completed} contacts!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Contacts List */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <div className="p-4 space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedContacts.some(c => c.id === contact.id)}
                      onCheckedChange={(checked) =>
                        handleSelectContact(contact, checked as boolean)
                      }
                      disabled={isSyncing}
                    />
                    <div>
                      <div className="font-medium">
                        {contact.firstname} {contact.lastname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.email}
                      </div>
                    </div>
                  </div>
                  <Badge className={getVerificationStatusColor(contact.email_verification_status)}>
                    {contact.email_verification_status || 'unknown'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSyncing}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={selectedContacts.length === 0 || isSyncing}
          >
            {isSyncing ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Sync {selectedContacts.length} Contacts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}