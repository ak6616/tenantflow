"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { billingApi } from "@/lib/api";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    key: "free",
    price: "$0",
    period: "/mo",
    features: ["Up to 2 users", "500 leads", "Basic pipeline", "Community support"],
  },
  {
    name: "Pro",
    key: "pro",
    price: "$79",
    period: "/mo",
    features: ["Up to 10 users", "10,000 leads", "Advanced pipeline", "Priority support", "Reporting dashboard", "API access"],
  },
  {
    name: "Enterprise",
    key: "enterprise",
    price: "$199",
    period: "/mo",
    features: ["Unlimited users", "Unlimited leads", "Custom pipeline", "Dedicated support", "Advanced analytics", "SSO & SAML", "Custom integrations"],
  },
];

export default function BillingPage() {
  const { tenant } = useAuth();
  const currentPlan = tenant?.plan || "free";
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  async function handleSelectPlan(planKey: string) {
    if (planKey === "free" || planKey === currentPlan) return;
    setUpgradeLoading(planKey);
    try {
      const result = await billingApi.checkout(planKey);
      if (result?.url) window.location.href = result.url;
    } catch {
      // checkout unavailable in test mode
    } finally {
      setUpgradeLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    try {
      const result = await billingApi.portal();
      if (result?.url) window.location.href = result.url;
    } catch {
      // portal may not be available
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and payment method</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold capitalize">{currentPlan} Plan</span>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {tenant?.name || "Your company"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={loading}>
                {loading ? "Loading..." : "Manage Billing"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <Card key={plan.name} className={isCurrent ? "border-primary ring-2 ring-primary/20" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? "outline" : "default"}
                  className="mt-6 w-full"
                  size="sm"
                  disabled={isCurrent || plan.key === "free" || upgradeLoading === plan.key}
                  onClick={() => handleSelectPlan(plan.key)}
                >
                  {upgradeLoading === plan.key ? "Redirecting..." : isCurrent ? "Current Plan" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
