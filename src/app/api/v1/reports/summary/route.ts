import { NextRequest } from "next/server";
import { eq, sql, and, gte } from "drizzle-orm";
import { db } from "@/db";
import { deals, leads, activities, pipelineStages } from "@/db/schema";
import { withAuth } from "@/lib/validate";
import { success } from "@/lib/response";

export const GET = withAuth(async (request, token) => {
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30d";
  const days = parseInt(range.replace("d", ""), 10) || 30;

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Run all queries in parallel
  const [dealStats, stageBreakdown, leadStats, activityStats] = await Promise.all([
    // Deal summary
    db
      .select({
        totalDeals: sql<number>`count(*)::int`,
        wonDeals: sql<number>`count(*) filter (where ${deals.status} = 'won')::int`,
        lostDeals: sql<number>`count(*) filter (where ${deals.status} = 'lost')::int`,
        totalRevenue: sql<string>`coalesce(sum(${deals.value}) filter (where ${deals.status} = 'won'), 0)`,
        avgDealValue: sql<string>`coalesce(avg(${deals.value}) filter (where ${deals.status} = 'won'), 0)`,
      })
      .from(deals)
      .where(
        and(eq(deals.tenantId, token.tenantId), gte(deals.createdAt, since))
      ),

    // Deals per stage
    db
      .select({
        stageId: deals.stageId,
        stageName: pipelineStages.name,
        count: sql<number>`count(*)::int`,
        totalValue: sql<string>`coalesce(sum(${deals.value}), 0)`,
      })
      .from(deals)
      .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
      .where(
        and(
          eq(deals.tenantId, token.tenantId),
          gte(deals.createdAt, since),
          eq(deals.status, "open")
        )
      )
      .groupBy(deals.stageId, pipelineStages.name),

    // Lead stats
    db
      .select({
        totalLeads: sql<number>`count(*)::int`,
        newLeads: sql<number>`count(*) filter (where ${leads.status} = 'new')::int`,
        qualifiedLeads: sql<number>`count(*) filter (where ${leads.status} = 'qualified')::int`,
      })
      .from(leads)
      .where(
        and(eq(leads.tenantId, token.tenantId), gte(leads.createdAt, since))
      ),

    // Activity stats
    db
      .select({
        totalActivities: sql<number>`count(*)::int`,
        calls: sql<number>`count(*) filter (where ${activities.type} = 'call')::int`,
        emails: sql<number>`count(*) filter (where ${activities.type} = 'email')::int`,
        meetings: sql<number>`count(*) filter (where ${activities.type} = 'meeting')::int`,
      })
      .from(activities)
      .where(
        and(
          eq(activities.tenantId, token.tenantId),
          gte(activities.createdAt, since)
        )
      ),
  ]);

  return success({
    range: `${days}d`,
    deals: dealStats[0],
    pipeline: stageBreakdown,
    leads: leadStats[0],
    activities: activityStats[0],
  });
});
