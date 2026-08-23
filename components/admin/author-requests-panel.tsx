"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import {
  approveAuthorRequestAction,
  rejectAuthorRequestAction,
} from "@/lib/services/author-request-actions";

export interface AuthorRequestEntry {
  id: string;
  message: string | null;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}

export function AuthorRequestsPanel({
  requests,
}: {
  requests: AuthorRequestEntry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(action: "approve" | "reject", requestId: string) {
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveAuthorRequestAction(requestId)
          : await rejectAuthorRequestAction(requestId);
      if (result.error) {
        toast({
          title: "Something went wrong",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({
        title:
          action === "approve" ? "Author request approved" : "Request rejected",
      });
      router.refresh();
    });
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No pending requests"
        description="Readers asking for author access will show up here."
      />
    );
  }

  return (
    <ul id="author-requests" className="flex flex-col gap-3">
      {requests.map((request) => (
        <li
          key={request.id}
          className="border-border bg-surface-elevated flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground text-sm font-medium">
              {request.user.name}
            </span>
            <span className="text-foreground-muted text-xs">
              {request.user.email}
            </span>
            {request.message ? (
              <p className="text-foreground-secondary mt-1 text-sm">
                &ldquo;{request.message}&rdquo;
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => handle("reject", request.id)}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handle("approve", request.id)}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
