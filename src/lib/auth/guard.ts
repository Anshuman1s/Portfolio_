import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser } from "./session";

export type Admin = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

/**
 * Authorisation for admin pages and Server Actions. Every protected read or
 * mutation calls this on the server — the proxy redirect is only a UX shortcut.
 */
export async function requireAdmin(options: { allowPendingPasswordChange?: boolean } = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getSessionUser(token);

  if (!admin) redirect("/admin/login");
  if (admin.mustChangePassword && !options.allowPendingPasswordChange) {
    redirect("/admin/account?required=1");
  }
  return admin;
}

/** Same check for Route Handlers: returns null instead of redirecting. */
export async function getAdminForApi() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getSessionUser(token);
  if (!admin || admin.mustChangePassword) return null;
  return admin;
}
