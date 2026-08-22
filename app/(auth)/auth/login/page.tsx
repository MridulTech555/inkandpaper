import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <LoginForm />
    </div>
  );
}
