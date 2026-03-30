import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
  if (!_client) {
    _client = postgres(process.env.DATABASE_URL!, { prepare: false });
  }
  return _client;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Convenience re-exports for backward compat
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export const client = new Proxy({} as ReturnType<typeof postgres>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
  apply(_target, thisArg, args) {
    return (getClient() as any).apply(thisArg, args);
  },
});
