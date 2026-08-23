"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { updateSettingAction } from "@/lib/services/settings-actions";
import type { SettingsSection } from "@/lib/validation/settings";

export type SettingsFieldDef =
  | {
      key: string;
      label: string;
      type: "text" | "url" | "email";
      placeholder?: string;
    }
  | { key: string; label: string; type: "textarea" }
  | { key: string; label: string; type: "checkbox"; description?: string }
  | { key: string; label: string; type: "select"; options: string[] };

export function SettingsForm({
  section,
  fields,
  initialValue,
}: {
  section: SettingsSection;
  fields: SettingsFieldDef[];
  initialValue: Record<string, unknown>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValue);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateSettingAction(section, values);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast({ title: "Settings saved" });
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {fields.map((field) => {
        const value = values[field.key];
        if (field.type === "checkbox") {
          return (
            <div
              key={field.key}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.description ? (
                  <p className="text-foreground-muted text-xs">
                    {field.description}
                  </p>
                ) : null}
              </div>
              <Switch
                id={field.key}
                checked={Boolean(value)}
                onCheckedChange={(checked) => setField(field.key, checked)}
              />
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => setField(field.key, e.target.value)}
                rows={3}
              />
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Select
                value={typeof value === "string" ? value : field.options[0]}
                onValueChange={(next) => setField(field.key, next)}
              >
                <SelectTrigger id={field.key}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type={field.type === "email" ? "email" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
      })}

      {error ? <p className="text-error text-sm">{error}</p> : null}

      <div>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
