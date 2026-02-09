/**
 * Instagram metrics scraper
 * Uses a simple profile page fetch as fallback, or Apify for reliable data.
 */

import { createServerSupabase } from "../supabase";

interface InstagramMetrics {
  followerCount: number;
  engagementRate: number;
}

/**
 * Fetch Instagram metrics via Apify's Instagram Profile Scraper.
 * Requires APIFY_API_TOKEN env var.
 * Falls back to returning 0s if the API is unavailable.
 */
async function fetchInstagramMetrics(): Promise<InstagramMetrics> {
  const apifyToken = process.env.APIFY_API_TOKEN;
  const username = process.env.INSTAGRAM_USERNAME || "mrnerf";

  if (!apifyToken) {
    console.warn(
      "[Instagram] No APIFY_API_TOKEN set. Using manual fallback (zeros)."
    );
    return { followerCount: 0, engagementRate: 0 };
  }

  // Use Apify Instagram Profile Scraper actor
  const actorId = "apify~instagram-profile-scraper";
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}`;

  const res = await fetch(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernames: [username],
    }),
  });

  if (!res.ok) {
    console.warn(`[Instagram] Apify API returned ${res.status}, using zeros.`);
    return { followerCount: 0, engagementRate: 0 };
  }

  const data = await res.json();
  const profile = data?.[0];

  if (!profile) {
    console.warn("[Instagram] No profile data returned.");
    return { followerCount: 0, engagementRate: 0 };
  }

  const followerCount = profile.followersCount || 0;

  // Calculate engagement rate from recent posts
  const posts = profile.latestPosts || [];
  let engagementRate = 0;
  if (posts.length > 0 && followerCount > 0) {
    const totalEngagement = posts
      .slice(0, 10)
      .reduce(
        (sum: number, post: { likesCount?: number; commentsCount?: number }) =>
          sum + (post.likesCount || 0) + (post.commentsCount || 0),
        0
      );
    engagementRate = (totalEngagement / posts.length / followerCount) * 100;
  }

  return {
    followerCount,
    engagementRate: Math.round(engagementRate * 100) / 100,
  };
}

/** Run the Instagram scrape and store results */
export async function scrapeInstagram(): Promise<void> {
  console.log("[Instagram] Starting scrape...");

  const metrics = await fetchInstagramMetrics();
  const today = new Date().toISOString().split("T")[0];

  const supabase = createServerSupabase();
  const { error } = await supabase.from("analytics").upsert(
    {
      date: today,
      platform: "instagram",
      follower_count: metrics.followerCount,
      monthly_views: 0, // Instagram doesn't expose this easily
      engagement_rate: metrics.engagementRate,
      avg_views_last_5: 0,
    },
    { onConflict: "date,platform" }
  );

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  console.log(
    `[Instagram] Scraped: ${metrics.followerCount} followers, ${metrics.engagementRate}% engagement`
  );
}
