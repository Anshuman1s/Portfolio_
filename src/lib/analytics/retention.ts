import "server-only";
import { purgeOldAttempts } from "@/lib/auth/rate-limit";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/**
 * Retention policy (configurable in .env):
 * - visit events deleted after ANALYTICS_RETENTION_DAYS
 * - IP addresses cleared after ANALYTICS_IP_RETENTION_DAYS
 * - consented coordinates deleted after LOCATION_RETENTION_DAYS
 * - expired sessions and day-old login attempts removed
 * Runs daily via /api/cron/retention, or on demand from the Analytics page.
 */
export async function purgeExpiredData() {
  const config = env();

  const [visits, ips, locations, sessions] = await Promise.all([
    db.visitEvent.deleteMany({
      where: { createdAt: { lt: daysAgo(config.ANALYTICS_RETENTION_DAYS) } },
    }),
    db.visitEvent.updateMany({
      where: {
        createdAt: { lt: daysAgo(config.ANALYTICS_IP_RETENTION_DAYS) },
        ipAddress: { not: null },
      },
      data: { ipAddress: null },
    }),
    db.locationConsent.deleteMany({
      where: { consentedAt: { lt: daysAgo(config.LOCATION_RETENTION_DAYS) } },
    }),
    db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    purgeOldAttempts(),
  ]);

  return {
    visitsDeleted: visits.count,
    ipsCleared: ips.count,
    locationsDeleted: locations.count,
    sessionsDeleted: sessions.count,
  };
}
