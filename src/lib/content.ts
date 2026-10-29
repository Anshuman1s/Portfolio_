import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export const PROJECTS_TAG = "projects";
export const SKILLS_TAG = "skills";

/**
 * Public project order (deterministic):
 *   1. featured first
 *   2. then sortOrder ascending
 *   3. then most recently published
 *   4. then id, as a final tiebreak
 * With no featured project and equal sortOrder, the newest project leads.
 */
/** Render-time guard (input is also validated on write): only https links survive. */
function safeHttps(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

const safeImage = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : safeHttps(value);

export async function getPublishedProjects() {
  "use cache";
  cacheLife("max");
  cacheTag(PROJECTS_TAG);

  const projects = await db.project.findMany({
    where: { published: true },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { publishedAt: { sort: "desc", nulls: "last" } },
      { id: "asc" },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      imageAlt: true,
      technologies: true,
      githubUrl: true,
      liveUrl: true,
      featured: true,
    },
  });

  return projects.map((project) => ({
    ...project,
    imageUrl: safeImage(project.imageUrl),
    githubUrl: safeHttps(project.githubUrl),
    liveUrl: safeHttps(project.liveUrl),
  }));
}

export type PublicProject = Awaited<ReturnType<typeof getPublishedProjects>>[number];

export async function getPublishedSkills() {
  "use cache";
  cacheLife("max");
  cacheTag(SKILLS_TAG);

  return db.skill.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true, slug: true, name: true, icon: true, color: true, x: true, y: true, size: true },
  });
}

export type PublicSkill = Awaited<ReturnType<typeof getPublishedSkills>>[number];
