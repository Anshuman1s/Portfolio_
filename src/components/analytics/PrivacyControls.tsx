"use client";

import { MapPin } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  LOCATION_TOKEN_KEY,
  OPT_OUT_KEY,
  browserSignalsOptOut,
  readStorage,
  subscribeStorage,
  writeStorage,
} from "@/lib/analytics/opt-out";

const noopSubscribe = () => () => undefined;

/** A localStorage value; null on the server and before hydration. */
const useStoredValue = (key: string) =>
  useSyncExternalStore(subscribeStorage, () => readStorage(key), () => null);

const button =
  "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-medium transition-colors motion-reduce:transition-none";

export function AnalyticsOptOut() {
  const optedOut = useStoredValue(OPT_OUT_KEY) === "1";
  // null during SSR so the server and first client render match.
  const signal = useSyncExternalStore(noopSubscribe, browserSignalsOptOut, () => null);

  if (signal === null) return null;
  if (signal) {
    return (
      <p className="text-xs text-ink">
        Your browser sends Do Not Track or Global Privacy Control, so no page views are recorded.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="text-xs text-ink" role="status">
        Analytics on this browser: <strong>{optedOut ? "off" : "on"}</strong>
      </p>
      <button
        type="button"
        onClick={() => writeStorage(OPT_OUT_KEY, optedOut ? null : "1")}
        className={`${button} border border-ink/20 text-ink hover:border-accent hover:text-accent-hover`}
      >
        {optedOut ? "Turn analytics back on" : "Opt out of analytics"}
      </button>
    </div>
  );
}

type Status = "idle" | "requesting" | "saved" | "denied" | "unsupported" | "error" | "withdrawn";

const messages: Partial<Record<Status, string>> = {
  saved: "Thanks — your approximate location was saved. You can withdraw it at any time below.",
  denied: "Location permission was declined. Nothing was collected, and the site works as normal.",
  unsupported: "Your browser doesn't support location sharing. Nothing was collected.",
  error: "Something went wrong and nothing was saved. You can try again later.",
  withdrawn: "Consent withdrawn and your stored location deleted.",
};

/** Opt-in only: geolocation is requested solely after the visitor clicks the button. */
export function LocationConsent() {
  const [status, setStatus] = useState<Status>("idle");
  const token = useStoredValue(LOCATION_TOKEN_KEY);

  function share() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              consent: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
            }),
          });
          if (!response.ok) throw new Error();
          const data: unknown = await response.json();
          const saved = typeof data === "object" && data && "token" in data ? String(data.token) : null;
          if (!saved) throw new Error();
          writeStorage(LOCATION_TOKEN_KEY, saved);
          setStatus("saved");
        } catch {
          setStatus("error");
        }
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  }

  async function withdraw() {
    if (!token) return;
    try {
      const response = await fetch("/api/location", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error();
      writeStorage(LOCATION_TOKEN_KEY, null);
      setStatus("withdrawn");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {!token && (
          <button
            type="button"
            onClick={share}
            disabled={status === "requesting"}
            className={`${button} bg-ink text-cream hover:bg-ink-hover disabled:opacity-60`}
          >
            <MapPin size={14} aria-hidden />
            {status === "requesting" ? "Waiting for permission…" : "Share Approximate Location"}
          </button>
        )}
        {token && (
          <button
            type="button"
            onClick={withdraw}
            className={`${button} border border-accent-hover/40 text-accent-hover hover:bg-accent/10`}
          >
            Withdraw consent &amp; delete my location
          </button>
        )}
      </div>
      <p role="status" className="text-xs text-muted">
        {messages[status] ?? (token ? "You've shared an approximate location from this browser." : "")}
      </p>
    </div>
  );
}
