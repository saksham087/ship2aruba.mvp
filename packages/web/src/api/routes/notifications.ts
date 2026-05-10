import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";

export const notificationsRoute = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const notifs = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, user.id))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);

    return c.json({ notifications: notifs }, 200);
  })
  .patch("/:id/read", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const { id } = c.req.param();

    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.userId, user.id)
        )
      );

    return c.json({ success: true }, 200);
  })
  .patch("/read-all", requireAuth, async (c) => {
    const user = c.get("user") as any;

    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.userId, user.id));

    return c.json({ success: true }, 200);
  });
