import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { tenants, users, pipelineStages } from "@/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { success, error } from "@/lib/response";

const signupSchema = z.object({
  companyName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

const DEFAULT_STAGES = [
  { name: "Lead", position: 0, color: "#6366f1" },
  { name: "Qualified", position: 1, color: "#8b5cf6" },
  { name: "Proposal", position: 2, color: "#a78bfa" },
  { name: "Negotiation", position: 3, color: "#f59e0b" },
  { name: "Closed Won", position: 4, color: "#10b981" },
  { name: "Closed Lost", position: 5, color: "#ef4444" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return error("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { companyName, email, password, name } = parsed.data;
    const slug = slugify(companyName) + "-" + Date.now().toString(36);

    // Create Stripe customer
    const stripeCustomer = await getStripe().customers.create({
      email,
      name: companyName,
    });

    // Create tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        slug,
        name: companyName,
        stripeCustomerId: stripeCustomer.id,
      })
      .returning();

    // Create owner user
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email,
        name,
        role: "owner",
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

    // Seed default pipeline stages
    await db.insert(pipelineStages).values(
      DEFAULT_STAGES.map((s) => ({ ...s, tenantId: tenant.id }))
    );

    const token = signToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return success(
      {
        token,
        user,
        tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name, plan: tenant.plan },
      },
      undefined
    );
  } catch (err: any) {
    if (err?.code === "23505") {
      return error("DUPLICATE", "A user with this email already exists in this tenant", 409);
    }
    console.error("Signup error:", err);
    return error("INTERNAL_ERROR", "An error occurred during signup", 500);
  }
}
