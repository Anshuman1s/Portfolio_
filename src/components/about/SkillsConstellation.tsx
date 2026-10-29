"use client";

import { MotionConfig, motion, useInView, type Variants } from "motion/react";
import { useMemo, useRef } from "react";
import { constellationLinks } from "@/data/constellation";
import type { PublicSkill } from "@/lib/content";
import { SkillIcon } from "./SkillIcon";
import { stars, type Star } from "./stars";
import { EASE_OUT, STAR_DURATION, linesStart } from "./timeline";

const starVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (star: Star) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: star.delay, duration: STAR_DURATION, ease: EASE_OUT },
  }),
};

const lineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: ({ start, i }: { start: number; i: number }) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: start + i * 0.12, duration: 1.2, ease: "easeInOut" },
  }),
};

const toneClass: Record<Star["tone"], string> = {
  ink: "bg-ink/25",
  muted: "bg-muted/40",
  accent: "bg-accent/70",
};

type SkillsConstellationProps = {
  skills: PublicSkill[];
  /** Replay the entrance each time the section re-enters the viewport. */
  replay?: boolean;
};

export function SkillsConstellation({ skills, replay = false }: SkillsConstellationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !replay, amount: 0.3 });
  const skillBySlug = useMemo(() => new Map(skills.map((skill) => [skill.slug, skill])), [skills]);
  const start = linesStart(skills.length);

  return (
    // "user" honours prefers-reduced-motion: transforms are skipped, fades kept.
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative mx-auto aspect-[1/1.05] w-full max-w-[26rem] sm:max-w-[34rem] md:max-w-none"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          {constellationLinks.map(([fromId, toId], i) => {
            const from = skillBySlug.get(fromId);
            const to = skillBySlug.get(toId);
            if (!from || !to) return null;
            return (
              <motion.line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                variants={lineVariants}
                custom={{ start, i }}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 4"
                className="stroke-ink/20"
                strokeWidth={1}
              />
            );
          })}
        </svg>

        <div aria-hidden="true">
          {stars.map((star) => (
            <motion.span
              key={star.id}
              variants={starVariants}
              custom={star}
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {star.sparkle ? (
                <svg
                  viewBox="0 0 10 10"
                  className="block size-2.5 fill-accent motion-safe:animate-twinkle"
                  style={{ animationDelay: `${star.twinkleDelay}s` }}
                >
                  <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
                </svg>
              ) : (
                <span
                  className={`block rounded-full ${toneClass[star.tone]} ${
                    star.twinkle ? "motion-safe:animate-twinkle" : ""
                  }`}
                  style={{
                    width: star.size,
                    height: star.size,
                    animationDelay: `${star.twinkleDelay}s`,
                  }}
                />
              )}
            </motion.span>
          ))}
        </div>

        <ul aria-label="Technologies I work with" className="absolute inset-0">
          {skills.map((skill, index) => (
            <SkillIcon key={skill.id} skill={skill} index={index} />
          ))}
        </ul>
      </motion.div>
    </MotionConfig>
  );
}
