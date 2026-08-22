import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDraftArticleAction } from "@/lib/services/article-mutations";

/**
 * Creating a draft has to be a real form submission (not a plain link to a
 * page that calls the action during render) — Server Actions can only call
 * revalidatePath/redirect from an actual action invocation.
 */
export function WriteArticleButton() {
  return (
    <form action={createDraftArticleAction}>
      <Button type="submit">
        <PenSquare className="h-4 w-4" />
        Write article
      </Button>
    </form>
  );
}
