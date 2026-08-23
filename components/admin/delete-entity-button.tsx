"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";

export function DeleteEntityButton({
  id,
  title,
  description,
  successMessage,
  action,
}: {
  id: string;
  title: string;
  description: string;
  successMessage: string;
  action: (id: string) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action(id);
      if (result.error) {
        toast({
          title: "Couldn't delete",
          description: result.error,
          variant: "error",
        });
        setOpen(false);
        return;
      }
      toast({ title: successMessage });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="text-error h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        loading={isPending}
      />
    </>
  );
}
