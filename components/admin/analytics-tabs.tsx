import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { label: "Overview", href: "/admin/analytics" },
  { label: "Traffic", href: "/admin/analytics/traffic" },
  { label: "Articles", href: "/admin/analytics/articles" },
  { label: "Authors", href: "/admin/analytics/authors" },
  { label: "Engagement", href: "/admin/analytics/engagement" },
];

export function AnalyticsTabs({ current }: { current: string }) {
  return (
    <Tabs value={current}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.href} value={tab.href} asChild>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
