"use client";

import { type ReactNode, useEffect, useState } from "react";

/** Sticky header whose bottom border only appears once the page is scrolled. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-50 border-b border-transparent bg-cream transition-colors duration-200 data-[scrolled=true]:border-ink/10 motion-reduce:transition-none"
    >
      {children}
    </header>
  );
}
