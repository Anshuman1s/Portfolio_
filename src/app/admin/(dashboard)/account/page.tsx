import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const admin = await requireAdmin({ allowPendingPasswordChange: true });

  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${admin.email}.`} />
      {admin.mustChangePassword && (
        <p role="alert" className="mb-8 max-w-prose rounded-xl border border-accent-hover/30 bg-accent/5 px-4 py-3 text-xs leading-relaxed text-ink">
          You&apos;re using the initial bootstrap password. Choose a new one to continue — the
          rest of the dashboard unlocks once it&apos;s changed. Afterwards, remove{" "}
          <code>ADMIN_INITIAL_PASSWORD</code> from your environment.
        </p>
      )}
      <PasswordForm />
    </>
  );
}
