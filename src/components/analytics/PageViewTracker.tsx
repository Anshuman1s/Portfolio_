"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isOptedOut } from "@/lib/analytics/opt-out";

/**
 * Sends one page view per route navigation (not per render or API call).
 * Fire-and-forget: failures never affect the page.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const isFirstView = useRef(true);

  useEffect(() => {
    if (!pathname || isOptedOut()) return;

    const referrer = isFirstView.current ? document.referrer || null : null;
    isFirstView.current = false;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
