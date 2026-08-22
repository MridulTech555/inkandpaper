import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
      <RegisterForm />
    </div>
  );
}
