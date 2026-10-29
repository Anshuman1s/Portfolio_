import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // The local `prisma dev` server accepts one connection at a time, so local
  // .env sets DATABASE_POOL_MAX=1 and idle connections are released quickly.
  // Leave it unset in production to use pg's default pool size.
  const max = Number(process.env.DATABASE_POOL_MAX) || undefined;
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(max ? { max, idleTimeoutMillis: 1000 } : {}),
  });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in development.
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
