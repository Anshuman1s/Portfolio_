/**
 * Safe, idempotent initialisation:
 * - creates the bootstrap admin from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD only
 *   if no admin with that email exists (an existing password is never reset)
 * - seeds the skills constellation only when the Skill table is empty
 * Projects are not seeded — add real ones from the dashboard.
 *
 * Run: npm run db:seed
 */
import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { argonOptions } from "../src/lib/auth/argon-options";
import { initialSkills } from "./seed-data/skills";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email) {
    console.log("• ADMIN_EMAIL not set — skipping admin bootstrap.");
    return;
  }
  if (await db.adminUser.findUnique({ where: { email }, select: { id: true } })) {
    console.log("• Admin already exists — left unchanged.");
    return;
  }
  if (!password || password.length < 8) {
    throw new Error("ADMIN_INITIAL_PASSWORD must be set (8+ characters) to create the admin.");
  }

  await db.adminUser.create({
    data: { email, passwordHash: await hash(password, argonOptions), mustChangePassword: true },
  });
  console.log("• Admin created. A password change is required on first login.");
}

async function seedSkills() {
  if ((await db.skill.count()) > 0) {
    console.log("• Skills already present — left unchanged.");
    return;
  }
  await db.skill.createMany({
    data: initialSkills.map((skill, index) => ({ ...skill, sortOrder: index, published: true })),
  });
  console.log(`• Seeded ${initialSkills.length} skills.`);
}

async function main() {
  await seedAdmin();
  await seedSkills();
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
