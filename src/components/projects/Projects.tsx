import { ArrowRight } from "lucide-react";
import { AccentDot } from "@/components/AccentDot";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/config/site";
import { getPublishedProjects } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";

export async function Projects() {
  const projects = await getPublishedProjects();

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="border-t border-ink/10 py-24 sm:py-28 lg:py-32"
    >
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] text-muted">
            <span className="text-accent-hover">02</span> / SELECTED WORK
          </p>
          <h2
            id="projects-heading"
            className="mt-5 font-logo text-4xl leading-[0.98] font-bold tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl"
          >
            Things I&apos;ve{" "}
            <span className="inline-flex items-baseline whitespace-nowrap">
              built
              <AccentDot className="ml-[0.05em] size-[0.15em]" />
            </span>
          </h2>
        </div>
        <p className="max-w-[44ch] text-sm leading-relaxed text-muted sm:text-[0.95rem] lg:pb-2">
          A collection of projects where ideas meet code. Explore what I&apos;ve
          built, the technologies behind each project, and the problems each
          one solves.
        </p>
      </Reveal>

      {projects.length > 0 ? (
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            // Featured projects sort first; the lead one gets the wide card.
            const wide = index === 0 && project.featured;
            return (
              <li key={project.id} className={wide ? "md:col-span-2 lg:col-span-3" : undefined}>
                <ProjectCard project={project} wide={wide} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-14 rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-muted">
          New projects are on their way.
        </p>
      )}

      <div className="mt-14 flex justify-center">
        <a
          href={siteConfig.githubProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring group inline-flex h-12 items-center gap-2.5 rounded-full border border-ink/20 px-7 text-sm font-medium tracking-tight text-ink transition-colors duration-200 hover:border-accent hover:text-accent-hover motion-reduce:transition-none"
        >
          More
          <ArrowRight
            size={16}
            strokeWidth={2}
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
          <span className="sr-only">projects on GitHub (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
