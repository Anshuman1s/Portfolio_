import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { moveProject, toggleFeatured, togglePublished } from "@/app/admin/actions/projects";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { buttonGhost, buttonPrimary, panelClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdminPage({ searchParams }: PageProps<"/admin/projects">) {
  await requireAdmin();
  const { notice } = await searchParams;

  const projects = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
    select: { id: true, title: true, slug: true, published: true, featured: true, sortOrder: true, updatedAt: true },
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Public order: featured first, then sort order, then most recently published. Use the arrows to reorder."
        actions={
          <Link href="/admin/projects/new" className={buttonPrimary}>
            <Plus size={14} aria-hidden /> Add project
          </Link>
        }
      />
      <Notice notice={typeof notice === "string" ? notice : undefined} />

      {projects.length === 0 ? (
        <p className={`${panelClass} px-6 py-12 text-center text-xs text-muted`}>
          No projects yet. <Link href="/admin/projects/new" className="text-ink underline decoration-accent underline-offset-4">Add your first project</Link>.
        </p>
      ) : (
        <div className={`${panelClass} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-xs">
            <caption className="sr-only">Projects in admin order</caption>
            <thead className="border-b border-ink/10 text-[11px] tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Order</th>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <form action={moveProject.bind(null, project.id, "up")}>
                        <button type="submit" disabled={index === 0} aria-label={`Move ${project.title} up`} className={buttonGhost}>
                          <ArrowUp size={14} aria-hidden />
                        </button>
                      </form>
                      <form action={moveProject.bind(null, project.id, "down")}>
                        <button type="submit" disabled={index === projects.length - 1} aria-label={`Move ${project.title} down`} className={buttonGhost}>
                          <ArrowDown size={14} aria-hidden />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/projects/${project.id}`} className="focus-ring rounded-sm font-medium text-ink hover:underline hover:decoration-accent hover:underline-offset-4">
                      {project.title}
                    </Link>
                    <span className="mt-0.5 block text-[11px] text-muted">/{project.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${project.published ? "bg-emerald-400 text-emerald-950" : "border border-ink/20 text-muted"}`}>
                        {project.published ? "Published" : "Draft"}
                      </span>
                      {project.featured && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-hover">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{project.updatedAt.toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <form action={togglePublished.bind(null, project.id)}>
                        <button type="submit" aria-label={project.published ? `Unpublish ${project.title}` : `Publish ${project.title}`} title={project.published ? "Unpublish" : "Publish"} className={buttonGhost}>
                          {project.published ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                        </button>
                      </form>
                      <form action={toggleFeatured.bind(null, project.id)}>
                        <button type="submit" aria-label={project.featured ? `Unfeature ${project.title}` : `Feature ${project.title}`} title={project.featured ? "Unfeature" : "Feature"} className={buttonGhost}>
                          <Star size={14} aria-hidden className={project.featured ? "fill-accent text-accent-hover" : ""} />
                        </button>
                      </form>
                      <Link href={`/admin/projects/${project.id}`} aria-label={`Edit ${project.title}`} title="Edit" className={buttonGhost}>
                        <Pencil size={14} aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
