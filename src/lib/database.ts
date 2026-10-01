import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

export const database = new Pool({ connectionString: databaseUrl, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });

export function requireDatabase(): void {
  if (!databaseUrl) throw new Error("Connect a Postgres database to save and share your workspace.");
}
