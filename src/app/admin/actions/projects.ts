"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guard";
import { PROJECTS_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { fieldErrors, projectSchema, slugify } from "@/lib/validation";

export type ProjectFormState = { errors?: Record<string, string> };

const idSchema = z.string().min(1).max(40);

function parseProject(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();
  return projectSchema.safeParse({
    title,
    slug: rawSlug || slugify(title),
    description: formData.get("description") ?? "",
    longDescription: formData.get("longDescription") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    technologies: formData.get("technologies") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
    liveUrl: formData.get("liveUrl") ?? "",
    published: formData.get("published"),
    featured: formData.get("featured"),
    sortOrder: formData.get("sortOrder") || 0,
  });
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProject(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await db.project.create({
      data: { ...parsed.data, publishedAt: parsed.data.published ? new Date() : null },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { errors: { slug: "That slug is already in use" } };
    throw error;
  }

  updateTag(PROJECTS_TAG);
  redirect("/admin/projects?notice=created");
}

export async function updateProject(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const projectId = idSchema.parse(id);
  const parsed = parseProject(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const existing = await db.project.findUnique({
    where: { id: projectId },
    select: { publishedAt: true },
  });
  if (!existing) return { errors: { form: "This project no longer exists" } };

  try {
    await db.project.update({
      where: { id: projectId },
      data: {
        ...parsed.data,
        // First publish stamps the date used for "latest" ordering.
        publishedAt: parsed.data.published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { errors: { slug: "That slug is already in use" } };
    throw error;
  }

  updateTag(PROJECTS_TAG);
  redirect("/admin/projects?notice=updated");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await db.project.delete({ where: { id: idSchema.parse(id) } });
  updateTag(PROJECTS_TAG);
  redirect("/admin/projects?notice=deleted");
}

export async function togglePublished(id: string) {
  await requireAdmin();
  const projectId = idSchema.parse(id);
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { published: true, publishedAt: true },
  });
  await db.project.update({
    where: { id: projectId },
    data: {
      published: !project.published,
      publishedAt: !project.published ? (project.publishedAt ?? new Date()) : project.publishedAt,
    },
  });
  updateTag(PROJECTS_TAG);
}

export async function toggleFeatured(id: string) {
  await requireAdmin();
  const projectId = idSchema.parse(id);
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { featured: true },
  });
  await db.project.update({ where: { id: projectId }, data: { featured: !project.featured } });
  updateTag(PROJECTS_TAG);
}

/** Swap with the neighbour in the admin list, then renumber sortOrder 10, 20, 30… */
export async function moveProject(id: string, direction: "up" | "down") {
  await requireAdmin();
  const projectId = idSchema.parse(id);
  const dir = z.enum(["up", "down"]).parse(direction);

  const ordered = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = ordered.findIndex((project) => project.id === projectId);
  const target = dir === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ordered.length) return;

  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  await db.$transaction(
    ordered.map((project, position) =>
      db.project.update({ where: { id: project.id }, data: { sortOrder: (position + 1) * 10 } }),
    ),
  );
  updateTag(PROJECTS_TAG);
}
