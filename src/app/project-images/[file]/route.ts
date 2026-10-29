import { db } from "@/lib/db";
import { parseImageFile } from "@/lib/project-images";

/** Serves admin-uploaded screenshots. Ids are never reused, so responses are cached for a year. */
export async function GET(_request: Request, ctx: RouteContext<"/project-images/[file]">) {
  const { file } = await ctx.params;
  const parsed = parseImageFile(file);
  if (!parsed) return new Response("Not found", { status: 404 });

  const image = await db.projectImage.findUnique({
    where: { id: parsed.id },
    select: { mimeType: true, data: true },
  });
  if (!image || image.mimeType !== parsed.type) return new Response("Not found", { status: 404 });

  return new Response(image.data, {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.data.byteLength),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
