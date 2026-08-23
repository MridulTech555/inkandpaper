"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  subscribeToNewsletterAction,
  type NewsletterActionState,
} from "@/lib/services/newsletter-actions";

const initialState: NewsletterActionState = {};

export function NewsletterCta() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletterAction,
    initialState,
  );

  return (
    <section className="border-border bg-surface rounded-lg border px-6 py-10 text-center">
      <h2 className="text-foreground font-serif text-2xl font-semibold">
        Stay in the loop
      </h2>
      <p className="text-foreground-secondary mx-auto mt-2 max-w-md text-sm">
        New essays and articles, straight to your inbox. No spam,{" "}
        <Link href="/newsletter/unsubscribe" className="underline">
          unsubscribe any time
        </Link>
        .
      </p>

      {state.success ? (
        <p className="text-success mt-6 text-sm font-medium">
          Thanks for subscribing — check your inbox to confirm.
        </p>
      ) : (
        <form
          action={formAction}
          className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            aria-label="Email address"
            className="bg-surface-elevated"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
      )}
      {state.error ? (
        <p className="text-error mt-3 text-sm">{state.error}</p>
      ) : null}
    </section>
  );
}
