import { requireUser } from "@/lib/permissions/check";
import { prisma } from "@/lib/db/prisma";
import { H1 } from "@/components/ui/typography";
import { ProfileForm } from "@/components/author/profile-form";

function parseSocialLinks(value: unknown): {
  twitter: string;
  website: string;
} {
  if (!value || typeof value !== "object") return { twitter: "", website: "" };
  const record = value as Record<string, unknown>;
  return {
    twitter: typeof record.twitter === "string" ? record.twitter : "",
    website: typeof record.website === "string" ? record.website : "",
  };
}

export default async function AuthorProfilePage() {
  const user = await requireUser();

  const profile = await prisma.authorProfile.findUnique({
    where: { userId: user.id },
    select: { bio: true, avatarUrl: true, socialLinks: true },
  });

  const social = parseSocialLinks(profile?.socialLinks);

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Profile</H1>
      <ProfileForm
        values={{
          name: user.name,
          bio: profile?.bio ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          twitter: social.twitter,
          website: social.website,
        }}
      />
    </div>
  );
}
