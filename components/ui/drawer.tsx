"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;

const drawerVariants = cva(
  "fixed z-50 flex flex-col border-border bg-surface-elevated shadow-lg",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-3/4 max-w-xs border-r",
        right: "inset-y-0 right-0 h-full w-3/4 max-w-xs border-l",
        bottom: "inset-x-0 bottom-0 max-h-[80vh] w-full rounded-t-lg border-t",
      },
    },
    defaultVariants: { side: "left" },
  },
);

export interface DrawerContentProps
  extends
    DialogPrimitive.DialogContentProps,
    VariantProps<typeof drawerVariants> {}

export function DrawerContent({
  className,
  side,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(drawerVariants({ side }), "p-4", className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="text-foreground-muted hover:text-foreground focus-visible:ring-primary absolute top-4 right-4 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
