export const PLAN_LIMITS: Record<string, { seats: number; leads: number }> = {
  free: { seats: 2, leads: 500 },
  pro: { seats: 10, leads: 10000 },
  enterprise: { seats: Infinity, leads: Infinity },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
