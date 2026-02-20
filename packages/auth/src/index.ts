import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@acme/db/client";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  discordClientId?: string;
  discordClientSecret?: string;
  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
      ...(options.extraPlugins ?? []),
    ] as BetterAuthPlugin[],
    // socialProviders: {
    //   discord: {
    //     clientId: options.discordClientId,
    //     clientSecret: options.discordClientSecret,
    //     redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
    //   },
    // },
    user: {
      additionalFields: {
        tenantId: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: true,
          defaultValue: "operator",
        },
      },
    },
    trustedOrigins: (request: Request) => {
      const origin = (request.headers.get("origin") ?? "").replace(/\/$/, "");
      const allowed = [
        "expo://",
        options.productionUrl?.replace(/\/$/, ""),
        options.baseUrl?.replace(/\/$/, ""),
      ].filter(Boolean);

      // Dynamically trust any *.netlify.app origin (main + deploy previews)
      if (origin && /^https:\/\/[^/]+\.netlify\.app$/.test(origin)) {
        return [...new Set([...allowed, origin])];
      }
      return allowed;
    },
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;

export interface Session {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    tenantId?: string | null;
    role: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}
