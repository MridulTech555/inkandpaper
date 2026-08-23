"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMediaAction } from "@/lib/services/media-actions";

// Deliberately not a <form> of its own — this control lives inside the
// account profile form, and nested <form> elements are invalid HTML. The
// upload still goes through the same uploadMediaAction as the author media
// page; it's just invoked directly instead of via useActionState.
export function AvatarUploadField({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadMediaAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) onUploaded(result.url);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Upload
      </Button>
      {error ? <p className="text-error mt-1 text-xs">{error}</p> : null}
    </div>
  );
}
