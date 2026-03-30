"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, TrendingUp, Clock, Loader2 } from "lucide-react";
import { reportsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.summary("30d").then((data) => {
      setSummary(data);
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

  const deals = summary?.deals || {};
  const leadStats = summary?.leads || {};
  const activityStats = summary?.activities || {};
  const pipeline = summary?.pipeline || [];

  const winRate = deals.totalDeals > 0
    ? Math.round((deals.wonDeals / deals.totalDeals) * 100)
    : 0;

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(Number(deals.totalRevenue || 0)), icon: DollarSign },
    { label: "Win Rate", value: `${winRate}%`, icon: Target },
    { label: "Avg Deal Size", value: formatCurrency(Number(deals.avgDealValue || 0)), icon: TrendingUp },
    { label: "Total Leads", value: String(leadStats.totalLeads || 0), icon: Clock },
    { label: "Deals Won", value: String(deals.wonDeals || 0), icon: TrendingUp },
    { label: "Deals Lost", value: String(deals.lostDeals || 0), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground">Last 30 days overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <kpi.icon size={16} className="text-muted-foreground" />
              <p className="mt-2 text-xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline data available.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs font-medium uppercase text-muted-foreground">Stage</th>
                    <th className="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Deals</th>
                    <th className="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((stage: any) => (
                    <tr key={stage.stageId || stage.stageName} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm font-medium">{stage.stageName || "Unknown"}</td>
                      <td className="py-3 text-right text-sm">{stage.count}</td>
                      <td className="py-3 text-right text-sm font-medium">
                        {formatCurrency(Number(stage.totalValue || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Activities</span>
                <span className="font-medium">{activityStats.totalActivities || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Calls</span>
                <span className="font-medium">{activityStats.calls || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Emails</span>
                <span className="font-medium">{activityStats.emails || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meetings</span>
                <span className="font-medium">{activityStats.meetings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
