import { Hono } from "hono";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/s3";
import { requireAuth, authMiddleware } from "../middleware/auth";

export const uploadRoute = new Hono()
  .use("*", authMiddleware)
  .post("/presign", requireAuth, async (c) => {
    const body = await c.req.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return c.json({ message: "filename and contentType are required" }, 400);
    }

    const key = `invoices/${Date.now()}-${filename.replace(/\s+/g, "-")}`;

    try {
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn: 600 }
      );

      const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
      return c.json({ url, key, fileUrl }, 200);
    } catch (err) {
      console.error("S3 presign error:", err);
      return c.json({ message: "Failed to generate upload URL" }, 500);
    }
  });
