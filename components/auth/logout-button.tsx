import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn("text-foreground text-sm hover:underline", className)}
      >
        Log out
      </button>
    </form>
  );
}
