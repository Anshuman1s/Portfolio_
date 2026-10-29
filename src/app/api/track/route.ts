import { after } from "next/server";
import { z } from "zod";
import { recordVisit } from "@/lib/analytics/record";
import { isSameOrigin } from "@/lib/request";

const bodySchema = z.object({
  path: z
    .string()
    .max(200)
    .regex(/^\/[^?#]*$/)
    .refine((path) => !path.startsWith("/admin") && !path.startsWith("/api")),
  referrer: z.string().max(1000).nullable(),
});

/** Reduce a referrer URL to its hostname; drop internal and non-http referrers. */
function referrerHost(referrer: string | null, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.host === ownHost ? null : url.hostname.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // Always 204: tracking is best-effort and reveals nothing to the caller.
  const noContent = new Response(null, { status: 204 });
  if (!isSameOrigin(request)) return noContent;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return noContent;
  }

  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  // Write after responding so analytics never slows (or breaks) the page.
  after(async () => {
    try {
      await recordVisit({ path: body.path, referrer: referrerHost(body.referrer, host), headers });
    } catch (error) {
      console.error("analytics: failed to record visit", error instanceof Error ? error.message : "");
    }
  });

  return noContent;
}
