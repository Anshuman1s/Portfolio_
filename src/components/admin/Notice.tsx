import { CheckCircle2 } from "lucide-react";

const messages: Record<string, string> = {
  created: "Saved. The public site has been updated.",
  updated: "Changes saved. The public site has been updated.",
  deleted: "Deleted.",
  "password-changed": "Password updated. Other sessions were signed out.",
  "location-deleted": "Precise location data deleted.",
};

/** Success banner driven by a fixed `?notice=` key — never echoes raw query text. */
export function Notice({ notice, text }: { notice?: string; text?: string }) {
  const message = text ?? (notice ? messages[notice] : undefined);
  if (!message) return null;
  return (
    <p
      role="status"
      className="mb-6 flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white/50 px-4 py-3 text-xs text-ink"
    >
      <CheckCircle2 size={16} className="text-accent-hover" aria-hidden />
      {message}
    </p>
  );
}
