import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
});

// ─── Token-based session store ───────────────────────────────────────────────
// The Runable preview proxy strips Set-Cookie headers, so we can't rely on
// cookie-based sessions. Instead we store the token + user in localStorage
// and pass it via Authorization header for every API call.

const SESSION_KEY = "s2a_session";

export interface StoredSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image: string | null;
  };
}

export function saveSession(token: string, user: StoredSession["user"]) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  // Also dispatch a custom event so useSession listeners update
  window.dispatchEvent(new Event("s2a:session-change"));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("s2a:session-change"));
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Fetch wrapper that injects Bearer token from localStorage */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const session = getStoredSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> || {}),
  };
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }
  return fetch(input, { ...init, headers });
}
