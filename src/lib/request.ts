import "server-only";
import { isIP } from "node:net";
import { env } from "./env";

type HeaderSource = Pick<Headers, "get">;

/**
 * Client IP from trusted infrastructure only. Never trusts arbitrary
 * client-supplied headers: on Vercel the platform overwrites x-real-ip /
 * x-forwarded-for; elsewhere only TRUSTED_IP_HEADER (if configured) is used.
 */
export function getClientIp(headers: HeaderSource): string | null {
  let raw: string | null = null;

  if (process.env.VERCEL === "1") {
    raw = headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  } else {
    const trusted = env().TRUSTED_IP_HEADER;
    if (trusted) raw = headers.get(trusted)?.split(",")[0] ?? null;
  }

  const ip = raw?.trim() ?? "";
  return isIP(ip) ? ip : null;
}

/** IPv4 → /24, IPv6 → /48. Enough for coarse grouping, not to single out a host. */
export function truncateIp(ip: string): string {
  if (isIP(ip) === 4) return ip.split(".").slice(0, 3).concat("0").join(".");
  const groups = ip.split(":").filter(Boolean).slice(0, 3);
  return `${groups.join(":")}::`;
}

/** Approximate location from Vercel's IP geolocation headers (country/region/city). */
export function getApproxGeo(headers: HeaderSource) {
  if (process.env.VERCEL !== "1") return { country: null, region: null, city: null };
  const decode = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value).slice(0, 80);
    } catch {
      return null;
    }
  };
  return {
    country: decode(headers.get("x-vercel-ip-country")),
    region: decode(headers.get("x-vercel-ip-country-region")),
    city: decode(headers.get("x-vercel-ip-city")),
  };
}

/**
 * CSRF guard for route handlers: state-changing requests must come from this
 * origin. (Server Actions get the equivalent check from Next.js itself.)
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
