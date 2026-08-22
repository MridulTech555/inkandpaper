"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.email?.map((message) => (
          <p key={message} className="text-xs text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.password?.map((message) => (
          <p key={message} className="text-xs text-red-600">
            {message}
          </p>
        ))}
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground text-background rounded px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  );
}
