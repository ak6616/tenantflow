"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Mail, Phone, Building, Loader2 } from "lucide-react";
import { leadsApi } from "@/lib/api";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.list(1, 100).then((data) => {
      setContacts(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <Button size="sm">
          <Plus size={16} />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No contacts yet. Create leads to see them here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={contact.name} className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{contact.name}</h3>
                    <Badge variant="default" className="mt-1">{contact.status}</Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {contact.company && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building size={12} />
                      <span>{contact.company}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={12} />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>

                {contact.source && (
                  <div className="mt-3">
                    <Badge variant="secondary">{contact.source}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
