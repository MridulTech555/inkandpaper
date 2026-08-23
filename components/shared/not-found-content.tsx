import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="bg-surface text-foreground-muted flex h-12 w-12 items-center justify-center rounded-full">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Page not found
        </h1>
        <p className="text-foreground-secondary mt-2 max-w-sm text-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Search articles</Link>
        </Button>
      </div>
    </div>
  );
}
