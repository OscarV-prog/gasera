import { createAuthClient } from "better-auth/react";

// Resolve the base URL at runtime from the browser's current origin when
// available, so auth API calls are always same-origin regardless of whether
// the page is served from the production or a Netlify deploy-preview URL.
// Falls back to the build-time env var for SSR contexts.
const getBaseUrl = (): string => {
  try {
    // Works in any browser environment; throws / is undefined in Node
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origin = (globalThis as any).location?.origin as string | undefined;
    if (origin) return origin;
  } catch {
    // SSR – ignore
  }
  return process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
