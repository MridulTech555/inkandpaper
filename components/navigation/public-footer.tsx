import Link from "next/link";
import { siteConfig } from "@/config/site";

const FOOTER_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Log in", href: "/auth/login" },
  { label: "Register", href: "/auth/register" },
];

export function PublicFooter() {
  return (
    <footer className="border-border border-t">
      <div className="text-foreground-secondary mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-sm sm:flex-row sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav className="flex items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
