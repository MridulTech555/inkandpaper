import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { H2 } from "@/components/ui/typography";

export interface ArticleSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  gridClassName?: string;
}

export function ArticleSection({
  title,
  children,
  className,
  gridClassName,
}: ArticleSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <H2 className="text-xl sm:text-2xl">{title}</H2>
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          gridClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
