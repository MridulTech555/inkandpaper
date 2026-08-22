"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastAction = ToastPrimitive.Action;

export function ToastViewport({
  className,
  ...props
}: ToastPrimitive.ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 sm:right-4 sm:bottom-4",
        className,
      )}
      {...props}
    />
  );
}

const toastVariants = cva(
  "relative flex w-full items-start gap-3 rounded-md border p-4 shadow-md",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-elevated text-foreground",
        success: "border-success/30 bg-surface-elevated text-foreground",
        warning: "border-warning/30 bg-surface-elevated text-foreground",
        error: "border-error/30 bg-surface-elevated text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ToastProps
  extends ToastPrimitive.ToastProps, VariantProps<typeof toastVariants> {}

export function Toast({ className, variant, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

export function ToastTitle({
  className,
  ...props
}: ToastPrimitive.ToastTitleProps) {
  return (
    <ToastPrimitive.Title
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

export function ToastDescription({
  className,
  ...props
}: ToastPrimitive.ToastDescriptionProps) {
  return (
    <ToastPrimitive.Description
      className={cn("text-foreground-secondary text-sm", className)}
      {...props}
    />
  );
}

export function ToastClose({
  className,
  ...props
}: ToastPrimitive.ToastCloseProps) {
  return (
    <ToastPrimitive.Close
      className={cn(
        "text-foreground-muted hover:text-foreground focus-visible:ring-primary absolute top-2 right-2 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitive.Close>
  );
}
