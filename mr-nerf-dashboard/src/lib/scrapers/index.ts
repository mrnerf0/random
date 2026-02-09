/**
 * Unified scraper runner.
 * Executes all scrapers sequentially with error handling.
 * Returns both status results and scraped content trends.
 */

import { scrapeYouTube } from "./youtube";
import { scrapeInstagram } from "./instagram";
import { scrapeReddit } from "./reddit";
import { scrapeTwitter } from "./twitter";
import { scrapeNews } from "./news";
import type { ContentTrend } from "@/types";

export interface ScrapeResult {
  source: string;
  success: boolean;
  error?: string;
  count?: number;
}

export interface ScrapeOutput {
  results: ScrapeResult[];
  trends: ContentTrend[];
}

/** Run all scrapers and collect results + scraped data */
export async function runAllScrapers(): Promise<ScrapeOutput> {
  const results: ScrapeResult[] = [];
  const allTrends: ContentTrend[] = [];

  // YouTube and Instagram are analytics scrapers (not content trends)
  const analyticScrapers = [
    { name: "YouTube", fn: scrapeYouTube },
    { name: "Instagram", fn: scrapeInstagram },
  ];

  // Content trend scrapers that return ContentTrend[]
  const trendScrapers = [
    { name: "Reddit", fn: scrapeReddit },
    { name: "Twitter", fn: scrapeTwitter },
    { name: "News", fn: scrapeNews },
  ];

  // Run analytics scrapers
  for (const scraper of analyticScrapers) {
    try {
      await scraper.fn();
      results.push({ source: scraper.name, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${scraper.name}] Scrape failed:`, message);
      results.push({ source: scraper.name, success: false, error: message });
    }
  }

  // Run trend scrapers and collect returned data
  for (const scraper of trendScrapers) {
    try {
      const trends = await scraper.fn();
      allTrends.push(...trends);
      results.push({ source: scraper.name, success: true, count: trends.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${scraper.name}] Scrape failed:`, message);
      results.push({ source: scraper.name, success: false, error: message });
    }
  }

  return { results, trends: allTrends };
}
