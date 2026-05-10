import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Better Auth tables re-exported
export * from "./auth-schema";

export const packages = sqliteTable("packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  trackingNumber: text("tracking_number").notNull().unique(),
  notes: text("notes"),
  status: text("status", {
    enum: [
      "uploaded",
      "pending_review",
      "approved",
      "rejected",
      "shipment_requested",
      "shipped",
    ],
  })
    .notNull()
    .default("pending_review"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  rejectionReason: text("rejection_reason"),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  packageId: text("package_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const shipmentRequests = sqliteTable("shipment_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  packageId: text("package_id").notNull(),
  status: text("status", {
    enum: ["pending", "shipped", "cancelled"],
  })
    .notNull()
    .default("pending"),
  requestedAt: integer("requested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),
  notes: text("notes"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", {
    enum: ["info", "success", "warning", "error"],
  })
    .notNull()
    .default("info"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  packageId: text("package_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
