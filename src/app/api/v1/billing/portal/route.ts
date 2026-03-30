import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { withAuth } from "@/lib/validate";
import { success, error } from "@/lib/response";

export const POST = withAuth(async (_request, token) => {
  if (token.role !== "owner") {
    return error("FORBIDDEN", "Only the tenant owner can manage billing", 403);
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, token.tenantId))
    .limit(1);

  if (!tenant?.stripeCustomerId) {
    return error("BILLING_ERROR", "No Stripe customer associated with this tenant", 400);
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return success({ url: session.url });
});
