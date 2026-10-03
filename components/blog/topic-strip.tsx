import Link from "next/link";
import { H2 } from "@/components/ui/typography";

export interface TopicStripItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function TopicStrip({ topics }: { topics: TopicStripItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <H2 className="text-xl sm:text-2xl">Browse by topic</H2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/category/${topic.slug}`}
            className="border-border bg-surface-elevated text-foreground-secondary hover:border-primary hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
          >
            <span className="font-medium">{topic.name}</span>
            <span className="text-foreground-muted text-xs">{topic.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
