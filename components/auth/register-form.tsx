"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Mail, Sparkles, User } from "lucide-react";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";
import { Alert } from "@/components/ui/alert";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput } from "@/components/auth/password-input";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <IconInput
          icon={User}
          id="name"
          name="name"
          type="text"
          placeholder="Ada Author"
          required
          autoComplete="name"
          error={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <IconInput
          icon={Mail}
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          error={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={Boolean(state.fieldErrors?.confirmPassword)}
        />
        {state.fieldErrors?.confirmPassword?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <Button type="submit" disabled={pending} size="lg" className="mt-1">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Create account
          </>
        )}
      </Button>

      <p className="text-foreground-secondary text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
