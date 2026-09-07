import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/aldan";

// In serverless environments, avoid creating too many idle connections
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 10 : 2,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
