import type { Metadata } from "next";
import { createSkill } from "@/app/admin/actions/skills";
import { PageHeader } from "@/components/admin/PageHeader";
import { SkillForm } from "@/components/admin/SkillForm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Add skill" };

export default async function NewSkillPage() {
  await requireAdmin();
  const [others, last] = await Promise.all([
    db.skill.findMany({ select: { id: true, x: true, y: true } }),
    db.skill.aggregate({ _max: { sortOrder: true } }),
  ]);

  return (
    <>
      <PageHeader title="Add skill" description="Published skills join the About constellation, revealed in pairs by sort order." />
      <SkillForm
        action={createSkill}
        others={others}
        initial={{
          name: "",
          slug: "",
          icon: "react",
          category: null,
          color: "#482033",
          x: 50,
          y: 50,
          size: "md",
          sortOrder: (last._max.sortOrder ?? -1) + 1,
          published: true,
        }}
        submitLabel="Create skill"
      />
    </>
  );
}
