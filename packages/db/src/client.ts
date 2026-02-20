import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { drizzle as drizzleVercelPostgres } from "drizzle-orm/vercel-postgres";
import postgres from "postgres";

import * as schema from "./schema";

const POSTGRES_URL = process.env.POSTGRES_URL;

function safeUrlMeta(url: URL) {
  return {
    host: url.hostname,
    port:
      url.port ||
      (url.protocol === "postgres:" || url.protocol === "postgresql:"
        ? "5432"
        : ""),
    db: url.pathname?.replace(/^\//, "") || "",
  };
}

function looksLikeSupabaseDirect(url: URL) {
  const isSupabaseDbHost =
    url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co");
  const port = url.port || "5432";
  return isSupabaseDbHost && port === "5432";
}

function looksLikePooled(url: URL) {
  const port = url.port;
  return port === "6543" || /pooler/i.test(url.hostname);
}

function isRunningOnVercel() {
  return !!(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.VERCEL_URL
  );
}

function selectDbDriver(urlString: string) {
  const url = new URL(urlString);
  const pooled = looksLikePooled(url);
  const vercel = isRunningOnVercel();
  const supabaseDirect = looksLikeSupabaseDirect(url);

  // Only use @vercel/postgres when actually running on Vercel AND the URL is pooled.
  // On Netlify (no VERCEL env vars) always use postgres-js to avoid
  // @vercel/postgres crashing on import.
  const driver = vercel && pooled ? "vercel" : "postgres-js";

  return {
    driver,
    pooled,
    vercel,
    supabaseDirect,
    meta: safeUrlMeta(url),
  } as const;
}

if (!POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const selected = selectDbDriver(POSTGRES_URL);

// Minimal diagnostics. Avoid logging secrets; only log safe metadata.
if (process.env.NODE_ENV !== "production") {
  const msg = `[db] driver=${selected.driver} pooled=${selected.pooled} vercel=${selected.vercel} supabaseDirect=${selected.supabaseDirect}`;
  console.info(msg, selected.meta);
}

declare global {
  var __acme_postgres_js_client: ReturnType<typeof postgres> | undefined;
}

function buildVercelDrizzle() {
  // Dynamically import @vercel/postgres to avoid crashing on non-Vercel envs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { sql } = require("@vercel/postgres") as {
    sql: import("@vercel/postgres").VercelPool;
  };
  return drizzleVercelPostgres({ client: sql, schema, casing: "snake_case" });
}

function buildPostgresJsDrizzle(url: string, supabaseDirect: boolean) {
  const client =
    globalThis.__acme_postgres_js_client ??
    (globalThis.__acme_postgres_js_client = postgres(url, {
      // Supabase direct connections require SSL.
      ssl: supabaseDirect ? "require" : undefined,
      max: 1,
    }));
  return drizzlePostgresJs({ client, schema, casing: "snake_case" });
}

export const db =
  selected.driver === "vercel"
    ? buildVercelDrizzle()
    : buildPostgresJsDrizzle(POSTGRES_URL, selected.supabaseDirect);
