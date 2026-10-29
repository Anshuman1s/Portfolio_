// Client-side analytics preferences (no server data involved).

export const OPT_OUT_KEY = "analytics-opt-out";
export const LOCATION_TOKEN_KEY = "location-consent-token";

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export function browserSignalsOptOut() {
  return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
}

export function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

const STORAGE_EVENT = "privacy-storage-change";

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode etc.) — preference lasts this page only.
  }
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

/** useSyncExternalStore subscriber: same-tab writes and other tabs' changes. */
export function subscribeStorage(callback: () => void) {
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export const isOptedOut = () => browserSignalsOptOut() || readStorage(OPT_OUT_KEY) === "1";
