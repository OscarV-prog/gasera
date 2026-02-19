import { sql } from "@vercel/postgres";
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

  // Rule:
  // - If pooled OR on Vercel -> use @vercel/postgres
  // - Else (not pooled) -> use direct driver (postgres-js)
  const driver = pooled || vercel ? "vercel" : "postgres-js";

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

  if (
    selected.driver === "vercel" &&
    selected.supabaseDirect &&
    !selected.pooled &&
    !selected.vercel
  ) {
    console.warn(
      "[db] POSTGRES_URL looks like a direct Supabase connection string (:5432, host db.<proj>.supabase.co). " +
        "Switching to direct driver (postgres-js) is recommended for dev; pooled URLs are required for @vercel/postgres.",
      selected.meta,
    );
  }
}

declare global {
  var __acme_postgres_js_client: ReturnType<typeof postgres> | undefined;
}

export const db =
  selected.driver === "vercel"
    ? drizzleVercelPostgres({
        client: sql,
        schema,
        casing: "snake_case",
      })
    : drizzlePostgresJs({
        client:
          globalThis.__acme_postgres_js_client ??
          (globalThis.__acme_postgres_js_client = postgres(POSTGRES_URL, {
            // Supabase direct connections require SSL.
            ssl: selected.supabaseDirect ? "require" : undefined,
            max: 1,
          })),
        schema,
        casing: "snake_case",
      });
