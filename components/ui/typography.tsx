import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TextProps {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

function makeText(defaultElement: ElementType, baseClassName: string) {
  return function Text({ as, className, ...props }: TextProps) {
    const Component = as ?? defaultElement;
    return <Component className={cn(baseClassName, className)} {...props} />;
  };
}

// UI typography (Geist sans) -------------------------------------------------

export const Display = makeText(
  "h1",
  "text-5xl sm:text-6xl font-bold tracking-tight text-foreground",
);
export const H1 = makeText(
  "h1",
  "text-4xl font-bold tracking-tight text-foreground",
);
export const H2 = makeText(
  "h2",
  "text-3xl font-semibold tracking-tight text-foreground",
);
export const H3 = makeText("h3", "text-2xl font-semibold text-foreground");
export const H4 = makeText("h4", "text-xl font-semibold text-foreground");
export const Body = makeText("p", "text-base text-foreground");
export const BodyLarge = makeText("p", "text-lg text-foreground");
export const BodySmall = makeText("p", "text-sm text-foreground-secondary");
export const Caption = makeText("span", "text-xs text-foreground-muted");
export const Label = makeText("label", "text-sm font-medium text-foreground");

// Article typography (serif) -------------------------------------------------

export const ArticleTitle = makeText(
  "h1",
  "font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground",
);
export const ArticleHeading = makeText(
  "h2",
  "font-serif text-2xl font-semibold text-foreground",
);
export const ArticleBody = makeText(
  "p",
  "font-serif text-lg leading-relaxed text-foreground",
);
export const ArticleQuote = makeText(
  "blockquote",
  "font-serif text-xl italic leading-relaxed text-foreground-secondary border-l-4 border-primary pl-4",
);
export const Code = makeText(
  "code",
  "font-mono text-sm bg-surface text-foreground rounded px-1.5 py-0.5",
);
