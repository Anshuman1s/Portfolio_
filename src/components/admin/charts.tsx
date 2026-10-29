import { panelClass } from "./styles";

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * Single-series daily bars (page views). One ink colour, 4px rounded tops on a
 * shared baseline, 2px gaps, a per-bar tooltip on hover and keyboard focus.
 * The hit target is the full column, larger than the bar itself.
 */
export function DailyBars({ series }: { series: { day: string; views: number }[] }) {
  const max = Math.max(1, ...series.map((point) => point.views));
  const ticks = [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]];

  return (
    <figure className={`${panelClass} p-5`}>
      <figcaption className="mb-4 text-xs font-medium text-ink">Page views per day (UTC)</figcaption>
      <div className="flex gap-3">
        <div className="flex h-48 flex-col justify-between text-right text-[10px] text-muted tabular-nums" aria-hidden="true">
          <span>{max}</span>
          <span>0</span>
        </div>
        <div className="relative min-w-0 flex-1">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-ink/10" />
          <ul className="flex h-48 items-end gap-[2px] border-b border-ink/20" aria-label="Daily page views">
            {series.map((point) => (
              <li key={point.day} className="group relative flex h-full min-w-0 flex-1 items-end">
                <span
                  tabIndex={0}
                  aria-label={`${formatDay(point.day)}: ${point.views} page view${point.views === 1 ? "" : "s"}`}
                  className="focus-ring flex h-full w-full items-end rounded-sm"
                >
                  <span
                    className="w-full rounded-t-[4px] bg-emerald-400 transition-colors group-hover:bg-emerald-600 group-focus-within:bg-emerald-600"
                    style={{ height: point.views === 0 ? 0 : `max(2px, ${(point.views / max) * 100}%)` }}
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md bg-emerald-400 px-2 py-1 text-[10px] whitespace-nowrap text-emerald-950 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                >
                  {formatDay(point.day)} · {point.views}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between text-[10px] text-muted" aria-hidden="true">
            {ticks.map((tick, i) => (
              <span key={`${tick?.day}-${i}`}>{tick ? formatDay(tick.day) : ""}</span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Ranked list with a proportional bar; values in text ink, the bar carries no meaning alone. */
export function RankList({
  title,
  rows,
  empty = "No data for this range.",
}: {
  title: string;
  rows: { label: string; count: number }[];
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className={`${panelClass} p-5`}>
      <h2 className="mb-4 text-xs font-medium text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[11px] text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-[11px]">
                <span className="truncate text-ink" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 text-muted tabular-nums">{row.count}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-ink/5">
                <div className="h-full rounded-full bg-ink/60" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatTile({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className={`${panelClass} p-5`}>
      <p className="text-[11px] tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-logo text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums">{value}</p>
      {note && <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{note}</p>}
    </div>
  );
}
