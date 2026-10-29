import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { moveSkill, toggleSkillPublished } from "@/app/admin/actions/skills";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { buttonGhost, buttonPrimary, panelClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { isSkillIconKey, skillIcons } from "@/lib/skill-icons";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsAdminPage({ searchParams }: PageProps<"/admin/skills">) {
  await requireAdmin();
  const { notice } = await searchParams;

  const skills = await db.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Skills"
        description="Order sets the reveal sequence in the About section — skills appear two at a time, top to bottom."
        actions={
          <Link href="/admin/skills/new" className={buttonPrimary}>
            <Plus size={14} aria-hidden /> Add skill
          </Link>
        }
      />
      <Notice notice={typeof notice === "string" ? notice : undefined} />

      {skills.length === 0 ? (
        <p className={`${panelClass} px-6 py-12 text-center text-xs text-muted`}>No skills yet.</p>
      ) : (
        <div className={`${panelClass} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-xs">
            <caption className="sr-only">Skills in reveal order</caption>
            <thead className="border-b border-ink/10 text-[11px] tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Order</th>
                <th scope="col" className="px-4 py-3 font-medium">Skill</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Position</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                const Icon = isSkillIconKey(skill.icon) ? skillIcons[skill.icon].Icon : null;
                return (
                  <tr key={skill.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-6 text-[10px] text-muted">#{index + 1}</span>
                        <form action={moveSkill.bind(null, skill.id, "up")}>
                          <button type="submit" disabled={index === 0} aria-label={`Move ${skill.name} up`} className={buttonGhost}>
                            <ArrowUp size={14} aria-hidden />
                          </button>
                        </form>
                        <form action={moveSkill.bind(null, skill.id, "down")}>
                          <button type="submit" disabled={index === skills.length - 1} aria-label={`Move ${skill.name} down`} className={buttonGhost}>
                            <ArrowDown size={14} aria-hidden />
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/skills/${skill.id}`} className="focus-ring inline-flex items-center gap-2.5 rounded-sm font-medium text-ink hover:underline hover:decoration-accent hover:underline-offset-4">
                        <span className="text-lg" style={{ color: skill.color }}>
                          {Icon ? <Icon aria-hidden /> : "?"}
                        </span>
                        {skill.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{skill.category ?? "—"}</td>
                    <td className="px-4 py-3 text-muted tabular-nums">
                      {skill.x}, {skill.y} · {skill.size}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${skill.published ? "bg-emerald-400 text-emerald-950" : "border border-ink/20 text-muted"}`}>
                        {skill.published ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <form action={toggleSkillPublished.bind(null, skill.id)}>
                          <button type="submit" aria-label={skill.published ? `Hide ${skill.name}` : `Publish ${skill.name}`} title={skill.published ? "Hide" : "Publish"} className={buttonGhost}>
                            {skill.published ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                          </button>
                        </form>
                        <Link href={`/admin/skills/${skill.id}`} aria-label={`Edit ${skill.name}`} title="Edit" className={buttonGhost}>
                          <Pencil size={14} aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
