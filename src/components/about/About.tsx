import { AccentDot } from "@/components/AccentDot";
import { getPublishedSkills } from "@/lib/content";
import { isSkillIconKey } from "@/lib/skill-icons";
import { Reveal } from "@/components/Reveal";
import { SkillsConstellation } from "./SkillsConstellation";

const paragraphs = [
  "I'm Anshuman Shukla, a Full Stack Developer who enjoys turning ideas into useful, intuitive, and well-crafted digital experiences.",
  "I work across frontend and backend development, exploring the technologies and tools that make applications fast, scalable, and enjoyable to use.",
  "I believe good software is more than code. It's about solving real problems, paying attention to details, and continuously learning how to build better things.",
];

export async function About() {
  // Only allowlisted icons render, so pairs in the reveal stay intact.
  const skills = (await getPublishedSkills()).filter((skill) => isSkillIconKey(skill.icon));

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="grid items-center gap-12 border-t border-ink/10 py-24 sm:py-28 md:grid-cols-[42fr_58fr] md:gap-10 lg:gap-16 lg:py-32"
    >
      <Reveal className="min-w-0">
        <p className="text-xs font-medium tracking-[0.25em] text-muted">
          <span className="text-accent-hover">01</span> / ABOUT ME
        </p>

        <h2
          id="about-heading"
          className="mt-5 font-logo text-4xl leading-[0.98] font-bold tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl"
        >
          A little about{" "}
          <span className="relative inline-flex items-baseline whitespace-nowrap">
            me
            <AccentDot className="ml-[0.05em] size-[0.15em]" />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-accent/80"
            />
          </span>
        </h2>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
          {paragraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}
        </div>

        <p className="mt-8 text-xs font-medium tracking-[0.2em] text-ink">
          CURIOUS BY NATURE. BUILDER BY CHOICE.
        </p>

        <p className="mt-4 flex items-center gap-2.5 text-xs text-muted">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-accent/50 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          Currently exploring new ideas.
        </p>

        {/* Plain-text list so skills are discoverable without hovering the constellation. */}
        <div className="mt-10 border-t border-ink/10 pt-5">
          <h3 className="text-[11px] font-medium tracking-[0.2em] text-muted">
            TOOLS I WORK WITH
          </h3>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-ink/80">
            {skills.map(({ id, name }, i) => (
              <li key={id} className="flex items-center gap-3">
                {name}
                {i < skills.length - 1 && (
                  <span aria-hidden="true" className="text-accent/70">
                    ·
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <div className="min-w-0">
        <SkillsConstellation skills={skills} />
      </div>
    </section>
  );
}
