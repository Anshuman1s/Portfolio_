import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteProject, updateProject } from "@/app/admin/actions/projects";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title="Edit project"
        description={`Created ${project.createdAt.toLocaleDateString("en-GB")} · last updated ${project.updatedAt.toLocaleString("en-GB")}`}
        actions={<ConfirmDelete action={deleteProject.bind(null, project.id)} itemLabel={project.title} />}
      />
      <ProjectForm action={updateProject.bind(null, project.id)} initial={project} submitLabel="Save changes" />
    </>
  );
}
