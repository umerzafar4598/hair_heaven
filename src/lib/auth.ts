import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24,
        }
    },
    plugins: [nextCookies()],
});