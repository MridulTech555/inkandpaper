import type { ArticleStatus } from "@prisma/client";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  ArticleStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  IN_REVIEW: { label: "In review", variant: "info" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "warning" },
  APPROVED: { label: "Approved", variant: "info" },
  SCHEDULED: { label: "Scheduled", variant: "info" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "outline" },
  REJECTED: { label: "Rejected", variant: "error" },
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
