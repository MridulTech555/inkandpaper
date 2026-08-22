export const siteConfig = {
  name: "Ink & Paper",
  description: "A production-ready blogging platform.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
