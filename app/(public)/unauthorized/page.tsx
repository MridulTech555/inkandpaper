import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Not authorized</h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/" className="text-sm underline">
        Return home
      </Link>
    </div>
  );
}
