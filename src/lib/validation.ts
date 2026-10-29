import { z } from "zod";
import { skillIconKeys } from "./skill-icons";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

/** External links must be https:// — rejects javascript:, data:, http:, etc. */
const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => value || null)
  .refine((value) => {
    if (value === null) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Must be a valid https:// URL");

/** A site path under /public (e.g. /images/projects/app.png) or an https URL. */
const imageSource = z
  .string()
  .trim()
  .max(500)
  .transform((value) => value || null)
  .refine((value) => {
    if (value === null) return true;
    if (value.startsWith("/")) {
      return /^\/(?!\/)[\w\-./]+\.(png|jpe?g|webp|avif|gif)$/i.test(value) && !value.includes("..");
    }
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use a path like /images/projects/app.png or an https:// image URL");

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only");

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.null(), z.undefined()])
  .transform((value) => value === "on" || value === "true");

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  slug,
  description: z.string().trim().min(1, "Short description is required").max(300),
  longDescription: optionalText(5000),
  imageUrl: imageSource,
  imageAlt: optionalText(200),
  technologies: z
    .string()
    .max(600)
    .transform((value) =>
      [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))],
    )
    .pipe(z.array(z.string().max(40, "Each technology tag must be 40 characters or fewer")).max(15)),
  githubUrl: httpsUrl,
  liveUrl: httpsUrl,
  published: checkbox,
  featured: checkbox,
  sortOrder: z.coerce.number().int().min(-1000).max(1000).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  slug,
  icon: z.enum(skillIconKeys, { message: "Choose an icon from the list" }),
  category: optionalText(40),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #3178c6"),
  // Kept inside the field so icons and tooltips are never clipped.
  x: z.coerce.number().min(6, "X must be between 6 and 94").max(94, "X must be between 6 and 94"),
  y: z.coerce.number().min(6, "Y must be between 6 and 94").max(94, "Y must be between 6 and 94"),
  size: z.enum(["sm", "md", "lg"]),
  sortOrder: z.coerce.number().int().min(-1000).max(1000).default(0),
  published: checkbox,
});

export type SkillInput = z.infer<typeof skillSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(256),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(256),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(256, "Use 256 characters or fewer"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from the current one",
  });

/** First error per field, for form display. */
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
