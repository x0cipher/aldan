import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "default_development_secret_do_not_use_in_production_12345",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
});

export type Auth = typeof auth;
