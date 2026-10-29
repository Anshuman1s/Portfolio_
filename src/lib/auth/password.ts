import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { argonOptions } from "./argon-options";

export const hashPassword = (password: string) => hash(password, argonOptions);

// Verified against when the email is unknown, so response time doesn't reveal
// whether an account exists.
let dummyHash: Promise<string> | undefined;

export async function verifyPassword(passwordHash: string | null, password: string) {
  dummyHash ??= hashPassword("timing-equaliser-not-a-real-password");
  const target = passwordHash ?? (await dummyHash);
  try {
    const ok = await verify(target, password);
    return ok && passwordHash !== null;
  } catch {
    return false;
  }
}
