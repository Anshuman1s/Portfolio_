import type { Metadata } from "next";
import Link from "next/link";
import { StatTile } from "@/components/admin/charts";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { panelClass } from "@/components/admin/styles";
import { VisitsTable } from "@/components/admin/VisitsTable";
import { listVisits, parseFilters } from "@/lib/analytics/queries";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { notice } = await searchParams;

  const last30 = parseFilters({});
  const [projectCount, publishedCount, skillCount, totalVisits, uniques, recent, latestProject] =
    await Promise.all([
      db.project.count(),
      db.project.count({ where: { published: true } }),
      db.skill.count(),
      db.visitEvent.count(),
      db.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT "visitorHash")::int AS count FROM "VisitEvent"
        WHERE "createdAt" >= ${last30.range.gte}`,
      listVisits({ ...last30, page: 1 }),
      db.project.findFirst({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { id: true, title: true, published: true, featured: true, createdAt: true, updatedAt: true },
      }),
    ]);

  return (
    <>
      <PageHeader title="Overview" description="Live figures from the database." />
      <Notice notice={typeof notice === "string" ? notice : undefined} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Projects" value={projectCount} note={`${publishedCount} published`} />
        <StatTile label="Skills" value={skillCount} />
        <StatTile label="Recorded page views" value={totalVisits} note="All time, within the retention window." />
        <StatTile
          label="Unique visitors (approx., 30 days)"
          value={uniques[0]?.count ?? 0}
          note="Daily anonymous ids, summed — an estimate, not an exact count."
        />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium tracking-[0.2em] text-muted">LATEST PROJECT</h2>
        {latestProject ? (
          <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4 p-5 text-xs`}>
            <div>
              <p className="font-logo text-xl font-bold tracking-[-0.03em] text-ink">{latestProject.title}</p>
              <p className="mt-1 text-muted">
                Added {latestProject.createdAt.toLocaleDateString("en-GB")} ·{" "}
                {latestProject.published ? "Published" : "Draft"}
                {latestProject.featured ? " · Featured" : ""}
              </p>
            </div>
            <Link href={`/admin/projects/${latestProject.id}`} className="focus-ring rounded-sm text-ink underline decoration-accent underline-offset-4">
              Edit project
            </Link>
          </div>
        ) : (
          <p className={`${panelClass} p-5 text-xs text-muted`}>
            No projects yet. <Link href="/admin/projects/new" className="text-ink underline decoration-accent underline-offset-4">Add one</Link>.
          </p>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xs font-medium tracking-[0.2em] text-muted">RECENT VISITS</h2>
          <Link href="/admin/analytics" className="focus-ring rounded-sm text-xs text-ink underline decoration-accent underline-offset-4">
            All analytics
          </Link>
        </div>
        <VisitsTable rows={recent.rows.slice(0, 8)} empty="No visits recorded in the last 30 days." />
      </section>
    </>
  );
}
