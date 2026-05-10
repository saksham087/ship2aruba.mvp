import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { requireAdmin, authMiddleware } from "../middleware/auth";

export const adminRoute = new Hono()
  .use("*", authMiddleware)
  .get("/stats", requireAdmin, async (c) => {
    const [totalPackages] = await db
      .select({ count: count() })
      .from(schema.packages);

    const [pendingReview] = await db
      .select({ count: count() })
      .from(schema.packages)
      .where(eq(schema.packages.status, "pending_review"));

    const [approved] = await db
      .select({ count: count() })
      .from(schema.packages)
      .where(eq(schema.packages.status, "approved"));

    const [rejected] = await db
      .select({ count: count() })
      .from(schema.packages)
      .where(eq(schema.packages.status, "rejected"));

    const [shipped] = await db
      .select({ count: count() })
      .from(schema.packages)
      .where(eq(schema.packages.status, "shipped"));

    const [shipmentRequested] = await db
      .select({ count: count() })
      .from(schema.packages)
      .where(eq(schema.packages.status, "shipment_requested"));

    const [totalClients] = await db
      .select({ count: count() })
      .from(schema.user)
      .where(eq(schema.user.role as any, "CLIENT"));

    const [pendingShipments] = await db
      .select({ count: count() })
      .from(schema.shipmentRequests)
      .where(eq(schema.shipmentRequests.status, "pending"));

    return c.json(
      {
        stats: {
          totalPackages: totalPackages.count,
          pendingReview: pendingReview.count,
          approved: approved.count,
          rejected: rejected.count,
          shipped: shipped.count,
          shipmentRequested: shipmentRequested.count,
          totalClients: totalClients.count,
          pendingShipments: pendingShipments.count,
        },
      },
      200
    );
  })
  .get("/clients", requireAdmin, async (c) => {
    const clients = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        createdAt: schema.user.createdAt,
        role: schema.user.role,
      })
      .from(schema.user)
      .where(eq(schema.user.role as any, "CLIENT"))
      .orderBy(desc(schema.user.createdAt));

    // Get package counts per client
    const packageCounts = await db
      .select({
        userId: schema.packages.userId,
        count: count(),
      })
      .from(schema.packages)
      .groupBy(schema.packages.userId);

    const countMap = new Map(packageCounts.map((p) => [p.userId, p.count]));

    const enriched = clients.map((c) => ({
      ...c,
      packageCount: countMap.get(c.id) ?? 0,
    }));

    return c.json({ clients: enriched }, 200);
  });
