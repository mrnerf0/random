/**
 * Unified scraper runner
 * Executes all scrapers sequentially with error handling.
 */

import { scrapeYouTube } from "./youtube";
import { scrapeInstagram } from "./instagram";
import { scrapeReddit } from "./reddit";
import { scrapeTwitter } from "./twitter";
import { scrapeNews } from "./news";

export interface ScrapeResult {
  source: string;
  success: boolean;
  error?: string;
}

/** Run all scrapers and collect results */
export async function runAllScrapers(): Promise<ScrapeResult[]> {
  const scrapers = [
    { name: "YouTube", fn: scrapeYouTube },
    { name: "Instagram", fn: scrapeInstagram },
    { name: "Reddit", fn: scrapeReddit },
    { name: "Twitter", fn: scrapeTwitter },
    { name: "News", fn: scrapeNews },
  ];

  const results: ScrapeResult[] = [];

  for (const scraper of scrapers) {
    try {
      await scraper.fn();
      results.push({ source: scraper.name, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${scraper.name}] Scrape failed:`, message);
      results.push({ source: scraper.name, success: false, error: message });
    }
  }

  return results;
}
