import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLocation } from "@/app/admin/actions/analytics";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { buttonSecondary, panelClass } from "@/components/admin/styles";
import { approxPlace, formatTime } from "@/components/admin/VisitsTable";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Visit detail" };

/** Protected detail view — the only place stored IPs and consented coordinates are shown. */
export default async function VisitDetailPage({ params, searchParams }: PageProps<"/admin/analytics/visits/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { notice } = await searchParams;

  const visit = await db.visitEvent.findUnique({ where: { id }, include: { location: true } });
  if (!visit) notFound();

  const rows: [string, string][] = [
    ["Time", formatTime(visit.createdAt)],
    ["Page", visit.path],
    ["Referrer", visit.referrerHost ?? "Direct / none"],
    ["Visitor id (daily, anonymous)", visit.visitorHash],
    ["Stored IP", visit.ipAddress ?? "Not stored (cleared by retention, or IP mode is none)"],
    ["Approx. location (IP-based)", approxPlace(visit)],
    ["Device", visit.device ?? "—"],
    ["Browser", visit.browser ?? "—"],
  ];

  return (
    <>
      <PageHeader
        title="Visit detail"
        actions={<Link href="/admin/analytics" className={buttonSecondary}>← Back to analytics</Link>}
      />
      <Notice notice={typeof notice === "string" ? notice : undefined} />

      <dl className={`${panelClass} divide-y divide-ink/5 text-xs`}>
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_1fr]">
            <dt className="text-muted">{label}</dt>
            <dd className="break-all text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-xs font-medium tracking-[0.2em] text-muted">CONSENTED LOCATION</h2>
        {visit.location ? (
          <div className={`${panelClass} mt-4 space-y-4 p-5 text-xs`}>
            <p className="text-ink">
              {visit.location.latitude.toFixed(2)}, {visit.location.longitude.toFixed(2)}{" "}
              <span className="text-muted">
                (rounded to ~1 km
                {visit.location.accuracyMeters !== null ? `; browser accuracy ±${visit.location.accuracyMeters} m` : ""}
                ) · consented {formatTime(visit.location.consentedAt)}
              </span>
            </p>
            <ConfirmDelete
              action={deleteLocation.bind(null, visit.location.id, visit.id)}
              itemLabel="this visitor's coordinates"
            />
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">None — this visitor did not share a location.</p>
        )}
      </section>
    </>
  );
}
