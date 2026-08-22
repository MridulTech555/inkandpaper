"use client";

import { useSyncExternalStore } from "react";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "error";
  duration?: number;
}

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant: NonNullable<ToastOptions["variant"]>;
  duration: number;
}

const EMPTY_TOASTS: ToastItem[] = [];

let toasts: ToastItem[] = EMPTY_TOASTS;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

function getServerSnapshot(): ToastItem[] {
  return EMPTY_TOASTS;
}

export function toast(options: ToastOptions): string {
  const id = options.id ?? Math.random().toString(36).slice(2);
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? 5000,
  };
  toasts = [...toasts, item];
  emit();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
