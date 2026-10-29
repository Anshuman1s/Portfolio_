"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { NavLinks } from "./NavLinks";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Close if the viewport grows past the mobile breakpoint.
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex size-8 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:text-accent-hover motion-reduce:transition-none sm:size-9"
      >
        {open ? (
          <X size={20} strokeWidth={1.75} aria-hidden />
        ) : (
          <Menu size={20} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <nav
        id={panelId}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-ink/10 bg-cream px-4 pt-2 pb-4 sm:px-6"
      >
        <NavLinks variant="mobile" onNavigate={() => setOpen(false)} />
      </nav>
    </div>
  );
}
