import { purgeExpiredData } from "@/lib/analytics/retention";
import { safeEqual } from "@/lib/crypto";
import { env } from "@/lib/env";

/**
 * Daily retention job (see vercel.json). Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await purgeExpiredData();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
