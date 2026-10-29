"use client";

import { useActionState } from "react";
import { type LoginState, login } from "@/app/admin/actions/auth";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { buttonPrimary, inputClass } from "./styles";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <p role="alert" className="rounded-lg border border-accent-hover/30 bg-accent/5 px-3 py-2.5 text-xs text-ink">
          {state.error}
        </p>
      )}
      <Field id="email" label="Email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className={inputClass}
        />
      </Field>
      <Field id="password" label="Password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Signing in…" className={`${buttonPrimary} w-full`}>
        Sign in
      </SubmitButton>
    </form>
  );
}
