import type { LucideIcon } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function IconInput({
  icon: Icon,
  className,
  ...props
}: InputProps & { icon: LucideIcon }) {
  return (
    <div className="relative">
      <Icon className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}
