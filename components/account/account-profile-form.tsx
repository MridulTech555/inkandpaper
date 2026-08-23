"use client";

import { useActionState, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MediaPickerDialog } from "@/components/author/media-picker-dialog";
import { AvatarUploadField } from "@/components/account/avatar-upload-field";
import {
  updateAccountProfileAction,
  type AccountActionState,
} from "@/lib/services/account-actions";

export interface AccountProfileFormValues {
  name: string;
  bio: string;
  avatarUrl: string;
}

const initialState: AccountActionState = {};

export function AccountProfileForm({
  values,
}: {
  values: AccountProfileFormValues;
}) {
  const [state, formAction, pending] = useActionState(
    updateAccountProfileAction,
    initialState,
  );
  const [avatarUrl, setAvatarUrl] = useState(values.avatarUrl);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar
          fallback={values.name.charAt(0)}
          src={avatarUrl || undefined}
          size="lg"
        />
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <div className="flex gap-2">
            <Input
              id="avatarUrl"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://…"
            />
            <AvatarUploadField onUploaded={setAvatarUrl} />
            <MediaPickerDialog
              onSelect={setAvatarUrl}
              trigger={
                <Button type="button" variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4" />
                  Browse
                </Button>
              }
            />
          </div>
          <p className="text-foreground-muted text-xs">
            Upload a new image, browse ones you&apos;ve already uploaded, or
            paste a URL.
          </p>
          {state.fieldErrors?.avatarUrl?.map((message) => (
            <p key={message} className="text-error text-xs">
              {message}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={values.name} required />
        {state.fieldErrors?.name?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">About</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={values.bio}
          placeholder="A little about you…"
          rows={3}
          maxLength={280}
        />
        {state.fieldErrors?.bio?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      {state.success ? (
        <p className="text-success text-sm">Profile updated.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
