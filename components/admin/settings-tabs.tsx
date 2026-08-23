import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsSection } from "@/lib/validation/settings";

const TABS: { label: string; section: SettingsSection }[] = [
  { label: "General", section: "general" },
  { label: "Branding", section: "branding" },
  { label: "SEO", section: "seo" },
  { label: "Notifications", section: "notifications" },
  { label: "Security", section: "security" },
  { label: "Integrations", section: "integrations" },
];

export function SettingsTabs({ current }: { current: SettingsSection }) {
  return (
    <Tabs value={current}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.section} value={tab.section} asChild>
            <Link href={`/admin/settings/${tab.section}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
