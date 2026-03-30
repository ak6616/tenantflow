"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus, Filter, Download, MoreHorizontal, Mail, Phone, Loader2 } from "lucide-react";
import { leadsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type LeadStatus = "new" | "contacted" | "qualified" | "lost";

const statusVariant: Record<LeadStatus, "default" | "warning" | "success" | "destructive"> = {
  new: "default",
  contacted: "warning",
  qualified: "success",
  lost: "destructive",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    leadsApi.list(1, 100).then((data) => {
      setLeads(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

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
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} />
            Export CSV
          </Button>
          <Button size="sm">
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-(--radius-lg) bg-primary/5 px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button variant="outline" size="sm">Assign</Button>
          <Button variant="outline" size="sm">Change Status</Button>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Name</th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Company</th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Source</th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Created</th>
                <th className="p-4 text-xs font-medium uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    {search ? "No leads match your search." : "No leads yet. Click 'Add Lead' to create one."}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={lead.name} />
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{lead.company || "—"}</td>
                    <td className="p-4">
                      <Badge variant={statusVariant[lead.status as LeadStatus] || "default"}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{lead.source || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {lead.createdAt ? formatDate(lead.createdAt) : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="rounded-(--radius-sm) p-1 text-muted-foreground hover:bg-accent">
                          <Mail size={14} />
                        </button>
                        <button className="rounded-(--radius-sm) p-1 text-muted-foreground hover:bg-accent">
                          <Phone size={14} />
                        </button>
                        <button className="rounded-(--radius-sm) p-1 text-muted-foreground hover:bg-accent">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
