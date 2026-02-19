import { initAuth } from "./index";

/**
 * Server-side auth instance for use in middleware and API routes.
 * This is a singleton that should be imported across the server.
 */
export const auth = initAuth({
  baseUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  productionUrl: process.env.BETTER_AUTH_PRODUCTION_URL ?? "https://gasera.app",
  secret: process.env.BETTER_AUTH_SECRET,
  discordClientId: process.env.DISCORD_CLIENT_ID ?? "",
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
});

export type { Auth } from "./index.js";
