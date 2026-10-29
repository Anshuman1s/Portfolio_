"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { purgeExpiredData } from "@/lib/analytics/retention";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export async function runRetention() {
  await requireAdmin();
  const result = await purgeExpiredData();
  const params = new URLSearchParams({
    notice: "retention",
    v: String(result.visitsDeleted),
    i: String(result.ipsCleared),
    l: String(result.locationsDeleted),
  });
  redirect(`/admin/analytics?${params}`);
}

/** Delete one visitor's consented coordinates (e.g. on a deletion request). */
export async function deleteLocation(consentId: string, visitId: string) {
  await requireAdmin();
  const id = z.string().min(1).max(40).parse(consentId);
  await db.locationConsent.deleteMany({ where: { id } });
  redirect(`/admin/analytics/visits/${encodeURIComponent(z.string().max(40).parse(visitId))}?notice=location-deleted`);
}
