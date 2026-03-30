import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, tenants } from "@/db/schema";
import { comparePassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return error("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { email, password, tenantSlug } = parsed.data;

    // Find tenant
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);

    if (!tenant) {
      return error("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenant.id), eq(users.email, email)))
      .limit(1);

    if (!user || !user.passwordHash) {
      return error("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return error("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const token = signToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return success({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name, plan: tenant.plan },
    });
  } catch (err) {
    console.error("Login error:", err);
    return error("INTERNAL_ERROR", "An error occurred during login", 500);
  }
}
