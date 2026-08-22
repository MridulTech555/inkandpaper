"use client";

import { dismissToast, useToasts } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const toasts = useToasts();

  return (
    <ToastProvider>
      {toasts.map((item) => (
        <Toast
          key={item.id}
          variant={item.variant}
          duration={item.duration}
          onOpenChange={(open) => {
            if (!open) dismissToast(item.id);
          }}
        >
          <div className="flex flex-col gap-1">
            {item.title ? <ToastTitle>{item.title}</ToastTitle> : null}
            {item.description ? (
              <ToastDescription>{item.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
