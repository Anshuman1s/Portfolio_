"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { accountKey, ipKey, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { createSession, destroyAllSessions, destroyCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { fieldErrors, loginSchema, passwordChangeSchema } from "@/lib/validation";

export type LoginState = { error?: string };

// One message for every failure so responses don't reveal whether an account exists.
const INVALID = "Invalid email or password.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: INVALID };

  const { email, password } = parsed.data;
  const keys = { ip: ipKey(getClientIp(await headers())), account: accountKey(email) };

  if (await isRateLimited(keys)) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }

  const user = await db.adminUser.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  const ok = await verifyPassword(user?.passwordHash ?? null, password);
  await recordAttempt(keys, ok);

  if (!ok || !user) return { error: INVALID };

  await createSession(user.id); // rotates: any prior session cookie is destroyed
  redirect("/admin");
}

export async function logout() {
  await destroyCurrentSession();
  redirect("/admin/login");
}

export type PasswordState = { errors?: Record<string, string> };

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const admin = await requireAdmin({ allowPendingPasswordChange: true });

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = await db.adminUser.findUniqueOrThrow({
    where: { id: admin.id },
    select: { passwordHash: true },
  });
  if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) {
    return { errors: { currentPassword: "Current password is incorrect" } };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  // Sign out every other device, then issue a fresh session here.
  await destroyAllSessions(admin.id);
  await createSession(admin.id);
  redirect("/admin?notice=password-changed");
}
