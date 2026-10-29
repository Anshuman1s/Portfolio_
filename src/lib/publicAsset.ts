import { existsSync } from "node:fs";
import path from "node:path";

// Server-only check for an optional file under /public (e.g. "/resume.pdf").
export function publicAssetExists(publicPath: string) {
  return existsSync(path.join(process.cwd(), "public", publicPath));
}
