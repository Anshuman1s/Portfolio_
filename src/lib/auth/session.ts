import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, absolute

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  expires,
});

/**
 * Starts a fresh session (rotation): any session from the current cookie is
 * destroyed first, so a pre-login token can never be promoted.
 */
export async function createSession(userId: string) {
  await destroyCurrentSession();

  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { tokenHash: sha256(token), userId, expiresAt } });

  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** The admin for a session token, or null if missing / expired. */
export async function getSessionUser(token: string | undefined) {
  if (!token || token.length > 128) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, email: true, mustChangePassword: true } },
    },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session.user;
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/** Signs out every device — used after a password change. */
export async function destroyAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
