import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/aldan",
  },
});
