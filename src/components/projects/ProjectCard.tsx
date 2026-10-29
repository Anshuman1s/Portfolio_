import type { PublicProject } from "@/lib/content";
import { ProjectActions } from "./ProjectActions";
import { ProjectPreview } from "./ProjectPreview";

type ProjectCardProps = {
  project: PublicProject;
  /** Wide layout for the lead (featured) project. */
  wide?: boolean;
};

export function ProjectCard({ project, wide = false }: ProjectCardProps) {
  const { title, description, technologies, liveUrl } = project;

  const sizes = wide
    ? "(min-width: 1024px) 640px, 100vw"
    : "(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw";

  // Preview and title link to the live site only when one exists.
  const preview = (
    <div className="relative aspect-[16/10] overflow-hidden bg-blush">
      <ProjectPreview project={project} sizes={sizes} />
    </div>
  );

  return (
    <article
      className={`group/card flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-cream transition duration-300 hover:-translate-y-1 hover:border-accent/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        wide ? "lg:grid lg:grid-cols-[1.4fr_1fr]" : ""
      }`}
    >
      <div className={wide ? "lg:border-r lg:border-ink/10" : "border-b border-ink/10"}>
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="block"
          >
            {preview}
          </a>
        ) : (
          preview
        )}
      </div>

      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${wide ? "lg:justify-center lg:p-10" : ""}`}>
        {wide && (
          <p className="mb-3 text-[10px] font-medium tracking-[0.2em] text-accent-hover">
            FEATURED
          </p>
        )}
        <h3
          className={`font-logo font-bold tracking-[-0.03em] text-ink ${
            wide ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-sm decoration-accent decoration-2 underline-offset-4 hover:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>

        {technologies.length > 0 && (
          <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-ink/12 px-2.5 py-1 text-[11px] whitespace-nowrap text-ink/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-7">
          <ProjectActions project={project} />
        </div>
      </div>
    </article>
  );
}
