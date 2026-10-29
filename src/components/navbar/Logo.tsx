import Link from "next/link";
import { AccentDot } from "@/components/AccentDot";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name}, home`}
      className="focus-ring inline-flex items-baseline whitespace-nowrap rounded-sm font-logo text-[1.15rem] leading-none font-bold tracking-[-0.045em] text-ink sm:text-[1.35rem] lg:text-[1.5rem]"
    >
      {siteConfig.name}
      <AccentDot className="ml-[0.08em] size-[0.24em]" />
    </Link>
  );
}
