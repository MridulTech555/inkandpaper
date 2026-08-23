"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions/check";
import { accountProfileSchema } from "@/lib/validation/account";

export interface AccountActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

export async function updateAccountProfileAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser();

  const parsed = accountProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, bio, avatarUrl } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
    },
  });

  revalidatePath("/account");
  return { success: true };
}
