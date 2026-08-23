"use client";

import { useEffect } from "react";

// Catches errors thrown by the root layout itself, where the regular
// error.tsx boundary can't help — it has to render its own <html>/<body>
// since the layout that would normally provide them is what crashed.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-zinc-900">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          The application failed to load. Please try again.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-zinc-400">
            Reference: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
