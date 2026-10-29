import type { ReactNode } from "react";
import { hintClass, labelClass } from "./styles";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Label + control + hint/error. The control should use `id` and aria-describedby={`${id}-desc`}. */
export function Field({ id, label, error, hint, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {(error || hint) && (
        <p
          id={`${id}-desc`}
          className={error ? "mt-1.5 text-[11px] font-medium text-accent-hover" : hintClass}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
