import { AccentDot } from "@/components/AccentDot";
import { heroConfig } from "@/config/site";
import { HeroActions } from "./HeroActions";
import { HeroPortrait } from "./HeroPortrait";

const rise = "motion-safe:animate-rise";

export function Hero() {
  const { firstName, lastName, role, intro } = heroConfig;

  return (
    <section
      aria-labelledby="hero-heading"
      className="grid min-h-[calc(100svh-3.5rem)] items-center gap-14 py-14 sm:py-20 md:min-h-[calc(100svh-4rem)] md:grid-cols-[1.15fr_0.85fr] md:gap-10 lg:gap-20"
    >
      <div className="flex min-w-0 flex-col">
        <p className={`text-xs font-medium tracking-[0.25em] text-muted ${rise}`}>
          HELLO, I&apos;M
        </p>

        <h1
          id="hero-heading"
          className={`mt-5 font-logo text-[3.25rem] leading-[0.92] font-bold tracking-[-0.05em] text-ink sm:text-7xl md:text-[4.25rem] lg:text-8xl xl:text-[6.5rem] ${rise} [animation-delay:60ms]`}
        >
          <span className="block">{firstName}</span>{" "}
          <span className="inline-flex items-baseline">
            {lastName}
            <AccentDot className="ml-[0.05em] size-[0.15em]" />
          </span>
        </h1>

        <p
          className={`mt-7 flex items-center gap-3 text-sm font-medium tracking-tight text-ink sm:text-base ${rise} [animation-delay:120ms]`}
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          {role}
        </p>

        <p
          className={`mt-6 max-w-[46ch] text-sm leading-relaxed text-muted sm:text-[0.95rem] ${rise} [animation-delay:180ms]`}
        >
          {intro}
        </p>

        <div className={`mt-10 ${rise} [animation-delay:240ms]`}>
          <HeroActions />
        </div>
      </div>

      <div className={`min-w-0 md:pr-4 ${rise} [animation-delay:200ms]`}>
        <HeroPortrait />
      </div>
    </section>
  );
}
