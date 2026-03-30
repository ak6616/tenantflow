import { client } from "@/db";
import { TokenPayload } from "./auth";

export async function withTenant<T>(
  tokenPayload: TokenPayload,
  fn: () => Promise<T>
): Promise<T> {
  await client`SELECT set_config('app.current_tenant_id', ${tokenPayload.tenantId}, true)`;
  return fn();
}
