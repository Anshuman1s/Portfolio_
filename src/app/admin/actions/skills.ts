"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guard";
import { SKILLS_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { fieldErrors, skillSchema, slugify } from "@/lib/validation";

export type SkillFormState = { errors?: Record<string, string> };

const idSchema = z.string().min(1).max(40);

function parseSkill(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();
  return skillSchema.safeParse({
    name,
    slug: rawSlug || slugify(name),
    icon: formData.get("icon"),
    category: formData.get("category") ?? "",
    color: formData.get("color"),
    x: formData.get("x"),
    y: formData.get("y"),
    size: formData.get("size"),
    sortOrder: formData.get("sortOrder") || 0,
    published: formData.get("published"),
  });
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function createSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireAdmin();
  const parsed = parseSkill(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await db.skill.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { errors: { slug: "That slug is already in use" } };
    throw error;
  }
  updateTag(SKILLS_TAG);
  redirect("/admin/skills?notice=created");
}

export async function updateSkill(
  id: string,
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireAdmin();
  const skillId = idSchema.parse(id);
  const parsed = parseSkill(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await db.skill.update({ where: { id: skillId }, data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { errors: { slug: "That slug is already in use" } };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { errors: { form: "This skill no longer exists" } };
    }
    throw error;
  }
  updateTag(SKILLS_TAG);
  redirect("/admin/skills?notice=updated");
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await db.skill.delete({ where: { id: idSchema.parse(id) } });
  updateTag(SKILLS_TAG);
  redirect("/admin/skills?notice=deleted");
}

export async function toggleSkillPublished(id: string) {
  await requireAdmin();
  const skillId = idSchema.parse(id);
  const skill = await db.skill.findUniqueOrThrow({ where: { id: skillId }, select: { published: true } });
  await db.skill.update({ where: { id: skillId }, data: { published: !skill.published } });
  updateTag(SKILLS_TAG);
}

/** Reorder (this also changes the pair the skill is revealed in). */
export async function moveSkill(id: string, direction: "up" | "down") {
  await requireAdmin();
  const skillId = idSchema.parse(id);
  const dir = z.enum(["up", "down"]).parse(direction);

  const ordered = await db.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = ordered.findIndex((skill) => skill.id === skillId);
  const target = dir === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ordered.length) return;

  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  await db.$transaction(
    ordered.map((skill, position) =>
      db.skill.update({ where: { id: skill.id }, data: { sortOrder: position } }),
    ),
  );
  updateTag(SKILLS_TAG);
}
