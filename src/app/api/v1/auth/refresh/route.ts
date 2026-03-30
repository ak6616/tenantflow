import { NextRequest } from "next/server";
import { extractToken, signToken } from "@/lib/auth";
import { success } from "@/lib/response";
import { unauthorized } from "@/lib/response";

export async function POST(request: NextRequest) {
  const payload = extractToken(request);
  if (!payload) return unauthorized();

  // Issue a fresh token with the same claims
  const token = signToken({
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
  });

  return success({ token });
}
