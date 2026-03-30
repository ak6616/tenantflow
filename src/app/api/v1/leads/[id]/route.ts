import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { withAuth } from "@/lib/validate";
import { success, error, notFound } from "@/lib/response";

const updateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.enum(["new", "contacted", "qualified", "lost"]).optional(),
  ownerId: z.string().uuid().nullable().optional(),
});

export const GET = withAuth(async (_request, token, params) => {
  const id = params?.id;
  if (!id) return notFound("Lead");

  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.tenantId, token.tenantId)))
    .limit(1);

  if (!lead) return notFound("Lead");
  return success(lead);
});

export const PATCH = withAuth(async (request, token, params) => {
  const id = params?.id;
  if (!id) return notFound("Lead");

  const body = await request.json();
  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const [lead] = await db
    .update(leads)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(leads.id, id), eq(leads.tenantId, token.tenantId)))
    .returning();

  if (!lead) return notFound("Lead");
  return success(lead);
});

export const DELETE = withAuth(async (_request, token, params) => {
  const id = params?.id;
  if (!id) return notFound("Lead");

  const [lead] = await db
    .delete(leads)
    .where(and(eq(leads.id, id), eq(leads.tenantId, token.tenantId)))
    .returning({ id: leads.id });

  if (!lead) return notFound("Lead");
  return success({ deleted: true });
});
