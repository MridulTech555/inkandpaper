"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import type { RoleName } from "@/lib/permissions/permissions";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// Precomputed so a login attempt against a non-existent email still pays the
// bcrypt cost, keeping response timing similar to a real password check.
const DUMMY_HASH = bcrypt.hashSync("does-not-matter", 12);

function roleHomePath(roleName: RoleName): string {
  switch (roleName) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "EDITOR":
    case "AUTHOR":
      return "/author";
    default:
      return "/";
  }
}

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const ip = await clientIp();
  if (!checkRateLimit(`register:${ip}`)) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const readerRole = await prisma.role.findUnique({
    where: { name: "READER" },
    select: { id: true },
  });
  if (!readerRole) {
    return { error: "Registration is temporarily unavailable." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, roleId: readerRole.id },
    select: { id: true },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const ip = await clientIp();
  if (!checkRateLimit(`login:${ip}`)) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      status: true,
      role: { select: { name: true } },
    },
  });

  const validPassword = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );
  if (!user || !validPassword) {
    return { error: "Invalid email or password." };
  }

  if (user.status !== "ACTIVE") {
    return { error: "This account is not active. Contact an administrator." };
  }

  await createSession(user.id);
  redirect(roleHomePath(user.role.name as RoleName));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
