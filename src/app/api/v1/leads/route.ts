import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, sql, and, count } from "drizzle-orm";
import { db } from "@/db";
import { leads, tenants } from "@/db/schema";
import { withAuth, parsePagination } from "@/lib/validate";
import { success, error } from "@/lib/response";
import { getPlanLimits } from "@/lib/plans";

const createLeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.enum(["new", "contacted", "qualified", "lost"]).optional(),
  ownerId: z.string().uuid().optional(),
});

export const GET = withAuth(async (request, token) => {
  const { page, limit, offset } = parsePagination(request);

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(eq(leads.tenantId, token.tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(leads.createdAt),
    db
      .select({ total: count() })
      .from(leads)
      .where(eq(leads.tenantId, token.tenantId)),
  ]);

  return success(data, { page, limit, totalCount: total });
});

export const POST = withAuth(async (request, token) => {
  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  // Check plan limits
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, token.tenantId)).limit(1);
  const limits = getPlanLimits(tenant?.plan || "free");
  const [{ total }] = await db.select({ total: count() }).from(leads).where(eq(leads.tenantId, token.tenantId));
  if (total >= limits.leads) {
    return error("PLAN_LIMIT", `Lead limit reached for ${tenant?.plan || "free"} plan (${limits.leads})`, 403);
  }

  const [lead] = await db
    .insert(leads)
    .values({ ...parsed.data, tenantId: token.tenantId })
    .returning();

  return success(lead);
});
