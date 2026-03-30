import { NextResponse } from "next/server";

export function success(data: unknown, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, meta });
}

export function error(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function unauthorized() {
  return error("UNAUTHORIZED", "Invalid or missing authentication token", 401);
}

export function forbidden() {
  return error("FORBIDDEN", "You do not have permission to perform this action", 403);
}

export function notFound(resource = "Resource") {
  return error("NOT_FOUND", `${resource} not found`, 404);
}
