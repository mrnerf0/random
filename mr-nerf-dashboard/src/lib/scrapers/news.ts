/**
 * Gaming news aggregator.
 * Fetches articles from gaming news RSS feeds.
 * This scraper requires NO API keys - RSS feeds are free.
 */

import { parseStringPromise } from "xml2js";
import { createServerSupabase } from "../supabase";
import type { ContentTrend } from "@/types";

const RSS_FEEDS = [
  { name: "IGN", url: "https://feeds.feedburner.com/ign/all" },
  { name: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
  { name: "Kotaku", url: "https://kotaku.com/rss" },
];

interface NewsArticle {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
}

/** Parse an RSS feed and extract articles */
async function fetchRSSFeed(
  feedUrl: string,
  sourceName: string
): Promise<NewsArticle[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "MrNerfDashboard/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[News] Failed to fetch ${sourceName}: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });

    let items: NewsArticle[] = [];

    if (parsed.rss?.channel?.item) {
      const rawItems = Array.isArray(parsed.rss.channel.item)
        ? parsed.rss.channel.item
        : [parsed.rss.channel.item];

      items = rawItems.slice(0, 5).map(
        (item: {
          title: string;
          link: string;
          description?: string;
          pubDate?: string;
        }) => ({
          title: typeof item.title === "string" ? item.title : String(item.title),
          url: typeof item.link === "string" ? item.link : String(item.link),
          summary: stripHtml(item.description || "").substring(0, 200),
          source: sourceName,
          publishedAt: item.pubDate || new Date().toISOString(),
        })
      );
    } else if (parsed.feed?.entry) {
      const rawEntries = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];

      items = rawEntries.slice(0, 5).map(
        (entry: {
          title: string | { _: string };
          link: { $: { href: string } } | Array<{ $: { href: string } }>;
          summary?: string | { _: string };
          updated?: string;
        }) => {
          const link = Array.isArray(entry.link)
            ? entry.link[0]?.$.href
            : entry.link?.$.href;
          const title =
            typeof entry.title === "string" ? entry.title : entry.title?._ || "";
          const summary =
            typeof entry.summary === "string"
              ? entry.summary
              : entry.summary?._ || "";

          return {
            title,
            url: link || "",
            summary: stripHtml(summary).substring(0, 200),
            source: sourceName,
            publishedAt: entry.updated || new Date().toISOString(),
          };
        }
      );
    }

    return items;
  } catch (err) {
    console.warn(`[News] Error parsing ${sourceName} feed:`, err);
    return [];
  }
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Run the news scrape - returns trends and optionally stores in Supabase */
export async function scrapeNews(): Promise<ContentTrend[]> {
  console.log("[News] Starting scrape...");

  const allArticles: NewsArticle[] = [];

  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSSFeed(feed.url, feed.name);
    allArticles.push(...articles);
  }

  if (allArticles.length === 0) {
    console.log("[News] No articles found.");
    return [];
  }

  const top10 = allArticles.slice(0, 10);

  const records: ContentTrend[] = top10.map((article) => ({
    id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scraped_at: new Date().toISOString(),
    source: "news" as const,
    title: article.title,
    url: article.url,
    summary: `[${article.source}] ${article.summary}`,
    category: "news" as const,
    engagement_score: 0,
    relevance_score: null,
  }));

  // Try to persist to Supabase
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const supabase = createServerSupabase();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dbRecords = records.map(({ id, relevance_score, ...rest }) => rest);
      await supabase.from("content_trends").insert(dbRecords);
    }
  } catch (e) {
    console.warn("[News] Could not persist to Supabase:", e);
  }

  console.log(`[News] Scraped ${records.length} articles from gaming news sites`);
  return records;
}
