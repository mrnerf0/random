/**
 * CLI runner for scrapers (used by GitHub Actions).
 * Execute with: npx tsx src/lib/scrapers/run.ts
 */

import { runAllScrapers } from "./index";

async function main() {
  console.log("=== Mr. Nerf Dashboard - Daily Scrape ===");
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log("");

  const { results, trends } = await runAllScrapers();

  console.log("\n=== Results ===");
  for (const result of results) {
    const status = result.success ? "OK" : "FAILED";
    console.log(`  ${result.source}: ${status}${result.error ? ` - ${result.error}` : ""}${result.count ? ` (${result.count} items)` : ""}`);
  }
  console.log(`\nTotal trends scraped: ${trends.length}`);

  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.error(`\n${failures.length} scraper(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll scrapers completed successfully.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
