"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ProjectFormState } from "@/app/admin/actions/projects";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { buttonSecondary, inputClass } from "./styles";

export type ProjectFormValues = {
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  published: boolean;
  featured: boolean;
  sortOrder: number;
};

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  initial?: ProjectFormValues;
  submitLabel: string;
};

export function ProjectForm({ action, initial, submitLabel }: ProjectFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.errors ?? {};

  const text = (name: keyof ProjectFormValues, props: { type?: string; maxLength: number; placeholder?: string; required?: boolean }) => {
    const value = initial?.[name];
    return (
      <input
        id={name}
        name={name}
        type={props.type ?? "text"}
        defaultValue={Array.isArray(value) ? value.join(", ") : (value ?? "").toString()}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={`${name}-desc`}
        className={inputClass}
      />
    );
  };

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {errors.form && (
        <p role="alert" className="text-xs font-medium text-accent-hover">
          {errors.form}
        </p>
      )}

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-[11px] font-medium tracking-[0.2em] text-muted">DETAILS</legend>
        <Field id="title" label="Title" error={errors.title}>
          {text("title", { maxLength: 120, required: true })}
        </Field>
        <Field id="slug" label="Slug" error={errors.slug} hint="Leave blank to generate from the title.">
          {text("slug", { maxLength: 80, placeholder: "my-project" })}
        </Field>
        <Field id="description" label="Short description" error={errors.description} hint="One or two sentences — shown on the card." className="md:col-span-2">
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            required
            defaultValue={initial?.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby="description-desc"
            className={inputClass}
          />
        </Field>
        <Field id="longDescription" label="Full description (optional)" error={errors.longDescription} className="md:col-span-2">
          <textarea
            id="longDescription"
            name="longDescription"
            rows={5}
            maxLength={5000}
            defaultValue={initial?.longDescription ?? ""}
            aria-invalid={Boolean(errors.longDescription)}
            aria-describedby="longDescription-desc"
            className={inputClass}
          />
        </Field>
        <Field id="technologies" label="Technologies" error={errors.technologies} hint="Comma-separated, e.g. Next.js, PostgreSQL, Tailwind CSS" className="md:col-span-2">
          {text("technologies", { maxLength: 600 })}
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-[11px] font-medium tracking-[0.2em] text-muted">LINKS &amp; MEDIA</legend>
        <Field id="githubUrl" label="GitHub repository URL" error={errors.githubUrl} hint="https:// only. Leave blank if the repository is private.">
          {text("githubUrl", { type: "url", maxLength: 500, placeholder: "https://github.com/anshuman1s/…" })}
        </Field>
        <Field id="liveUrl" label="Live demo URL" error={errors.liveUrl} hint="https:// only. Blank shows “Coming Soon”.">
          {text("liveUrl", { type: "url", maxLength: 500, placeholder: "https://…" })}
        </Field>
        <Field
          id="imageUrl"
          label="Screenshot"
          error={errors.imageUrl}
          hint="A file in public/, e.g. /images/projects/app.png, or an https:// image URL."
        >
          {text("imageUrl", { maxLength: 500, placeholder: "/images/projects/app.png" })}
        </Field>
        <Field id="imageAlt" label="Screenshot alt text" error={errors.imageAlt} hint="Describe what the screenshot shows.">
          {text("imageAlt", { maxLength: 200 })}
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-3">
        <legend className="mb-4 text-[11px] font-medium tracking-[0.2em] text-muted">VISIBILITY &amp; ORDER</legend>
        <label className="flex items-start gap-3 text-xs text-ink">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} className="mt-0.5 size-4 accent-emerald-400" />
          <span>
            Published
            <span className="mt-1 block text-[11px] text-muted">Visible on the public site.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-xs text-ink">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="mt-0.5 size-4 accent-emerald-400" />
          <span>
            Featured / latest
            <span className="mt-1 block text-[11px] text-muted">Shown first, as the wide card.</span>
          </span>
        </label>
        <Field id="sortOrder" label="Sort order" error={errors.sortOrder} hint="Lower appears first, after featured.">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={-1000}
            max={1000}
            step={1}
            defaultValue={initial?.sortOrder ?? 0}
            aria-invalid={Boolean(errors.sortOrder)}
            aria-describedby="sortOrder-desc"
            className={inputClass}
          />
        </Field>
      </fieldset>

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-6">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/admin/projects" className={buttonSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
