"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  unsubscribeFromNewsletterAction,
  type NewsletterActionState,
} from "@/lib/services/newsletter-actions";

const initialState: NewsletterActionState = {};

export function UnsubscribeForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useActionState(
    unsubscribeFromNewsletterAction,
    initialState,
  );

  if (state.success) {
    return (
      <p className="text-success text-sm font-medium">
        You&apos;ve been unsubscribed. Sorry to see you go.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        type="email"
        name="email"
        placeholder="you@example.com"
        defaultValue={defaultEmail}
        required
        aria-label="Email address"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </Button>
      {state.error ? <p className="text-error text-sm">{state.error}</p> : null}
    </form>
  );
}
