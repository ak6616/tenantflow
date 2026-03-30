import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { withAuth } from "@/lib/validate";
import { success, error, notFound } from "@/lib/response";

const updateDealSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  leadId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  value: z.string().optional(),
  expectedClose: z.string().nullable().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
});

export const GET = withAuth(async (_request, token, params) => {
  const id = params?.id;
  if (!id) return notFound("Deal");

  const [deal] = await db
    .select()
    .from(deals)
    .where(and(eq(deals.id, id), eq(deals.tenantId, token.tenantId)))
    .limit(1);

  if (!deal) return notFound("Deal");
  return success(deal);
});

export const PATCH = withAuth(async (request, token, params) => {
  const id = params?.id;
  if (!id) return notFound("Deal");

  const body = await request.json();
  const parsed = updateDealSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const [deal] = await db
    .update(deals)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(deals.id, id), eq(deals.tenantId, token.tenantId)))
    .returning();

  if (!deal) return notFound("Deal");
  return success(deal);
});
