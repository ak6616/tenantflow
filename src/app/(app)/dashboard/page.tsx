"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { reportsApi, activitiesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, activityData] = await Promise.all([
          reportsApi.summary("30d"),
          activitiesApi.list({ limit: 5 }),
        ]);
        setSummary(summaryData);
        setActivities(activityData || []);
      } catch {
        // Data may be empty for new tenants
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const deals = summary?.deals || {};
  const leadStats = summary?.leads || {};
  const pipelineBreakdown = summary?.pipeline || [];

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(Number(deals.totalRevenue || 0)),
      icon: DollarSign,
    },
    {
      title: "Active Deals",
      value: String(deals.totalDeals || 0),
      icon: TrendingUp,
    },
    {
      title: "New Leads",
      value: String(leadStats.newLeads || 0),
      icon: Users,
    },
    {
      title: "Won Deals",
      value: String(deals.wonDeals || 0),
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here&apos;s your CRM overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <stat.icon size={18} className="text-muted-foreground" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline data yet. Create some deals to get started.</p>
            ) : (
              <div className="space-y-3">
                {pipelineBreakdown.map((stage: any) => {
                  const maxCount = Math.max(...pipelineBreakdown.map((s: any) => s.count), 1);
                  return (
                    <div key={stage.stageId || stage.stageName} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium">{stage.stageName || "Unknown"}</div>
                      <div className="flex-1">
                        <div className="h-6 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(stage.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium">{stage.count}</div>
                      <div className="w-24 text-right text-sm text-muted-foreground">
                        {formatCurrency(Number(stage.totalValue || 0))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Leads</span>
                <span className="font-medium">{leadStats.totalLeads || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qualified Leads</span>
                <span className="font-medium">{leadStats.qualifiedLeads || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deals Won</span>
                <span className="font-medium">{deals.wonDeals || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deals Lost</span>
                <span className="font-medium">{deals.lostDeals || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Deal Value</span>
                <span className="font-medium">{formatCurrency(Number(deals.avgDealValue || 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity. Start by creating leads and logging activities.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm">
                      <span className="font-medium capitalize">{item.type}</span>
                      {item.body && <span className="text-muted-foreground"> — {item.body}</span>}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
