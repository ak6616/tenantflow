import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { withAuth, parsePagination } from "@/lib/validate";
import { success, error } from "@/lib/response";

const createDealSchema = z.object({
  title: z.string().min(1).max(200),
  leadId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  value: z.string().optional(),
  expectedClose: z.string().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
});

export const GET = withAuth(async (request, token) => {
  const { page, limit, offset } = parsePagination(request);
  const url = new URL(request.url);
  const stageId = url.searchParams.get("stageId");

  const conditions = [eq(deals.tenantId, token.tenantId)];
  if (stageId) conditions.push(eq(deals.stageId, stageId));

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(deals)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(deals.createdAt),
    db
      .select({ total: count() })
      .from(deals)
      .where(whereClause),
  ]);

  return success(data, { page, limit, totalCount: total });
});

export const POST = withAuth(async (request, token) => {
  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const [deal] = await db
    .insert(deals)
    .values({ ...parsed.data, tenantId: token.tenantId })
    .returning();

  return success(deal);
});
