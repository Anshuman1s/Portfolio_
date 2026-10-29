"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { navLinks } from "@/config/site";

// Next.js <Link> navigates with pushState, which does not fire "hashchange",
// so clicks notify subscribers manually once the URL has been updated.
const listeners = new Set<() => void>();

function notifyHashChange() {
  requestAnimationFrame(() => listeners.forEach((listener) => listener()));
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}

const getHash = () => window.location.hash;
const getServerHash = () => "";

function hrefToHash(href: string) {
  const index = href.indexOf("#");
  return index === -1 ? "" : href.slice(index);
}

type NavLinksProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function NavLinks({ variant, onNavigate }: NavLinksProps) {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);

  const listClass =
    variant === "desktop"
      ? "flex items-center gap-6 lg:gap-10"
      : "flex flex-col gap-1";

  const linkClass =
    variant === "desktop"
      ? "relative py-1 text-sm after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-300 motion-reduce:after:transition-none"
      : "relative block py-3 text-base";

  return (
    <ul className={listClass}>
      {navLinks.map(({ label, href }) => {
        // Home is active for any hash that isn't a section link (e.g. "#top").
        const isActive =
          hrefToHash(href) === hash ||
          (href === "/" && !navLinks.some((link) => hrefToHash(link.href) === hash));

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => {
                notifyHashChange();
                onNavigate?.();
              }}
              aria-current={isActive ? "page" : undefined}
              className={`focus-ring rounded-sm font-medium tracking-tight transition-colors duration-200 motion-reduce:transition-none ${linkClass} ${
                isActive
                  ? "text-ink after:scale-x-100"
                  : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"
              }`}
            >
              {variant === "mobile" && (
                <span
                  aria-hidden="true"
                  className={`mr-3 inline-block size-1.5 rounded-full align-middle ${
                    isActive ? "bg-accent" : "bg-transparent"
                  }`}
                />
              )}
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
