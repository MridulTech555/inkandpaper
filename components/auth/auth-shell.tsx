import type { ReactNode } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";

const HIGHLIGHTS = [
  "A distraction-free block editor",
  "Editorial review before anything publishes",
  "Analytics that actually matter",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      {/* Branding panel — hidden on small screens, where the form alone carries the page. */}
      <div className="from-primary relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br to-[#1e1b4b] p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 font-serif text-xl font-semibold"
        >
          <PenLine className="h-5 w-5" />
          Ink &amp; Paper
        </Link>

        <div className="relative z-10 flex flex-col gap-6">
          <blockquote className="font-serif text-3xl leading-tight font-medium text-balance xl:text-4xl">
            &ldquo;The best client component is the one you didn&apos;t have
            to write.&rdquo;
          </blockquote>
          <ul className="flex flex-col gap-2.5 text-sm text-white/70">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5">
                <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Ink &amp; Paper
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="animate-auth-in flex w-full max-w-sm flex-col gap-8">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 font-serif text-lg font-semibold lg:hidden"
          >
            <PenLine className="h-5 w-5" />
            Ink &amp; Paper
          </Link>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-foreground-secondary text-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
