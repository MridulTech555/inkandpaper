import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions/check";
import { LogoutButton } from "@/components/auth/logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="text-sm font-semibold">
        Ink &amp; Paper
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/search">Search</Link>
        {user ? (
          <>
            {hasRole(user, "SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR") ? (
              <Link href="/author">Author</Link>
            ) : null}
            {hasRole(user, "SUPER_ADMIN", "ADMIN") ? (
              <Link href="/admin">Admin</Link>
            ) : null}
            <span className="text-zinc-500 dark:text-zinc-400">
              {user.name} ({user.role.name})
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/auth/login">Log in</Link>
            <Link href="/auth/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
