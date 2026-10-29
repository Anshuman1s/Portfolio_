import { z } from "zod";
import { recordLocationConsent, withdrawLocationConsent } from "@/lib/analytics/record";
import { env } from "@/lib/env";
import { isSameOrigin } from "@/lib/request";

const consentSchema = z.object({
  consent: z.literal(true),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(1_000_000).nullable(),
});

const withdrawSchema = z.object({ token: z.string().min(20).max(128) });

const json = (body: unknown, status = 200) => Response.json(body, { status });

function guard(request: Request) {
  if (!env().NEXT_PUBLIC_PRECISE_LOCATION_ENABLED) return json({ error: "Not available" }, 404);
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  return null;
}

/** Store coordinates — only called by the client after explicit consent. */
export async function POST(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const parsed = consentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid location" }, 400);

  try {
    const token = await recordLocationConsent({
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracy: parsed.data.accuracy,
      headers: request.headers,
    });
    // The token is the visitor's only handle for later deletion; nothing else is returned.
    return json({ token });
  } catch {
    return json({ error: "Could not save location" }, 500);
  }
}

/** Withdraw consent and delete stored coordinates. */
export async function DELETE(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const parsed = withdrawSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request" }, 400);

  try {
    const deleted = await withdrawLocationConsent(parsed.data.token);
    return json({ deleted });
  } catch {
    return json({ error: "Could not delete location" }, 500);
  }
}
