"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions/check";
import { profileFormSchema } from "@/lib/validation/profile";

export interface ProfileActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();

  const parsed = profileFormSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    twitter: formData.get("twitter") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, bio, avatarUrl, twitter, website } = parsed.data;

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name } }),
    prisma.authorProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        socialLinks: {
          twitter: twitter || undefined,
          website: website || undefined,
        },
      },
      create: {
        userId: user.id,
        slug: user.id,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        socialLinks: {
          twitter: twitter || undefined,
          website: website || undefined,
        },
      },
    }),
  ]);

  revalidatePath("/author/profile");
  return { success: true };
}
