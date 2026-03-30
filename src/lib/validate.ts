import { NextRequest } from "next/server";
import { extractToken, TokenPayload } from "./auth";
import { unauthorized } from "./response";
import { withTenant } from "./tenant";

export type AuthenticatedHandler = (
  request: NextRequest,
  token: TokenPayload,
  params?: Record<string, string>
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const token = extractToken(request);
    if (!token) return unauthorized();
    const params = context?.params ? await context.params : undefined;
    return withTenant(token, () => handler(request, token, params));
  };
}

export function parsePagination(request: NextRequest) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
