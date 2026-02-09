/**
 * Reddit scraper for Nerf and gaming communities.
 * Fetches top posts from multiple subreddits using Reddit's OAuth API.
 */

import { createServerSupabase } from "../supabase";
import type { ContentTrend } from "@/types";

// Nerf and gaming subreddits to monitor
const SUBREDDITS = ["Nerf", "nerfmods", "NerfExchange", "gaming"];

interface RedditPost {
  title: string;
  url: string;
  score: number;
  numComments: number;
  flair: string;
  permalink: string;
  subreddit: string;
}

/** Authenticate with Reddit using client credentials (script app) */
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MrNerfDashboard/1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

/** Fetch top posts from a subreddit */
async function fetchTopPosts(
  subreddit: string,
  token: string,
  limit = 10
): Promise<RedditPost[]> {
  const res = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/top?t=day&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "MrNerfDashboard/1.0",
      },
    }
  );

  if (!res.ok) {
    console.warn(`[Reddit] Could not fetch r/${subreddit}: ${res.status}`);
    return [];
  }

  const data = await res.json();

  return data.data.children.map(
    (child: {
      data: {
        title: string;
        url: string;
        score: number;
        num_comments: number;
        link_flair_text: string;
        permalink: string;
        subreddit: string;
      };
    }) => ({
      title: child.data.title,
      url: child.data.url,
      score: child.data.score,
      numComments: child.data.num_comments,
      flair: child.data.link_flair_text || "General",
      permalink: `https://reddit.com${child.data.permalink}`,
      subreddit: child.data.subreddit,
    })
  );
}

/** Categorize a post based on its score */
function categorize(score: number): "viral" | "trending" | "news" {
  if (score > 10000) return "viral";
  if (score > 2000) return "trending";
  return "news";
}

/** Run the Reddit scrape - returns trends and optionally stores in Supabase */
export async function scrapeReddit(): Promise<ContentTrend[]> {
  console.log("[Reddit] Starting scrape...");

  const token = await getRedditAccessToken();
  const allPosts: RedditPost[] = [];

  for (const subreddit of SUBREDDITS) {
    const posts = await fetchTopPosts(subreddit, token);
    allPosts.push(...posts);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const records: ContentTrend[] = allPosts.map((post) => ({
    id: `reddit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scraped_at: new Date().toISOString(),
    source: "reddit" as const,
    title: post.title,
    url: post.permalink,
    summary: `r/${post.subreddit} · ${post.score} upvotes, ${post.numComments} comments. Flair: ${post.flair}`,
    category: categorize(post.score),
    engagement_score: post.score,
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
    console.warn("[Reddit] Could not persist to Supabase:", e);
  }

  console.log(`[Reddit] Scraped ${records.length} posts from ${SUBREDDITS.length} subreddits`);
  return records;
}
