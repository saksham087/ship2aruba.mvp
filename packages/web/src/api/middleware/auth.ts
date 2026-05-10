import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { db } from "../database";
import * as authSchema from "../database/auth-schema";
import { eq } from "drizzle-orm";

async function resolveSession(headers: Headers) {
  // 1. Try cookie-based session first
  const cookieSession = await auth.api.getSession({ headers });
  if (cookieSession) return cookieSession;

  // 2. Fall back to Bearer token from Authorization header
  const authHeader = headers.get("Authorization") || headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const [sessionRow] = await db
      .select()
      .from(authSchema.session)
      .where(eq(authSchema.session.token, token))
      .limit(1);

    if (!sessionRow) return null;
    if (new Date(sessionRow.expiresAt) < new Date()) return null;

    const [userRow] = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, sessionRow.userId))
      .limit(1);

    if (!userRow) return null;

    return { session: sessionRow, user: userRow };
  } catch {
    return null;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await resolveSession(c.req.raw.headers);
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  if (!c.get("user")) return c.json({ message: "Unauthorized" }, 401);
  return next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const user = c.get("user") as any;
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  if (user.role !== "ADMIN") return c.json({ message: "Forbidden" }, 403);
  return next();
});
