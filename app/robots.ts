import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/author", "/auth", "/api", "/unauthorized"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
