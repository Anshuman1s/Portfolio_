import type { Metadata } from "next";
import { createProject } from "@/app/admin/actions/projects";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Add project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add project" description="New projects are saved as drafts unless you tick Published." />
      <ProjectForm action={createProject} submitLabel="Create project" />
    </>
  );
}
