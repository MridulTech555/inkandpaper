"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  changeUserRoleAction,
  setUserStatusAction,
} from "@/lib/services/user-actions";

export function UserRowActions({
  userId,
  currentRoleId,
  status,
  roles,
  isSelf,
}: {
  userId: string;
  currentRoleId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  roles: { id: string; name: string }[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  function handleRoleSave() {
    startTransition(async () => {
      const result = await changeUserRoleAction(userId, selectedRoleId);
      if (result.error) {
        toast({
          title: "Couldn't change role",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Role updated" });
      setRoleDialogOpen(false);
      router.refresh();
    });
  }

  function handleStatusToggle() {
    startTransition(async () => {
      const result = await setUserStatusAction(userId, nextStatus);
      if (result.error) {
        toast({
          title: "Couldn't update status",
          description: result.error,
          variant: "error",
        });
        setStatusConfirmOpen(false);
        return;
      }
      toast({
        title: nextStatus === "ACTIVE" ? "User activated" : "User deactivated",
      });
      setStatusConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="User actions"
            disabled={isSelf}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRoleDialogOpen(true)}>
            Change role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setStatusConfirmOpen(true)}>
            {status === "ACTIVE" ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              This changes what this user can access immediately.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRoleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        title={
          status === "ACTIVE" ? "Deactivate this user?" : "Activate this user?"
        }
        description={
          status === "ACTIVE"
            ? "They will no longer be able to sign in."
            : "They will be able to sign in again."
        }
        confirmLabel={status === "ACTIVE" ? "Deactivate" : "Activate"}
        confirmVariant={status === "ACTIVE" ? "destructive" : "primary"}
        onConfirm={handleStatusToggle}
        loading={isPending}
      />
    </>
  );
}
