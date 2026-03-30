import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  [process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder"]: "pro",
  [process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_placeholder"]: "enterprise",
};

function planFromPriceId(priceId: string | undefined): string {
  if (!priceId) return "pro";
  return PRICE_IDS[priceId] || "pro";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const tenantId = session.metadata?.tenantId;
      if (tenantId && session.subscription) {
        const lineItemPriceId = session.line_items?.data?.[0]?.price?.id;
        const plan = planFromPriceId(lineItemPriceId);
        await db
          .update(tenants)
          .set({
            stripeSubscriptionId: session.subscription as string,
            plan,
          })
          .where(eq(tenants.id, tenantId));
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const plan = subscription.status === "active" ? planFromPriceId(priceId) : "free";
      await db
        .update(tenants)
        .set({ plan })
        .where(eq(tenants.stripeCustomerId, customerId as string));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;
      await db
        .update(tenants)
        .set({ plan: "free", stripeSubscriptionId: null })
        .where(eq(tenants.stripeCustomerId, customerId as string));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn("Payment failed for customer:", invoice.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
