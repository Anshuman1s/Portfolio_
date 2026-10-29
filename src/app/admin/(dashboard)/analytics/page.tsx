import type { Metadata } from "next";
import Link from "next/link";
import { runRetention } from "@/app/admin/actions/analytics";
import { DailyBars, RankList, StatTile } from "@/components/admin/charts";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { buttonPrimary, buttonSecondary, inputClass, labelClass } from "@/components/admin/styles";
import { VisitsTable } from "@/components/admin/VisitsTable";
import { DEDUPE_WINDOW_MS } from "@/lib/analytics/record";
import { getAnalyticsSummary, listVisits, parseFilters } from "@/lib/analytics/queries";
import { requireAdmin } from "@/lib/auth/guard";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdmin();
  const params = await searchParams;
  const filters = parseFilters(params);
  const config = env();

  const [summary, visits] = await Promise.all([getAnalyticsSummary(filters), listVisits(filters)]);

  const pageHref = (page: number) => {
    const query = new URLSearchParams({ from: filters.from, to: filters.to, page: String(page) });
    if (filters.path) query.set("path", filters.path);
    return `/admin/analytics?${query}`;
  };

  const retentionNotice =
    params.notice === "retention"
      ? `Retention cleanup ran: ${Number(params.v) || 0} visits deleted, ${Number(params.i) || 0} IPs cleared, ${Number(params.l) || 0} locations deleted.`
      : undefined;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={
          <>
            Cookie-free page views. Repeat views of the same page by the same visitor within{" "}
            {DEDUPE_WINDOW_MS / 60000} minutes count once. Visitors who send Do Not Track or Global
            Privacy Control are not recorded.{" "}
            {!config.ANALYTICS_ENABLED && <strong className="text-accent-hover">Collection is currently disabled (ANALYTICS_ENABLED).</strong>}
          </>
        }
      />
      <Notice text={retentionNotice} />

      <form method="get" className="mb-8 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="from" className={labelClass}>From</label>
          <input id="from" name="from" type="date" defaultValue={filters.from} className={`${inputClass} mt-1.5`} />
        </div>
        <div>
          <label htmlFor="to" className={labelClass}>To</label>
          <input id="to" name="to" type="date" defaultValue={filters.to} className={`${inputClass} mt-1.5`} />
        </div>
        <div className="min-w-[12rem] flex-1 sm:flex-none">
          <label htmlFor="path" className={labelClass}>Page path</label>
          <input id="path" name="path" list="known-paths" placeholder="All pages" defaultValue={filters.path ?? ""} maxLength={200} className={`${inputClass} mt-1.5`} />
          <datalist id="known-paths">
            {summary.pages.map((page) => (
              <option key={page.label} value={page.label} />
            ))}
          </datalist>
        </div>
        <button type="submit" className={buttonPrimary}>Apply</button>
        <Link href="/admin/analytics" className={buttonSecondary}>Reset</Link>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Page views" value={summary.views} />
        <StatTile
          label="Unique visitors (approx.)"
          value={summary.visitorDays}
          note="Counted per day with a rotating anonymous id, then summed. Shared networks, VPNs and changing devices make this an estimate."
        />
        <StatTile label="Visit records in range" value={visits.total} note={`Range ${filters.from} → ${filters.to}${filters.path ? ` · ${filters.path}` : ""}`} />
      </div>

      <div className="mt-4">
        <DailyBars series={summary.series} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RankList title="Most viewed pages" rows={summary.pages} />
        <RankList title="Referrers" rows={summary.referrers} empty="No external referrers recorded." />
        <RankList title="Devices / browsers" rows={[...summary.devices, ...summary.browsers]} />
        <RankList title="Countries (approx., IP-based)" rows={summary.countries} empty="No location data — only available on Vercel." />
      </div>

      <h2 className="mt-12 mb-4 text-xs font-medium tracking-[0.2em] text-muted">VISIT RECORDS</h2>
      <VisitsTable rows={visits.rows} empty="No visits recorded for this range." />

      {visits.pages > 1 && (
        <nav aria-label="Visit records pages" className="mt-4 flex items-center justify-between text-xs">
          {filters.page > 1 ? (
            <Link href={pageHref(filters.page - 1)} className={buttonSecondary}>← Newer</Link>
          ) : <span />}
          <span className="text-muted">Page {filters.page} of {visits.pages}</span>
          {filters.page < visits.pages ? (
            <Link href={pageHref(filters.page + 1)} className={buttonSecondary}>Older →</Link>
          ) : <span />}
        </nav>
      )}

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="text-xs font-medium tracking-[0.2em] text-muted">RETENTION</h2>
        <p className="mt-3 max-w-prose text-xs leading-relaxed text-muted">
          Visits are deleted after {config.ANALYTICS_RETENTION_DAYS} days; stored IPs (mode:{" "}
          <code className="text-ink">{config.ANALYTICS_IP_MODE}</code>) are cleared after{" "}
          {config.ANALYTICS_IP_RETENTION_DAYS} days; consented coordinates after {config.LOCATION_RETENTION_DAYS} days.
          This runs daily via cron — you can also run it now.
        </p>
        <form action={runRetention} className="mt-4">
          <SubmitButton pendingLabel="Running…" className={buttonSecondary}>Run cleanup now</SubmitButton>
        </form>
      </section>
    </>
  );
}
