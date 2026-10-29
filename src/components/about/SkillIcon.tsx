"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties } from "react";
import type { PublicSkill } from "@/lib/content";
import { isSkillIconKey, skillIcons } from "@/lib/skill-icons";
import { EASE_OUT, ICON_DURATION, floatDuration, pairDelay, pairOffset } from "./timeline";

const sizeClass: Record<PublicSkill["size"], string> = {
  sm: "text-[20px] sm:text-[24px]",
  md: "text-[24px] sm:text-[30px]",
  lg: "text-[28px] sm:text-[36px]",
};

type Entrance = { delay: number; x: number; y: number };

const entrance: Variants = {
  hidden: ({ x, y }: Entrance) => ({ opacity: 0, scale: 0.4, x, y }),
  visible: ({ delay }: Entrance) => ({
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { delay, duration: ICON_DURATION, ease: EASE_OUT },
  }),
};

// Keep tooltips inside the field for icons near the left/right edges.
function tooltipAlign(x: number) {
  if (x < 20) return "left-0";
  if (x > 80) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

type SkillIconProps = {
  skill: PublicSkill;
  index: number;
};

export function SkillIcon({ skill, index }: SkillIconProps) {
  const { name, color, x, y, size } = skill;
  // Only allowlisted icons render; unknown keys are skipped entirely.
  if (!isSkillIconKey(skill.icon)) return null;
  const { Icon } = skillIcons[skill.icon];

  const offset = pairOffset(index);
  const duration = floatDuration(index);

  const style = {
    left: `${x}%`,
    top: `${y}%`,
    "--brand": color,
    "--float-duration": `${duration}s`,
    // Negative delay starts each icon mid-cycle so they never float in sync.
    "--float-delay": `-${((index * 1.3) % duration).toFixed(2)}s`,
    "--float-x": `${index % 2 === 0 ? 3 : -3}px`,
    "--float-y": `${index % 3 === 0 ? -7 : -5}px`,
  } as CSSProperties;

  return (
    <li
      style={style}
      className="group/skill absolute -translate-x-1/2 -translate-y-1/2 focus-within:z-10 hover:z-10"
    >
      <motion.div
        variants={entrance}
        custom={{ delay: pairDelay(index), ...offset } satisfies Entrance}
      >
        <div className="relative motion-safe:animate-float group-focus-within/skill:[animation-play-state:paused] group-hover/skill:[animation-play-state:paused]">
          <span
            tabIndex={0}
            role="img"
            aria-label={name}
            className="focus-ring relative flex items-center justify-center rounded-full bg-cream p-2.5 text-ink/75 transition-[color,transform] duration-300 group-hover/skill:scale-110 group-hover/skill:text-[var(--brand)] focus-visible:scale-110 focus-visible:text-[var(--brand)] motion-reduce:transition-none sm:p-3"
          >
            {/* Soft pink halo on hover / focus */}
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-50 rounded-full bg-accent/12 opacity-0 transition duration-300 group-focus-within/skill:scale-100 group-focus-within/skill:opacity-100 group-hover/skill:scale-100 group-hover/skill:opacity-100 motion-reduce:transition-none"
            />
            <Icon aria-hidden className={`relative ${sizeClass[size]}`} />
          </span>

          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-full mb-1.5 rounded-md bg-ink px-2 py-1 text-[11px] font-medium whitespace-nowrap text-cream opacity-0 transition-opacity duration-200 group-focus-within/skill:opacity-100 group-hover/skill:opacity-100 ${tooltipAlign(x)}`}
          >
            {name}
          </span>
        </div>
      </motion.div>
    </li>
  );
}
