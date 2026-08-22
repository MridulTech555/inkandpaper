"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { label: "All", value: "" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Scheduled", value: "SCHEDULED" },
] as const;

export function ArticleTabs({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Tabs value={currentStatus} onValueChange={handleChange}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
