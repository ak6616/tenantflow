import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pipelineStages } from "@/db/schema";
import { withAuth } from "@/lib/validate";
import { success, error } from "@/lib/response";

const createStageSchema = z.object({
  name: z.string().min(1).max(100),
  position: z.number().int().min(0),
  color: z.string().max(20).optional(),
});

export const GET = withAuth(async (_request, token) => {
  const stages = await db
    .select()
    .from(pipelineStages)
    .where(eq(pipelineStages.tenantId, token.tenantId))
    .orderBy(pipelineStages.position);

  return success(stages);
});

export const POST = withAuth(async (request, token) => {
  if (token.role !== "owner" && token.role !== "admin") {
    return error("FORBIDDEN", "Only owners and admins can create pipeline stages", 403);
  }

  const body = await request.json();
  const parsed = createStageSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const [stage] = await db
    .insert(pipelineStages)
    .values({ ...parsed.data, tenantId: token.tenantId })
    .returning();

  return success(stage);
});
