#!/usr/bin/env bun
/**
 * Seed script — creates demo admin and client accounts
 * Run: bun run seed (from packages/web directory)
 */
import { db } from "./database";
import * as schema from "./database/schema";
import { eq } from "drizzle-orm";
import { auth } from "./auth";

const ADMIN_EMAIL = "admin@ship2aruba.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin User";

const CLIENT_EMAIL = "client@ship2aruba.com";
const CLIENT_PASSWORD = "client123";
const CLIENT_NAME = "Demo Client";

async function seed() {
  console.log("🌱 Seeding demo accounts...\n");

  // Create admin account via Better Auth API
  try {
    const adminRes = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
        role: "ADMIN",
      },
      headers: new Headers(),
    });
    if (adminRes) {
      // Force set role to ADMIN in DB
      await db
        .update(schema.user)
        .set({ role: "ADMIN" } as any)
        .where(eq(schema.user.email, ADMIN_EMAIL));
      console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
    }
  } catch (e: any) {
    if (e?.message?.includes("already exists") || e?.message?.includes("UNIQUE")) {
      // Update existing account role
      await db
        .update(schema.user)
        .set({ role: "ADMIN" } as any)
        .where(eq(schema.user.email, ADMIN_EMAIL));
      console.log(`ℹ️  Admin already exists — role updated: ${ADMIN_EMAIL}`);
    } else {
      console.error("❌ Failed to create admin:", e?.message ?? e);
    }
  }

  // Create client account
  try {
    const clientRes = await auth.api.signUpEmail({
      body: {
        email: CLIENT_EMAIL,
        password: CLIENT_PASSWORD,
        name: CLIENT_NAME,
        role: "CLIENT",
      },
      headers: new Headers(),
    });
    if (clientRes) {
      console.log(`✅ Client account created: ${CLIENT_EMAIL}`);
    }
  } catch (e: any) {
    if (e?.message?.includes("already exists") || e?.message?.includes("UNIQUE")) {
      console.log(`ℹ️  Client already exists: ${CLIENT_EMAIL}`);
    } else {
      console.error("❌ Failed to create client:", e?.message ?? e);
    }
  }

  console.log("\n🎉 Done!\n");
  console.log("Demo credentials:");
  console.log(`  Admin   → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Client  → ${CLIENT_EMAIL} / ${CLIENT_PASSWORD}`);
  process.exit(0);
}

seed();
