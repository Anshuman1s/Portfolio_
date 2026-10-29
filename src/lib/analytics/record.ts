import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { hmac, randomToken, sha256 } from "@/lib/crypto";
import { getApproxGeo, getClientIp, truncateIp } from "@/lib/request";

type HeaderSource = Pick<Headers, "get">;

/** Repeat views of the same page by the same visitor within this window count once. */
export const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|fetch|headless|lighthouse|pingdom|monitor/i;

function deviceCategory(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

function browserFamily(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

/**
 * Pseudonymous visitor id: HMAC of (UTC day, IP, user agent) with a server
 * secret. It rotates daily, can't be reversed to an IP, and is only an
 * estimate — shared networks merge people, and changing networks splits them.
 */
function visitorHashFor(headers: HeaderSource) {
  const day = new Date().toISOString().slice(0, 10);
  const ip = getClientIp(headers) ?? "no-ip";
  const ua = headers.get("user-agent") ?? "";
  return hmac(`${day}|${ip}|${ua}`).slice(0, 32);
}

/** Honour browser privacy signals: Global Privacy Control and Do Not Track. */
export const optedOut = (headers: HeaderSource) =>
  headers.get("sec-gpc") === "1" || headers.get("dnt") === "1";

export async function recordVisit(input: {
  path: string;
  referrer: string | null;
  headers: HeaderSource;
}) {
  const config = env();
  if (!config.ANALYTICS_ENABLED) return;

  const { headers } = input;
  const ua = headers.get("user-agent") ?? "";
  if (!ua || BOT_PATTERN.test(ua) || optedOut(headers)) return;

  const visitorHash = visitorHashFor(headers);
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const duplicate = await db.visitEvent.findFirst({
    where: { visitorHash, path: input.path, createdAt: { gte: since } },
    select: { id: true },
  });
  if (duplicate) return;

  const ip = getClientIp(headers);
  const ipAddress =
    !ip || config.ANALYTICS_IP_MODE === "none"
      ? null
      : config.ANALYTICS_IP_MODE === "full"
        ? ip
        : truncateIp(ip);

  await db.visitEvent.create({
    data: {
      path: input.path,
      referrerHost: input.referrer,
      visitorHash,
      ipAddress,
      device: deviceCategory(ua),
      browser: browserFamily(ua),
      ...getApproxGeo(headers),
    },
  });
}

/** Stores consented coordinates, rounded to ~1 km. Returns the withdrawal token. */
export async function recordLocationConsent(input: {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  headers: HeaderSource;
}) {
  const visit = await db.visitEvent.findFirst({
    where: { visitorHash: visitorHashFor(input.headers), location: null },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const token = randomToken();
  const round = (value: number) => Math.round(value * 100) / 100;

  await db.locationConsent.create({
    data: {
      visitEventId: visit?.id ?? null,
      latitude: round(input.latitude),
      longitude: round(input.longitude),
      accuracyMeters: input.accuracy === null ? null : Math.round(input.accuracy),
      deletionTokenHash: sha256(token),
    },
  });
  return token;
}

/** Deletes location data tied to a visitor's withdrawal token. */
export async function withdrawLocationConsent(token: string) {
  const { count } = await db.locationConsent.deleteMany({
    where: { deletionTokenHash: sha256(token) },
  });
  return count;
}
