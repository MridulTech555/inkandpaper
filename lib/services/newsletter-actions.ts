"use server";

import { prisma } from "@/lib/db/prisma";
import { newsletterSubscribeSchema } from "@/lib/validation/newsletter";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export interface NewsletterActionState {
  error?: string;
  success?: boolean;
}

export async function subscribeToNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const email = formData.get("email");

  if (
    typeof email === "string" &&
    !checkRateLimit(`newsletter:${email}`, 5, 60_000)
  ) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = newsletterSubscribeSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { status: "SUBSCRIBED", unsubscribedAt: null },
    create: { email: parsed.data.email },
  });

  return { success: true };
}

export async function unsubscribeFromNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const email = formData.get("email");

  if (
    typeof email === "string" &&
    !checkRateLimit(`newsletter-unsubscribe:${email}`, 5, 60_000)
  ) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = newsletterSubscribeSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (!subscriber) {
    return { error: "That email isn't subscribed." };
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  return { success: true };
}
