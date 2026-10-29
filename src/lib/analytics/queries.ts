import "server-only";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

// Callers must authorise with requireAdmin() / getAdminForApi() first.

export const VISITS_PAGE_SIZE = 25;
const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => !Number.isNaN(Date.parse(value)));

const filterSchema = z.object({
  from: isoDate.optional().catch(undefined),
  to: isoDate.optional().catch(undefined),
  path: z.string().startsWith("/").max(200).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).optional().catch(undefined),
});

export type AnalyticsFilters = {
  from: string;
  to: string;
  path: string | null;
  page: number;
  /** Inclusive start / exclusive end, UTC. */
  range: { gte: Date; lt: Date };
};

const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

/** Parses search params into a bounded UTC date range (defaults to the last 30 days). */
export function parseFilters(params: Record<string, string | string[] | undefined>): AnalyticsFilters {
  const raw = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = filterSchema.parse(raw);

  const today = toIsoDay(new Date());
  let to = parsed.to ?? today;
  let from = parsed.from ?? toIsoDay(new Date(Date.parse(to) - 29 * DAY_MS));
  if (from > to) [from, to] = [to, from];

  return {
    from,
    to,
    path: parsed.path || null,
    page: parsed.page ?? 1,
    range: { gte: new Date(`${from}T00:00:00Z`), lt: new Date(Date.parse(`${to}T00:00:00Z`) + DAY_MS) },
  };
}

const whereFor = (filters: AnalyticsFilters): Prisma.VisitEventWhereInput => ({
  createdAt: filters.range,
  ...(filters.path ? { path: filters.path } : {}),
});

export async function getAnalyticsSummary(filters: AnalyticsFilters) {
  const where = whereFor(filters);
  const pathSql = filters.path ? Prisma.sql`AND "path" = ${filters.path}` : Prisma.empty;

  const [views, uniques, daily, pages, referrers, devices, browsers, countries] = await Promise.all([
    db.visitEvent.count({ where }),
    db.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT "visitorHash")::int AS count FROM "VisitEvent"
      WHERE "createdAt" >= ${filters.range.gte} AND "createdAt" < ${filters.range.lt} ${pathSql}`,
    db.$queryRaw<{ day: Date; views: number; visitors: number }[]>`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC') AS day,
             COUNT(*)::int AS views,
             COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "VisitEvent"
      WHERE "createdAt" >= ${filters.range.gte} AND "createdAt" < ${filters.range.lt} ${pathSql}
      GROUP BY 1 ORDER BY 1`,
    db.visitEvent.groupBy({
      by: ["path"],
      where: { createdAt: filters.range },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    db.visitEvent.groupBy({
      by: ["referrerHost"],
      where: { ...where, referrerHost: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { referrerHost: "desc" } },
      take: 8,
    }),
    db.visitEvent.groupBy({ by: ["device"], where, _count: { _all: true } }),
    db.visitEvent.groupBy({ by: ["browser"], where, _count: { _all: true } }),
    db.visitEvent.groupBy({
      by: ["country"],
      where: { ...where, country: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 8,
    }),
  ]);

  // Fill missing days with zeros so the chart has a continuous axis.
  const byDay = new Map(daily.map((row) => [toIsoDay(row.day), row]));
  const series: { day: string; views: number; visitors: number }[] = [];
  for (let t = filters.range.gte.getTime(); t < filters.range.lt.getTime(); t += DAY_MS) {
    const day = toIsoDay(new Date(t));
    const row = byDay.get(day);
    series.push({ day, views: row?.views ?? 0, visitors: row?.visitors ?? 0 });
  }

  return {
    views,
    visitorDays: uniques[0]?.count ?? 0,
    series,
    pages: pages.map((row) => ({ label: row.path, count: row._count._all })),
    referrers: referrers.map((row) => ({ label: row.referrerHost ?? "—", count: row._count._all })),
    devices: devices
      .map((row) => ({ label: row.device ?? "unknown", count: row._count._all }))
      .sort((a, b) => b.count - a.count),
    browsers: browsers
      .map((row) => ({ label: row.browser ?? "unknown", count: row._count._all }))
      .sort((a, b) => b.count - a.count),
    countries: countries.map((row) => ({ label: row.country ?? "—", count: row._count._all })),
  };
}

export async function listVisits(filters: AnalyticsFilters) {
  const where = whereFor(filters);
  const [total, rows] = await Promise.all([
    db.visitEvent.count({ where }),
    db.visitEvent.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (filters.page - 1) * VISITS_PAGE_SIZE,
      take: VISITS_PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        path: true,
        referrerHost: true,
        visitorHash: true,
        ipAddress: true,
        device: true,
        browser: true,
        country: true,
        region: true,
        city: true,
        // Only whether precise location exists — coordinates stay on the detail page.
        location: { select: { id: true } },
      },
    }),
  ]);

  return {
    total,
    pages: Math.max(1, Math.ceil(total / VISITS_PAGE_SIZE)),
    rows: rows.map(({ location, ...row }) => ({ ...row, hasPreciseLocation: Boolean(location) })),
  };
}
