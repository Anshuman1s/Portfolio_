import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteSkill, updateSkill } from "@/app/admin/actions/skills";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { PageHeader } from "@/components/admin/PageHeader";
import { SkillForm } from "@/components/admin/SkillForm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit skill" };

export default async function EditSkillPage({ params }: PageProps<"/admin/skills/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const [skill, others] = await Promise.all([
    db.skill.findUnique({ where: { id } }),
    db.skill.findMany({ where: { id: { not: id } }, select: { id: true, x: true, y: true } }),
  ]);
  if (!skill) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${skill.name}`}
        actions={<ConfirmDelete action={deleteSkill.bind(null, skill.id)} itemLabel={skill.name} />}
      />
      <SkillForm action={updateSkill.bind(null, skill.id)} initial={skill} others={others} submitLabel="Save changes" />
    </>
  );
}
