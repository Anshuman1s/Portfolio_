import type { Metadata } from "next";
import Link from "next/link";
import { AccentDot } from "@/components/AccentDot";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="focus-ring inline-flex items-baseline rounded-sm font-logo text-2xl font-bold tracking-[-0.045em] text-ink"
        >
          Anshuman Shukla
          <AccentDot className="ml-[0.08em] size-[0.24em]" />
        </Link>
        <h1 className="mt-8 text-xs font-medium tracking-[0.25em] text-muted">ADMIN SIGN IN</h1>
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/40 p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
