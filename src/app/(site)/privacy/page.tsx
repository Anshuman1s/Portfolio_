import type { Metadata } from "next";
import { AccentDot } from "@/components/AccentDot";
import { AnalyticsOptOut, LocationConsent } from "@/components/analytics/PrivacyControls";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacy · Anshuman Shukla",
  description: "What this site collects for analytics, why, and your choices.",
};

const h2 = "mt-12 font-logo text-2xl font-bold tracking-[-0.03em] text-ink";
const p = "mt-4 max-w-prose text-sm leading-relaxed text-muted";

export default function PrivacyPage() {
  const config = env();
  const ipText = {
    none: "IP addresses are not stored.",
    truncated:
      "A shortened IP address (the last part removed, e.g. 203.0.113.x) is stored to help spot abuse and coarse network patterns.",
    full: "The full IP address is stored to help detect abuse.",
  }[config.ANALYTICS_IP_MODE];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 sm:px-6 sm:py-24">
      <p className="text-xs font-medium tracking-[0.25em] text-muted">PRIVACY</p>
      <h1 className="mt-5 font-logo text-4xl leading-[0.98] font-bold tracking-[-0.045em] text-ink sm:text-5xl">
        Analytics &amp; your data
        <AccentDot className="ml-[0.05em] size-[0.15em]" />
      </h1>
      <p className={p}>
        This portfolio keeps lightweight, first-party statistics so I can see which pages are
        useful. There are no advertising trackers, no third-party analytics, and no cookies are
        set for visitors.
      </p>

      <h2 className={h2}>What is recorded</h2>
      <ul className={`${p} list-disc space-y-2 pl-5`}>
        <li>The page path you viewed and the time.</li>
        <li>The referring website&apos;s domain (not the full address), if your browser sends one.</li>
        <li>A device category (desktop / mobile / tablet) and browser family.</li>
        <li>An approximate country / region / city derived from your IP address by the hosting provider. This is a rough estimate, not your precise location.</li>
        <li>
          An anonymous visitor id: a keyed hash of the date, your IP address and browser user
          agent. It changes every day and can&apos;t be turned back into an IP address. It is used
          only to estimate unique visitors — it does not identify you as a person.
        </li>
        <li>{ipText}</li>
      </ul>

      <h2 className={h2}>Retention</h2>
      <p className={p}>
        Visit records are deleted automatically after {config.ANALYTICS_RETENTION_DAYS} days.
        Stored IP addresses are cleared after {config.ANALYTICS_IP_RETENTION_DAYS} days. Only the
        site administrator can view this data, behind a password-protected dashboard.
      </p>

      <h2 className={h2}>Your choices</h2>
      <p className={p}>
        If your browser sends Do Not Track or Global Privacy Control, nothing is recorded. You can
        also opt out on this browser:
      </p>
      <div className="mt-6">
        <AnalyticsOptOut />
      </div>

      {config.NEXT_PUBLIC_PRECISE_LOCATION_ENABLED && (
        <>
          <h2 className={h2}>Optional: share your approximate location</h2>
          <p className={p}>
            Entirely optional. If you choose to share, your browser will ask for permission, and
            the coordinates are rounded to roughly 1 km before being stored for website analytics.
            They are visible only to the site administrator, kept for at most{" "}
            {config.LOCATION_RETENTION_DAYS} days, and you can withdraw consent and delete them at
            any time from this page (on this browser). Declining changes nothing about the site.
          </p>
          <div className="mt-6">
            <LocationConsent />
          </div>
        </>
      )}

      <h2 className={h2}>Questions or deletion requests</h2>
      <p className={p}>
        Use the contact links in the footer. Because visitor ids rotate daily and contain no
        direct identifiers, I may not be able to match records to you, but I&apos;ll help where
        I can.
      </p>
    </main>
  );
}
