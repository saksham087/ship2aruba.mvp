import { hc } from "hono/client";
import type { AppType } from "../../api";
import { getStoredSession } from "./auth";

// Custom fetch that injects Bearer token from localStorage
const authFetch: typeof fetch = (input, init) => {
  const session = getStoredSession();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> || {}),
  };
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }
  return fetch(input, { ...init, headers });
};

const client = hc<AppType>("/", { fetch: authFetch });
export const api = client.api;
