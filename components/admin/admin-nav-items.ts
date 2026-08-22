import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  FolderTree,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Plug,
  ScrollText,
  Settings,
  Tags,
  Users,
  UsersRound,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_DASHBOARD_ITEM: AdminNavItem = {
  label: "Dashboard",
  href: "/admin",
  icon: LayoutDashboard,
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Content",
    items: [
      { label: "Articles", href: "/admin/articles", icon: FileText },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Tags", href: "/admin/tags", icon: Tags },
      { label: "Media", href: "/admin/media", icon: ImageIcon },
      { label: "Comments", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Authors", href: "/admin/authors", icon: Users },
      { label: "Users", href: "/admin/users", icon: UsersRound },
      { label: "Roles", href: "/admin/roles", icon: KeyRound },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Subscribers", href: "/admin/subscribers", icon: UsersRound },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];
