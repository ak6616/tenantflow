import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { withAuth } from "@/lib/validate";
import { success, error } from "@/lib/response";

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_placeholder",
};

const checkoutSchema = z.object({
  plan: z.enum(["pro", "enterprise"]),
});

export const POST = withAuth(async (request, token) => {
  if (token.role !== "owner") {
    return error("FORBIDDEN", "Only the tenant owner can manage billing", 403);
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, token.tenantId))
    .limit(1);

  if (!tenant?.stripeCustomerId) {
    return error("BILLING_ERROR", "No Stripe customer associated with this tenant", 400);
  }

  const session = await getStripe().checkout.sessions.create({
    customer: tenant.stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[parsed.data.plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: { tenantId: token.tenantId },
  });

  return success({ url: session.url });
});
