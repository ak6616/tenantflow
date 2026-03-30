import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { withAuth, parsePagination } from "@/lib/validate";
import { success, error } from "@/lib/response";

const createActivitySchema = z.object({
  type: z.enum(["note", "call", "email", "meeting"]),
  body: z.string().optional(),
  dealId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

export const GET = withAuth(async (request, token) => {
  const { page, limit, offset } = parsePagination(request);
  const url = new URL(request.url);
  const dealId = url.searchParams.get("dealId");
  const leadId = url.searchParams.get("leadId");

  const conditions = [eq(activities.tenantId, token.tenantId)];
  if (dealId) conditions.push(eq(activities.dealId, dealId));
  if (leadId) conditions.push(eq(activities.leadId, leadId));

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(activities.createdAt),
    db
      .select({ total: count() })
      .from(activities)
      .where(whereClause),
  ]);

  return success(data, { page, limit, totalCount: total });
});

export const POST = withAuth(async (request, token) => {
  const body = await request.json();
  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const { scheduledAt, completedAt, ...rest } = parsed.data;
  const [activity] = await db
    .insert(activities)
    .values({
      ...rest,
      tenantId: token.tenantId,
      userId: token.userId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
    })
    .returning();

  return success(activity);
});
