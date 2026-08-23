import type { CommentStatus } from "@prisma/client";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getAdminComments } from "@/lib/services/admin-comments";
import { H1 } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentRowActions } from "@/components/admin/comment-row-actions";
import type { AdminCommentListItem } from "@/lib/services/admin-comments";

const STATUS_VARIANT = {
  VISIBLE: "success",
  PENDING: "default",
  REPORTED: "warning",
  HIDDEN: "outline",
  DELETED: "error",
} as const;

const TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Visible", value: "VISIBLE" },
  { label: "Reported", value: "REPORTED" },
  { label: "Hidden", value: "HIDDEN" },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface AdminCommentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const { status: statusParam } = await searchParams;
  const status = TABS.find((t) => t.value === statusParam)?.value as
    CommentStatus | undefined;

  const comments = await getAdminComments(status);

  const columns: DataTableColumn<AdminCommentListItem>[] = [
    {
      key: "content",
      header: "Comment",
      render: (comment) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-sm">{comment.content}</span>
          <span className="text-foreground-muted text-xs">
            {comment.user.name} on{" "}
            <Link
              href={`/article/${comment.article.slug}`}
              className="hover:text-primary hover:underline"
            >
              {comment.article.title}
            </Link>
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (comment) => (
        <Badge variant={STATUS_VARIANT[comment.status]}>{comment.status}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (comment) => formatDate(comment.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (comment) => (
        <CommentRowActions commentId={comment.id} status={comment.status} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Comments</H1>

      <Tabs value={status ?? ""}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.label} value={tab.value} asChild>
              <Link
                href={
                  tab.value
                    ? `/admin/comments?status=${tab.value}`
                    : "/admin/comments"
                }
              >
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments"
          description="Comments matching this filter will show up here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={comments}
          getRowId={(comment) => comment.id}
        />
      )}
    </div>
  );
}
