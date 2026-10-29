"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { SkillFormState } from "@/app/admin/actions/skills";
import { isSkillIconKey, skillIconKeys, skillIcons } from "@/lib/skill-icons";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { buttonSecondary, inputClass } from "./styles";

export type SkillFormValues = {
  name: string;
  slug: string;
  icon: string;
  category: string | null;
  color: string;
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
  sortOrder: number;
  published: boolean;
};

type SkillFormProps = {
  action: (state: SkillFormState, formData: FormData) => Promise<SkillFormState>;
  initial?: SkillFormValues;
  /** Other skills' positions, drawn faintly in the preview to avoid collisions. */
  others: { id: string; x: number; y: number }[];
  submitLabel: string;
};

const clamp = (value: number) => Math.min(94, Math.max(6, Number.isFinite(value) ? value : 50));

export function SkillForm({ action, initial, others, submitLabel }: SkillFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.errors ?? {};

  const [icon, setIcon] = useState(initial?.icon ?? "react");
  const [color, setColor] = useState(initial?.color ?? "#482033");
  const [x, setX] = useState(initial?.x ?? 50);
  const [y, setY] = useState(initial?.y ?? 50);
  const Preview = isSkillIconKey(icon) ? skillIcons[icon].Icon : null;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {errors.form && (
        <p role="alert" className="text-xs font-medium text-accent-hover">
          {errors.form}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="grid content-start gap-5 md:grid-cols-2">
          <Field id="name" label="Name" error={errors.name}>
            <input id="name" name="name" defaultValue={initial?.name} maxLength={40} required aria-invalid={Boolean(errors.name)} aria-describedby="name-desc" className={inputClass} />
          </Field>
          <Field id="slug" label="Slug" error={errors.slug} hint="Leave blank to generate from the name.">
            <input id="slug" name="slug" defaultValue={initial?.slug} maxLength={80} aria-invalid={Boolean(errors.slug)} aria-describedby="slug-desc" className={inputClass} />
          </Field>
          <Field id="icon" label="Icon" error={errors.icon} hint="Only icons in the built-in allowlist can be used.">
            <select id="icon" name="icon" value={icon} onChange={(event) => setIcon(event.target.value)} aria-invalid={Boolean(errors.icon)} aria-describedby="icon-desc" className={inputClass}>
              {skillIconKeys.map((key) => (
                <option key={key} value={key}>
                  {skillIcons[key].label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="category" label="Category (optional)" error={errors.category}>
            <input id="category" name="category" defaultValue={initial?.category ?? ""} maxLength={40} placeholder="Frontend, Backend…" aria-describedby="category-desc" className={inputClass} />
          </Field>
          <Field id="color" label="Hover colour" error={errors.color} hint="Brand or muted colour, shown on hover / focus.">
            <div className="flex gap-2">
              <input type="color" aria-label="Pick colour" value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#482033"} onChange={(event) => setColor(event.target.value)} className="h-[42px] w-12 shrink-0 cursor-pointer rounded-lg border border-ink/15 bg-transparent" />
              <input id="color" name="color" value={color} onChange={(event) => setColor(event.target.value)} maxLength={7} aria-invalid={Boolean(errors.color)} aria-describedby="color-desc" className={inputClass} />
            </div>
          </Field>
          <Field id="size" label="Icon size" error={errors.size}>
            <select id="size" name="size" defaultValue={initial?.size ?? "md"} aria-describedby="size-desc" className={inputClass}>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </Field>
          <Field id="x" label="Position X (%)" error={errors.x} hint="6–94, left to right.">
            <input id="x" name="x" type="number" min={6} max={94} step={0.5} value={x} onChange={(event) => setX(Number(event.target.value))} aria-invalid={Boolean(errors.x)} aria-describedby="x-desc" className={inputClass} />
          </Field>
          <Field id="y" label="Position Y (%)" error={errors.y} hint="6–94, top to bottom.">
            <input id="y" name="y" type="number" min={6} max={94} step={0.5} value={y} onChange={(event) => setY(Number(event.target.value))} aria-invalid={Boolean(errors.y)} aria-describedby="y-desc" className={inputClass} />
          </Field>
          <Field id="sortOrder" label="Sort order" error={errors.sortOrder} hint="Sets the reveal order (two at a time).">
            <input id="sortOrder" name="sortOrder" type="number" min={-1000} max={1000} step={1} defaultValue={initial?.sortOrder ?? 0} aria-describedby="sortOrder-desc" className={inputClass} />
          </Field>
          <label className="flex items-start gap-3 self-end pb-3 text-xs text-ink">
            <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="mt-0.5 size-4 accent-emerald-400" />
            <span>
              Published
              <span className="mt-1 block text-[11px] text-muted">Shown in the About constellation.</span>
            </span>
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-ink">Position preview</p>
          <div aria-hidden="true" className="relative mt-1.5 aspect-[1/1.05] w-full rounded-2xl border border-dashed border-ink/15">
            {others.map((other) => (
              <span key={other.id} className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/15" style={{ left: `${other.x}%`, top: `${other.y}%` }} />
            ))}
            <span className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream p-1.5 text-2xl ring-2 ring-accent" style={{ left: `${clamp(x)}%`, top: `${clamp(y)}%`, color }}>
              {Preview && <Preview />}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted">Grey dots are other skills.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-6">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/admin/skills" className={buttonSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
