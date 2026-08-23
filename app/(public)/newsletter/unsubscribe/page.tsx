import type { Metadata } from "next";
import { H1 } from "@/components/ui/typography";
import { UnsubscribeForm } from "@/components/blog/unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe",
};

interface UnsubscribePageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <H1>Unsubscribe</H1>
        <p className="text-foreground-secondary mt-2 text-sm">
          Sorry to see you go. Confirm your email to stop receiving updates.
        </p>
      </div>
      <UnsubscribeForm defaultEmail={email} />
    </div>
  );
}
