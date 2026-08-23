import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions/check";
import {
  getAccountActivityCounts,
  getAccountProfile,
  getRecentComments,
  getRecentLikes,
} from "@/lib/services/account";
import { H1 } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { AccountActivity } from "@/components/account/account-activity";

export const metadata: Metadata = {
  title: "Your account",
};

function formatMemberSince(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const user = await requireUser();

  const [profile, counts, recentComments, recentLikes] = await Promise.all([
    getAccountProfile(user.id),
    getAccountActivityCounts(user.id),
    getRecentComments(user.id),
    getRecentLikes(user.id),
  ]);

  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <H1>Your account</H1>
          <p className="text-foreground-secondary text-sm">
            Member since {formatMemberSince(profile.createdAt)}
          </p>
        </div>
        <Badge variant="outline">{profile.role.name}</Badge>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AccountProfileForm
            values={{
              name: profile.name,
              bio: profile.bio ?? "",
              avatarUrl: profile.avatarUrl ?? "",
            }}
          />
        </TabsContent>

        <TabsContent value="activity">
          <AccountActivity
            counts={counts}
            recentComments={recentComments}
            recentLikes={recentLikes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
