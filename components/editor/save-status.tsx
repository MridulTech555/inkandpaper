import { Check, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;

  const config = {
    dirty: {
      icon: CloudOff,
      label: "Unsaved changes",
      className: "text-foreground-muted",
    },
    saving: {
      icon: Loader2,
      label: "Saving…",
      className: "text-foreground-muted",
    },
    saved: { icon: Check, label: "Saved", className: "text-success" },
    error: { icon: CloudOff, label: "Couldn't save", className: "text-error" },
  }[state];

  const Icon = config.icon;

  return (
    <span className={cn("flex items-center gap-1.5 text-sm", config.className)}>
      <Icon
        className={cn("h-3.5 w-3.5", state === "saving" && "animate-spin")}
      />
      {config.label}
    </span>
  );
}
