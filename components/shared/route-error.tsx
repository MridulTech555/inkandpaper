"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteError({
  error,
  reset,
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
}) {
  useEffect(() => {
    // Never render error.message/stack to the DOM — it may contain internal
    // details. The digest is the safe, support-friendly correlation ID.
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="bg-surface text-error flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Something went wrong
        </h1>
        <p className="text-foreground-secondary mt-2 max-w-sm text-sm">
          We hit an unexpected error loading this page. Try again, or head back
          home.
        </p>
        {error.digest ? (
          <p className="text-foreground-muted mt-2 font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={homeHref}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
