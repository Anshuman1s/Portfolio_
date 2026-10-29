import { MapPin } from "lucide-react";
import Link from "next/link";
import type { listVisits } from "@/lib/analytics/queries";
import { panelClass } from "./styles";

type Row = Awaited<ReturnType<typeof listVisits>>["rows"][number];

/** Table view hides the last part of any stored IP; the detail page shows the stored value. */
export function maskIp(ip: string | null) {
  if (!ip) return "—";
  if (ip.includes(".")) return ip.split(".").slice(0, 3).concat("x").join(".");
  return `${ip.split(":").filter(Boolean).slice(0, 3).join(":")}::x`;
}

export const formatTime = (date: Date) =>
  date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

export function approxPlace(row: { city: string | null; region: string | null; country: string | null }) {
  const parts = [row.city, row.region, row.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function VisitsTable({ rows, empty }: { rows: Row[]; empty: string }) {
  if (rows.length === 0) {
    return <p className={`${panelClass} px-6 py-10 text-center text-xs text-muted`}>{empty}</p>;
  }

  return (
    <div className={`${panelClass} overflow-x-auto`}>
      <table className="w-full min-w-[860px] text-left text-[11px]">
        <caption className="sr-only">Visit records, newest first</caption>
        <thead className="border-b border-ink/10 text-[10px] tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Time</th>
            <th scope="col" className="px-4 py-3 font-medium">Page</th>
            <th scope="col" className="px-4 py-3 font-medium">Referrer</th>
            <th scope="col" className="px-4 py-3 font-medium">Visitor</th>
            <th scope="col" className="px-4 py-3 font-medium">IP (masked)</th>
            <th scope="col" className="px-4 py-3 font-medium">Approx. location</th>
            <th scope="col" className="px-4 py-3 font-medium">Device</th>
            <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Details</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-ink/5 last:border-0">
              <td className="px-4 py-2.5 whitespace-nowrap text-muted">{formatTime(row.createdAt)}</td>
              <td className="max-w-[12rem] truncate px-4 py-2.5 text-ink" title={row.path}>{row.path}</td>
              <td className="max-w-[10rem] truncate px-4 py-2.5 text-muted">{row.referrerHost ?? "Direct / none"}</td>
              <td className="px-4 py-2.5 font-mono text-muted">{row.visitorHash.slice(0, 8)}</td>
              <td className="px-4 py-2.5 font-mono text-muted">{maskIp(row.ipAddress)}</td>
              <td className="px-4 py-2.5 text-muted">{approxPlace(row)}</td>
              <td className="px-4 py-2.5 text-muted">{[row.device, row.browser].filter(Boolean).join(" · ") || "—"}</td>
              <td className="px-4 py-2.5 text-right">
                <Link href={`/admin/analytics/visits/${row.id}`} className="focus-ring inline-flex items-center gap-1 rounded-sm text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-accent">
                  {row.hasPreciseLocation && <MapPin size={12} aria-label="Has consented location" className="text-accent-hover" />}
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
