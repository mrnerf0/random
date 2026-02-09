/**
 * Shared utility to fetch content trends from the best available source.
 * 1. Supabase (if configured and has data)
 * 2. Live scraping (news RSS feeds need no keys)
 * 3. Demo data fallback
 */

import { createServerSupabase } from "./supabase";
import { demoTrends } from "./demo-data";
import type { ContentTrend } from "@/types";

export async function getTrends(source?: string): Promise<ContentTrend[]> {
  // 1. Try Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    try {
      const supabase = createServerSupabase();
      let query = supabase
        .from("content_trends")
        .select("*")
        .order("scraped_at", { ascending: false })
        .limit(50);

      if (source) {
        query = query.eq("source", source);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fall through
    }
  }

  // 2. Try live scraping from RSS news feeds (no API keys needed)
  try {
    const newsData = await scrapeNewsRSS();
    if (newsData.length > 0) {
      // If a source filter is applied and it's not "news", fall through to demo
      if (source && source !== "news") {
        // Can't scrape reddit/twitter without keys, fall through
      } else {
        return newsData;
      }
    }
  } catch {
    // Fall through
  }

  // 3. Demo data fallback
  let data = demoTrends;
  if (source) {
    data = data.filter((t) => t.source === source);
  }
  return data;
}

/**
 * Minimal RSS news scraper that works without any API keys.
 * Fetches from gaming/nerf RSS feeds directly.
 */
async function scrapeNewsRSS(): Promise<ContentTrend[]> {
  const feeds = [
    { name: "IGN", url: "https://feeds.feedburner.com/ign/all" },
    { name: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
  ];

  const trends: ContentTrend[] = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "MrNerfDashboard/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;

      const xml = await res.text();
      // Simple RSS parsing without xml2js dependency
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
      for (const item of items.slice(0, 5)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1]
          || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
          || item.match(/<description>(.*?)<\/description>/)?.[1]
          || "";

        if (title) {
          trends.push({
            id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            scraped_at: new Date().toISOString(),
            source: "news",
            title: title.replace(/<[^>]*>/g, ""),
            url: link,
            summary: `[${feed.name}] ${desc.replace(/<[^>]*>/g, "").substring(0, 200)}`,
            category: "news",
            engagement_score: 0,
            relevance_score: null,
          });
        }
      }
    } catch {
      // Skip failed feeds
    }
  }

  return trends;
}
