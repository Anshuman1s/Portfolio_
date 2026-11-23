import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations take a Postgres advisory lock, which doesn't work through a
    // connection pooler (e.g. Neon's "-pooler" host) and times out with P1002.
    // So the CLI prefers the direct, non-pooled URL; the app keeps DATABASE_URL.
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
