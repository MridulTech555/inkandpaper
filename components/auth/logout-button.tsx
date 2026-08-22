import { logoutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-sm underline">
        Log out
      </button>
    </form>
  );
}
