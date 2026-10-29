"use client";

import {
  BarChart3,
  ExternalLink,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/admin/actions/auth";
import { AccentDot } from "@/components/AccentDot";

type NavItem = { label: string; href: string; icon: LucideIcon; isActive: (path: string) => boolean };

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, isActive: (p) => p === "/admin" },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
    isActive: (p) => p.startsWith("/admin/projects") && p !== "/admin/projects/new",
  },
  { label: "Add Project", href: "/admin/projects/new", icon: PlusCircle, isActive: (p) => p === "/admin/projects/new" },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Sparkles,
    isActive: (p) => p.startsWith("/admin/skills") && p !== "/admin/skills/new",
  },
  { label: "Add Skill", href: "/admin/skills/new", icon: PlusCircle, isActive: (p) => p === "/admin/skills/new" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, isActive: (p) => p.startsWith("/admin/analytics") },
  { label: "Account", href: "/admin/account", icon: KeyRound, isActive: (p) => p === "/admin/account" },
];

const itemClass =
  "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors motion-reduce:transition-none";

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col">
      <ul className="space-y-1">
        {navItems.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${itemClass} ${
                  active ? "bg-emerald-400 text-emerald-950" : "text-ink/75 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon size={16} strokeWidth={1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="mt-auto space-y-1 border-t border-ink/10 pt-4">
        <li>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${itemClass} text-ink/75 hover:bg-ink/5 hover:text-ink`}
          >
            <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
            View Website
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
        <li>
          <form action={logout}>
            <button
              type="submit"
              className={`${itemClass} w-full text-ink/75 hover:bg-accent/10 hover:text-accent-hover`}
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden />
              Logout
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}

function Brand() {
  return (
    <Link
      href="/admin"
      className="focus-ring inline-flex items-baseline rounded-sm font-logo text-lg font-bold tracking-[-0.045em] text-ink"
    >
      Anshuman Shukla
      <AccentDot className="ml-[0.08em] size-[0.24em]" />
      <span className="ml-2 font-mono text-[10px] font-medium tracking-[0.2em] text-muted">ADMIN</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-ink/10 px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Brand />
        </div>
        <NavList pathname={pathname} />
      </aside>

      {/* Mobile: top bar + drawer */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/10 bg-cream px-4 lg:hidden">
        <Brand />
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring flex size-9 items-center justify-center rounded-full text-ink"
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/20"
          />
          <div
            id="admin-drawer"
            className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-ink/10 bg-cream px-4 pt-20 pb-6"
          >
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
