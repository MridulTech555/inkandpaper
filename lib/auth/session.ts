import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import type { RoleName } from "@/lib/permissions/permissions";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export { SESSION_COOKIE_NAME };
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: RoleName };
  permissions: string[];
}

// AUTH_SECRET is mixed into every session token hash (HMAC, not a plain
// digest) so that even a leaked database dump can't be used to derive or
// forge valid session tokens without also having this server-only secret.
// Required in production; falls back to a fixed dev-only value so local
// setup doesn't need a .env before `npm run dev` works.
const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("AUTH_SECRET must be set in production.");
      })()
    : "dev-only-insecure-secret-do-not-use-in-production");

function hashToken(token: string): string {
  return crypto.createHmac("sha256", authSecret).update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Resolves the current session user from the request cookie, verifying it
 * against the database on every call. Wrapped in React `cache()` so a single
 * request only pays for one lookup no matter how many server components ask.
 * Only ever selects the fields listed below — passwordHash is never touched.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: { permission: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (session.user.status !== "ACTIVE") return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: {
      id: session.user.role.id,
      name: session.user.role.name as RoleName,
    },
    permissions: session.user.role.permissions.map((rp) => rp.permission.name),
  };
});
