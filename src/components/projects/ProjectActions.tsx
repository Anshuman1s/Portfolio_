import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { GithubIcon } from "@/components/navbar/icons";
import type { PublicProject } from "@/lib/content";

const base =
  "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium tracking-tight transition-colors duration-200 motion-reduce:transition-none";

type ActionProps = {
  href?: string;
  icon: ReactNode;
  label: string;
  unavailableLabel: string;
  projectTitle: string;
  variant: "solid" | "outline";
};

function Action({ href, icon, label, unavailableLabel, projectTitle, variant }: ActionProps) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        title={`${label} not available yet`}
        className={`${base} cursor-not-allowed border border-dashed border-ink/20 text-muted/80`}
      >
        {icon}
        {unavailableLabel}
        <span className="sr-only"> ({label.toLowerCase()} not available yet)</span>
      </span>
    );
  }

  const style =
    variant === "solid"
      ? "bg-ink text-cream hover:bg-ink-hover"
      : "border border-ink/20 text-ink hover:border-accent hover:text-accent-hover";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${style}`}
    >
      {icon}
      {label}
      <span className="sr-only">
        {" "}
        for {projectTitle} (opens in a new tab)
      </span>
    </a>
  );
}

export function ProjectActions({ project }: { project: PublicProject }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Action
        href={project.githubUrl ?? undefined}
        icon={<GithubIcon size={15} strokeWidth={1.75} />}
        label="Source Code"
        unavailableLabel="Source Code"
        projectTitle={project.title}
        variant="outline"
      />
      <Action
        href={project.liveUrl ?? undefined}
        icon={<ExternalLink size={15} strokeWidth={1.75} aria-hidden />}
        label="Live Demo"
        unavailableLabel="Coming Soon"
        projectTitle={project.title}
        variant="solid"
      />
    </div>
  );
}
