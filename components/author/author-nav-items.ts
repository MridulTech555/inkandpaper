import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  ImageIcon,
  LayoutDashboard,
  PenSquare,
  UserCircle,
} from "lucide-react";

export interface AuthorNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const AUTHOR_NAV_ITEMS: AuthorNavItem[] = [
  { label: "Dashboard", href: "/author", icon: LayoutDashboard },
  { label: "Articles", href: "/author/articles", icon: FileText },
  { label: "Write Article", href: "/author/articles/new", icon: PenSquare },
  { label: "Analytics", href: "/author/analytics", icon: BarChart3 },
  { label: "Media", href: "/author/media", icon: ImageIcon },
  { label: "Profile", href: "/author/profile", icon: UserCircle },
];
