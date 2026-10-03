import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Note: public author profiles live at /author/[slug] and must stay
      // crawlable — only the author dashboard sub-routes are disallowed.
      disallow: [
        "/admin",
        "/auth",
        "/api",
        "/unauthorized",
        "/account",
        "/bookmarks",
        "/notifications",
        "/author/articles",
        "/author/profile",
        "/author/analytics",
        "/author/media",
        "/newsletter/unsubscribe",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
