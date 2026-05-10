import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, requireAuth, authMiddleware } from "../middleware/auth";

export const shipmentRequestsRoute = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAdmin, async (c) => {
    const requests = await db
      .select({
        id: schema.shipmentRequests.id,
        packageId: schema.shipmentRequests.packageId,
        status: schema.shipmentRequests.status,
        requestedAt: schema.shipmentRequests.requestedAt,
        shippedAt: schema.shipmentRequests.shippedAt,
        notes: schema.shipmentRequests.notes,
        packageTitle: schema.packages.title,
        packageTracking: schema.packages.trackingNumber,
        userName: schema.user.name,
        userEmail: schema.user.email,
      })
      .from(schema.shipmentRequests)
      .leftJoin(schema.packages, eq(schema.shipmentRequests.packageId, schema.packages.id))
      .leftJoin(schema.user, eq(schema.packages.userId, schema.user.id))
      .orderBy(desc(schema.shipmentRequests.requestedAt));

    return c.json({ requests }, 200);
  })
  .patch("/:id", requireAdmin, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { status, notes } = body;

    if (!["pending", "shipped", "cancelled"].includes(status)) {
      return c.json({ message: "Invalid status" }, 400);
    }

    const updateData: Record<string, any> = { status };
    if (notes) updateData.notes = notes;
    if (status === "shipped") updateData.shippedAt = new Date();

    const [req] = await db
      .update(schema.shipmentRequests)
      .set(updateData)
      .where(eq(schema.shipmentRequests.id, id))
      .returning();

    if (!req) return c.json({ message: "Shipment request not found" }, 404);

    // Update package status to shipped
    if (status === "shipped") {
      const [pkg] = await db
        .update(schema.packages)
        .set({ status: "shipped", updatedAt: new Date() })
        .where(eq(schema.packages.id, req.packageId))
        .returning();

      if (pkg) {
        // Notify client
        await db.insert(schema.notifications).values({
          userId: pkg.userId,
          title: "Package Shipped!",
          message: `Your package "${pkg.title}" (${pkg.trackingNumber}) has been shipped!`,
          type: "success",
          packageId: pkg.id,
        });
      }
    }

    return c.json({ request: req }, 200);
  });
