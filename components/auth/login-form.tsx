"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, LogIn, Mail } from "lucide-react";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";
import { Alert } from "@/components/ui/alert";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput } from "@/components/auth/password-input";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
          error={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password?.map((message) => (
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
            Logging in…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Log in
          </>
        )}
      </Button>

      <p className="text-foreground-secondary text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-primary font-medium hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
