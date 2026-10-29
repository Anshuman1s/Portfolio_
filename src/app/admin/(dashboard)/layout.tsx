import type { ReactNode } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

/**
 * Dashboard shell. The sidebar is static; every page inside the Suspense
 * boundary calls requireAdmin() on the server before reading any data.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Sidebar reads the pathname (runtime data), so it streams in; the fallback holds its space. */}
      <Suspense
        fallback={
          <div aria-hidden="true" className="h-14 shrink-0 border-b border-ink/10 lg:h-svh lg:w-60 lg:border-r lg:border-b-0" />
        }
      >
        <Sidebar />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Suspense fallback={<p className="text-xs text-muted">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
