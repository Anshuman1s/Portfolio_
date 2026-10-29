// Shared by the admin form (client) and the upload action / image route (server).

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;

const EXT_BY_TYPE = { "image/png": "png", "image/jpeg": "jpg" } as const;
export type ImageType = keyof typeof EXT_BY_TYPE;

const UPLOADED_PATH = /^\/project-images\/([a-z0-9]{1,40})\.(png|jpg)$/;

export const uploadedImagePath = (id: string, type: ImageType) =>
  `/project-images/${id}.${EXT_BY_TYPE[type]}`;

/** The ProjectImage id behind an uploaded screenshot URL, or null for any other source. */
export function uploadedImageId(url: string | null | undefined) {
  return url ? (UPLOADED_PATH.exec(url)?.[1] ?? null) : null;
}

/** Parses "<id>.<ext>" from the image route; the extension must match the stored type. */
export function parseImageFile(file: string): { id: string; type: ImageType } | null {
  const match = UPLOADED_PATH.exec(`/project-images/${file}`);
  if (!match) return null;
  return { id: match[1], type: match[2] === "png" ? "image/png" : "image/jpeg" };
}

/** Detects PNG / JPEG from magic bytes, so a renamed file of another type is rejected. */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= png.length && png.every((byte, i) => bytes[i] === byte)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}
