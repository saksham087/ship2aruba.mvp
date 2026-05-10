import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

function generateTrackingNumber(): string {
  const prefix = "S2A";
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${timestamp}${random}`;
}

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  packageId?: string
) {
  await db.insert(schema.notifications).values({
    userId,
    title,
    message,
    type,
    packageId,
  });
}

export const packagesRoute = new Hono()
  .use("*", authMiddleware)
  // List packages
  .get("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    let pkgs;
    if (user.role === "ADMIN") {
      pkgs = await db
        .select({
          id: schema.packages.id,
          userId: schema.packages.userId,
          title: schema.packages.title,
          trackingNumber: schema.packages.trackingNumber,
          notes: schema.packages.notes,
          status: schema.packages.status,
          createdAt: schema.packages.createdAt,
          updatedAt: schema.packages.updatedAt,
          rejectionReason: schema.packages.rejectionReason,
          userName: schema.user.name,
          userEmail: schema.user.email,
        })
        .from(schema.packages)
        .leftJoin(schema.user, eq(schema.packages.userId, schema.user.id))
        .orderBy(desc(schema.packages.createdAt));
    } else {
      pkgs = await db
        .select({
          id: schema.packages.id,
          userId: schema.packages.userId,
          title: schema.packages.title,
          trackingNumber: schema.packages.trackingNumber,
          notes: schema.packages.notes,
          status: schema.packages.status,
          createdAt: schema.packages.createdAt,
          updatedAt: schema.packages.updatedAt,
          rejectionReason: schema.packages.rejectionReason,
          userName: schema.user.name,
          userEmail: schema.user.email,
        })
        .from(schema.packages)
        .leftJoin(schema.user, eq(schema.packages.userId, schema.user.id))
        .where(eq(schema.packages.userId, user.id))
        .orderBy(desc(schema.packages.createdAt));
    }
    return c.json({ packages: pkgs }, 200);
  })
  // Create package
  .post("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const body = await c.req.json();
    const { title, notes } = body;
    if (!title) return c.json({ message: "Title is required" }, 400);

    const trackingNumber = generateTrackingNumber();
    const [pkg] = await db
      .insert(schema.packages)
      .values({
        userId: user.id,
        title,
        notes,
        trackingNumber,
        status: "pending_review",
      })
      .returning();

    // Find admin users and notify them
    const admins = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.role as any, "ADMIN"));
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Package Submitted",
        `${user.name} submitted a new package: "${title}"`,
        "info",
        pkg.id
      );
    }

    return c.json({ package: pkg }, 201);
  })
  // Get single package
  .get("/:id", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const { id } = c.req.param();

    const [pkg] = await db
      .select({
        id: schema.packages.id,
        userId: schema.packages.userId,
        title: schema.packages.title,
        trackingNumber: schema.packages.trackingNumber,
        notes: schema.packages.notes,
        status: schema.packages.status,
        createdAt: schema.packages.createdAt,
        updatedAt: schema.packages.updatedAt,
        rejectionReason: schema.packages.rejectionReason,
        userName: schema.user.name,
        userEmail: schema.user.email,
      })
      .from(schema.packages)
      .leftJoin(schema.user, eq(schema.packages.userId, schema.user.id))
      .where(
        user.role === "ADMIN"
          ? eq(schema.packages.id, id)
          : and(eq(schema.packages.id, id), eq(schema.packages.userId, user.id))
      );

    if (!pkg) return c.json({ message: "Package not found" }, 404);

    // Get invoices
    const invs = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.packageId, id))
      .orderBy(desc(schema.invoices.uploadedAt));

    // Get shipment requests
    const shipReqs = await db
      .select()
      .from(schema.shipmentRequests)
      .where(eq(schema.shipmentRequests.packageId, id))
      .orderBy(desc(schema.shipmentRequests.requestedAt));

    return c.json({ package: pkg, invoices: invs, shipmentRequests: shipReqs }, 200);
  })
  // Admin: update package status
  .patch("/:id/status", requireAdmin, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { status, rejectionReason } = body;

    const validStatuses = ["approved", "rejected", "shipped", "pending_review"];
    if (!validStatuses.includes(status)) {
      return c.json({ message: "Invalid status" }, 400);
    }

    const [pkg] = await db
      .update(schema.packages)
      .set({
        status,
        rejectionReason: rejectionReason ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.packages.id, id))
      .returning();

    if (!pkg) return c.json({ message: "Package not found" }, 404);

    // Notify package owner
    const notifMsg =
      status === "approved"
        ? `Your package "${pkg.title}" has been approved! You can now request shipment.`
        : status === "rejected"
        ? `Your package "${pkg.title}" was rejected. Reason: ${rejectionReason || "No reason provided"}. Please upload a corrected invoice.`
        : `Your package "${pkg.title}" status updated to ${status}.`;

    const notifType: "success" | "error" | "info" =
      status === "approved" ? "success" : status === "rejected" ? "error" : "info";

    await createNotification(pkg.userId, `Package ${status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Updated"}`, notifMsg, notifType, pkg.id);

    return c.json({ package: pkg }, 200);
  })
  // Client: request shipment
  .post("/:id/shipment-request", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const { id } = c.req.param();

    const [pkg] = await db
      .select()
      .from(schema.packages)
      .where(
        and(eq(schema.packages.id, id), eq(schema.packages.userId, user.id))
      );

    if (!pkg) return c.json({ message: "Package not found" }, 404);
    if (pkg.status !== "approved") {
      return c.json({ message: "Package must be approved before requesting shipment" }, 400);
    }

    const [shipReq] = await db
      .insert(schema.shipmentRequests)
      .values({ packageId: id })
      .returning();

    await db
      .update(schema.packages)
      .set({ status: "shipment_requested", updatedAt: new Date() })
      .where(eq(schema.packages.id, id));

    // Notify admins
    const admins = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.role as any, "ADMIN"));
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Shipment Requested",
        `${user.name} requested shipment for package "${pkg.title}"`,
        "info",
        pkg.id
      );
    }

    return c.json({ shipmentRequest: shipReq }, 201);
  });
