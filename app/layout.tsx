import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { siteConfig } from "@/config/site";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const articleSerif = Source_Serif_4({
  variable: "--font-article-serif",
  subsets: ["latin"],
});

const titleConfig = {
  default: siteConfig.name,
  template: `%s | ${siteConfig.name}`,
};

export const metadata: Metadata = {
  title: titleConfig,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${siteConfig.name} — Articles` },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: titleConfig,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: titleConfig,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${articleSerif.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
