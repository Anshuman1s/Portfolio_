import "server-only";
import { db } from "@/lib/db";
import { hmac } from "@/lib/crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_IP = 10;
const MAX_FAILURES_PER_ACCOUNT = 5;

// Keys are HMACs so the table never holds raw IPs or email addresses.
export const ipKey = (ip: string | null) => `ip:${hmac(ip ?? "unknown")}`;
export const accountKey = (email: string) => `acct:${hmac(email.toLowerCase())}`;

async function recentFailures(key: string) {
  return db.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
  });
}

/** True when either the IP or the targeted account has too many recent failures. */
export async function isRateLimited(keys: { ip: string; account: string }) {
  const [byIp, byAccount] = await Promise.all([
    recentFailures(keys.ip),
    recentFailures(keys.account),
  ]);
  return byIp >= MAX_FAILURES_PER_IP || byAccount >= MAX_FAILURES_PER_ACCOUNT;
}

export async function recordAttempt(keys: { ip: string; account: string }, success: boolean) {
  await db.loginAttempt.createMany({
    data: [
      { key: keys.ip, success },
      { key: keys.account, success },
    ],
  });
  if (success) {
    // A successful login clears the account's failure streak.
    await db.loginAttempt.deleteMany({ where: { key: keys.account, success: false } });
  }
}

export async function purgeOldAttempts() {
  await db.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
}
