"use client";

import { useActionState } from "react";
import { type PasswordState, changePassword } from "@/app/admin/actions/auth";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { inputClass } from "./styles";

export function PasswordForm() {
  const [state, formAction] = useActionState<PasswordState, FormData>(changePassword, {});
  const errors = state.errors ?? {};

  const input = (name: string, autoComplete: string) => (
    <input
      id={name}
      name={name}
      type="password"
      autoComplete={autoComplete}
      required
      maxLength={256}
      aria-invalid={Boolean(errors[name])}
      aria-describedby={`${name}-desc`}
      className={inputClass}
    />
  );

  return (
    <form action={formAction} className="max-w-sm space-y-5" noValidate>
      <Field id="currentPassword" label="Current password" error={errors.currentPassword}>
        {input("currentPassword", "current-password")}
      </Field>
      <Field id="newPassword" label="New password" error={errors.newPassword} hint="At least 12 characters. A passphrase works well.">
        {input("newPassword", "new-password")}
      </Field>
      <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
        {input("confirmPassword", "new-password")}
      </Field>
      <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
    </form>
  );
}
