"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SubmitButton } from "./SubmitButton";

type ConfirmDeleteProps = {
  /** Server action, already bound to the record id. */
  action: () => Promise<void>;
  itemLabel: string;
  /** Text on the initial button. */
  label?: string;
};

/**
 * Two-step delete: the first click only reveals an explicit confirmation,
 * so a record can't be removed by a single accidental click.
 */
export function ConfirmDelete({ action, itemLabel, label = "Delete" }: ConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-accent-hover/40 px-5 text-xs font-medium text-accent-hover transition-colors hover:bg-accent/10"
      >
        <Trash2 size={14} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label={`Confirm deleting ${itemLabel}`}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent-hover/40 bg-accent/5 px-4 py-3"
      onKeyDown={(event) => event.key === "Escape" && setConfirming(false)}
    >
      <p className="text-xs text-ink">
        Permanently delete <strong className="font-semibold">{itemLabel}</strong>? This can&apos;t be undone.
      </p>
      <div className="flex gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={() => setConfirming(false)}
          className="focus-ring h-9 rounded-full border border-ink/20 px-4 text-xs font-medium text-ink"
        >
          Cancel
        </button>
        <form action={action}>
          <SubmitButton
            pendingLabel="Deleting…"
            className="focus-ring h-9 rounded-full bg-accent-hover px-4 text-xs font-medium text-white disabled:opacity-60"
          >
            Yes, delete
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
