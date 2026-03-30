"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Tab = "profile" | "team" | "integrations";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Tenant Profile" },
  { id: "team", label: "Team Members" },
  { id: "integrations", label: "Integrations" },
];

const integrations = [
  { name: "Gmail", description: "Send and track emails", connected: false },
  { name: "Outlook", description: "Calendar and email sync", connected: false },
  { name: "Slack", description: "Notifications and updates", connected: false },
  { name: "Zapier", description: "Automate workflows", connected: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { user, tenant } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your tenant configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-(--radius-md) px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Tenant Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-(--radius-lg) bg-primary/10 text-xl font-bold text-primary">
                    {(tenant?.name || "T").slice(0, 2).toUpperCase()}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload size={14} />
                    Upload Logo
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input defaultValue={tenant?.name || ""} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input defaultValue={tenant?.slug || ""} className="mt-1" readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <Input defaultValue={tenant?.plan || "free"} className="mt-1" readOnly />
                  </div>
                </div>
                <Button size="sm">Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "team" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button size="sm">
                  <Plus size={16} />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                {user ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 text-xs font-medium uppercase text-muted-foreground">Member</th>
                        <th className="pb-3 text-xs font-medium uppercase text-muted-foreground">Role</th>
                        <th className="pb-3 text-xs font-medium uppercase text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} />
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="default" className="capitalize">{user.role}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations.map((int) => (
                  <div
                    key={int.name}
                    className="flex items-center justify-between rounded-(--radius-lg) border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-md) bg-muted text-sm font-bold text-muted-foreground">
                        {int.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{int.name}</p>
                        <p className="text-xs text-muted-foreground">{int.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={int.connected ? "outline" : "default"}
                      size="sm"
                    >
                      {int.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
