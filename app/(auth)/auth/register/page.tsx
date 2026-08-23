import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Ink & Paper to bookmark, comment, and follow your favorite authors."
    >
      <RegisterForm />
    </AuthShell>
  );
}
