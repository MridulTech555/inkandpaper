"use client";

import { useActionState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadMediaAction,
  type MediaActionState,
} from "@/lib/services/media-actions";

const initialState: MediaActionState = {};

export function MediaUploadForm() {
  const [state, formAction, pending] = useActionState(
    uploadMediaAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="text-foreground-secondary file:border-border file:bg-surface file:text-foreground text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <Button type="submit" disabled={pending}>
          <UploadCloud className="h-4 w-4" />
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {state.error ? <p className="text-error text-sm">{state.error}</p> : null}
      <p className="text-foreground-muted text-xs">
        JPEG, PNG, WebP, or GIF — up to 5MB.
      </p>
    </form>
  );
}
