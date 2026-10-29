import type { NextRequest } from "next/server";
import { getAdminForApi } from "@/lib/auth/guard";
import { listVisits, parseFilters } from "@/lib/analytics/queries";

/** Paginated visit records (JSON). Admin only; coordinates are never included. */
export async function GET(request: NextRequest) {
  const admin = await getAdminForApi();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const visits = await listVisits(filters);

  return Response.json(
    { filters: { from: filters.from, to: filters.to, path: filters.path, page: filters.page }, ...visits },
    { headers: { "Cache-Control": "no-store" } },
  );
}
