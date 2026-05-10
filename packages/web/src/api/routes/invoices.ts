import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";

export const invoicesRoute = new Hono()
  .use("*", authMiddleware)
  .post("/:packageId/invoice", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const { packageId } = c.req.param();
    const body = await c.req.json();
    const { fileUrl, fileName } = body;

    if (!fileUrl) return c.json({ message: "fileUrl is required" }, 400);

    // Verify package belongs to user (or admin)
    let pkg;
    if (user.role === "ADMIN") {
      [pkg] = await db
        .select()
        .from(schema.packages)
        .where(eq(schema.packages.id, packageId));
    } else {
      [pkg] = await db
        .select()
        .from(schema.packages)
        .where(
          and(
            eq(schema.packages.id, packageId),
            eq(schema.packages.userId, user.id)
          )
        );
    }

    if (!pkg) return c.json({ message: "Package not found" }, 404);

    const [invoice] = await db
      .insert(schema.invoices)
      .values({ packageId, fileUrl, fileName })
      .returning();

    // If package was rejected, move back to pending_review
    if (pkg.status === "rejected") {
      await db
        .update(schema.packages)
        .set({ status: "pending_review", rejectionReason: null, updatedAt: new Date() })
        .where(eq(schema.packages.id, packageId));
    }

    return c.json({ invoice }, 201);
  })
  .get("/:packageId/invoices", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const { packageId } = c.req.param();

    // Check access
    let pkg;
    if (user.role === "ADMIN") {
      [pkg] = await db
        .select()
        .from(schema.packages)
        .where(eq(schema.packages.id, packageId));
    } else {
      [pkg] = await db
        .select()
        .from(schema.packages)
        .where(
          and(
            eq(schema.packages.id, packageId),
            eq(schema.packages.userId, user.id)
          )
        );
    }
    if (!pkg) return c.json({ message: "Package not found" }, 404);

    const invs = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.packageId, packageId))
      .orderBy(desc(schema.invoices.uploadedAt));

    return c.json({ invoices: invs }, 200);
  });
