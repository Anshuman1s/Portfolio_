import "server-only";
import { z } from "zod";

const boolString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  ANALYTICS_SECRET: z.string().min(32, "ANALYTICS_SECRET must be at least 32 characters"),
  CRON_SECRET: z.string().min(32).optional(),
  ANALYTICS_ENABLED: boolString,
  /** none: never store IPs · truncated: /24 (IPv4) or /48 (IPv6) · full: complete address */
  ANALYTICS_IP_MODE: z.enum(["none", "truncated", "full"]).default("truncated"),
  ANALYTICS_RETENTION_DAYS: z.coerce.number().int().min(1).max(730).default(90),
  ANALYTICS_IP_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  LOCATION_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  NEXT_PUBLIC_PRECISE_LOCATION_ENABLED: boolString,
  /** Header to trust for the client IP when not on Vercel (e.g. "cf-connecting-ip"). */
  TRUSTED_IP_HEADER: z.string().optional(),
  /** IANA timezone used to display times in the admin (servers run in UTC). */
  ADMIN_TIMEZONE: z
    .string()
    .default("Asia/Kolkata")
    .refine((zone) => {
      try {
        new Intl.DateTimeFormat("en-GB", { timeZone: zone });
        return true;
      } catch {
        return false;
      }
    }, "ADMIN_TIMEZONE must be an IANA timezone such as Asia/Kolkata"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Parsed server environment. Throws with a readable message if misconfigured. */
export function env(): Env {
  if (!cached) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid environment configuration — ${issues}`);
    }
    cached = result.data;
  }
  return cached;
}
