import { ArrowRight, ArrowUp } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AccentDot } from "@/components/AccentDot";
import { SocialLinks } from "@/components/navbar/SocialLinks";
import { isEmailConfigured, navLinks, siteConfig } from "@/config/site";

const buttonBase =
  "focus-ring inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-medium tracking-tight transition-colors duration-200 motion-reduce:transition-none";

const underlineLink =
  "focus-ring relative rounded-sm py-1 text-muted transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none";

function ContactButton() {
  const label = (
    <>
      Let&apos;s Talk
      <ArrowRight
        size={16}
        strokeWidth={2}
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </>
  );

  if (!isEmailConfigured) {
    return (
      <div className="flex flex-col items-start gap-2">
        <span
          aria-disabled="true"
          title="Contact email not configured yet"
          className={`${buttonBase} cursor-not-allowed bg-ink/40 text-cream`}
        >
          {label}
        </span>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-muted">
            Dev note: set <code className="text-ink">siteConfig.email</code> in{" "}
            <code className="text-ink">src/config/site.ts</code>.
          </p>
        )}
      </div>
    );
  }

  return (
    <a
      href={`mailto:${siteConfig.email}`}
      className={`group ${buttonBase} bg-ink text-cream hover:bg-ink-hover`}
    >
      {label}
    </a>
  );
}

// Cache Components forbids reading the clock in the prerendered shell, so the
// year comes from a cached scope that refreshes daily.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        {/* Closing message */}
        <div className="py-20 sm:py-24 lg:py-32">
          <p className="text-xs font-medium tracking-[0.25em] text-muted">
            HAVE A PROJECT IN MIND?
          </p>
          <h2 className="mt-5 font-logo text-[2.5rem] leading-[0.98] font-bold tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
            Let&apos;s build something{" "}
            <span className="sm:block">
              meaningful{" "}
              <span className="inline-flex items-baseline whitespace-nowrap">
                together
                <AccentDot className="ml-[0.05em] size-[0.15em]" />
              </span>
            </span>
          </h2>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
            <p className="max-w-[48ch] text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              I&apos;m always interested in building useful products, exploring
              new technologies, and connecting with people who love creating
              things.
            </p>
            <div className="shrink-0">
              <ContactButton />
            </div>
          </div>
        </div>

        {/* Navigation + socials */}
        <div className="flex flex-col gap-6 border-t border-ink/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={underlineLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <SocialLinks />
            <span aria-hidden="true" className="h-5 w-px bg-ink/15" />
            {/* "#top" scrolls to the document start natively — no JS needed. */}
            <a
              href="#top"
              aria-label="Back to top"
              className="focus-ring group flex size-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-200 hover:border-accent hover:text-accent-hover motion-reduce:transition-none"
            >
              <ArrowUp
                size={16}
                strokeWidth={2}
                aria-hidden
                className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-2 border-t border-ink/10 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. All rights reserved.{" "}
            <Link href="/privacy" className={`${underlineLink} ml-2`}>
              Privacy
            </Link>
          </p>
          <p className="text-[11px] tracking-[0.2em]">DESIGNED &amp; BUILT WITH CARE.</p>
        </div>
      </div>
    </footer>
  );
}
