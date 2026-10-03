import { getPublishedArticles } from "@/lib/services/articles";
import { siteConfig } from "@/config/site";

// Revalidate hourly — new articles don't need to appear in the feed instantly.
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

export async function GET() {
  const articles = await getPublishedArticles(50);
  const updated = articles[0]?.publishedAt ?? new Date();

  const items = articles
    .map((article) => {
      const url = `${siteConfig.url}/article/${article.slug}`;
      const pubDate = (article.publishedAt ?? new Date()).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      ${article.author.name ? `<dc:creator>${escapeXml(article.author.name)}</dc:creator>` : ""}
      ${article.category ? `<category>${escapeXml(article.category.name)}</category>` : ""}
      ${article.excerpt ? `<description>${escapeXml(article.excerpt)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteConfig.url}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
