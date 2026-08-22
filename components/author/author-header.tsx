import type { SessionUser } from "@/lib/auth/session";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { AuthorMobileNav } from "@/components/author/author-mobile-nav";

export function AuthorHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <AuthorMobileNav />
        <p className="text-foreground-secondary text-sm font-medium">
          Author dashboard
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-foreground text-sm font-medium">{user.name}</p>
          <p className="text-foreground-muted text-xs">{user.role.name}</p>
        </div>
        <Avatar fallback={user.name.charAt(0)} size="sm" />
        <LogoutButton />
      </div>
    </header>
  );
}
