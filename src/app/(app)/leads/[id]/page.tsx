"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Calendar,
  Loader2,
} from "lucide-react";
import { leadsApi, activitiesApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const activityIcons: Record<string, any> = {
  email: Mail,
  note: MessageSquare,
  call: PhoneCall,
  meeting: Calendar,
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leadData, actData] = await Promise.all([
          leadsApi.get(leadId),
          activitiesApi.list({ leadId, limit: 10 }),
        ]);
        setLead(leadData);
        setActivities(actData || []);
      } catch {
        // lead not found
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Lead not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={lead.name} className="h-14 w-14 text-lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <Badge variant="default">{lead.status}</Badge>
            </div>
            <p className="text-muted-foreground">{lead.company || "No company"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Edit</Button>
          <Button size="sm">
            Convert to Deal
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground" />
                <span className="text-sm">{lead.phone}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span>{lead.source || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{lead.createdAt ? formatDate(lead.createdAt) : "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities logged for this lead.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type] || MessageSquare;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium capitalize">{activity.type}</span>
                          {activity.body && ` — ${activity.body}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.createdAt ? formatDate(activity.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
