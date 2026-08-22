import { requireUser } from "@/lib/permissions/check";
import { getAuthorMedia } from "@/lib/services/media";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaUploadForm } from "@/components/author/media-upload-form";
import { MediaGrid } from "@/components/author/media-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageIcon } from "lucide-react";

interface MediaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AuthorMediaPage({
  searchParams,
}: MediaPageProps) {
  const user = await requireUser();
  const { q } = await searchParams;

  const media = await getAuthorMedia(user.id, q);

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Media</H1>

      <MediaUploadForm />

      <form method="GET" className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by filename…"
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={q ? "No files match your search" : "No media yet"}
          description={
            q
              ? "Try a different filename."
              : "Upload your first image to get started."
          }
        />
      ) : (
        <MediaGrid media={media} />
      )}
    </div>
  );
}
