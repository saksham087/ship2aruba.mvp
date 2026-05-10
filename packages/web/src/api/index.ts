import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware } from "./middleware/auth";
import { packagesRoute } from "./routes/packages";
import { invoicesRoute } from "./routes/invoices";
import { shipmentRequestsRoute } from "./routes/shipment-requests";
import { uploadRoute } from "./routes/upload";
import { notificationsRoute } from "./routes/notifications";
import { adminRoute } from "./routes/admin";

const app = new Hono()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .use("*", authMiddleware)
  .get("/health", (c) => c.json({ status: "ok" }, 200))
  .route("/packages", packagesRoute)
  .route("/packages", invoicesRoute)
  .route("/shipment-requests", shipmentRequestsRoute)
  .route("/upload", uploadRoute)
  .route("/notifications", notificationsRoute)
  .route("/admin", adminRoute);

export type AppType = typeof app;
export default app;
