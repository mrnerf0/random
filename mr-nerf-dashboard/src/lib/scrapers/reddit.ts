/**
 * Reddit scraper for r/gaming
 * Fetches top posts from the last 24 hours using Reddit's OAuth API.
 */

import { createServerSupabase } from "../supabase";

interface RedditPost {
  title: string;
  url: string;
  score: number;
  numComments: number;
  flair: string;
  permalink: string;
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

/** Fetch top posts from r/gaming */
async function fetchTopPosts(limit = 20): Promise<RedditPost[]> {
  const token = await getRedditAccessToken();

  const res = await fetch(
    `https://oauth.reddit.com/r/gaming/top?t=day&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "MrNerfDashboard/1.0",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Reddit API error: ${res.status}`);
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
      };
    }) => ({
      title: child.data.title,
      url: child.data.url,
      score: child.data.score,
      numComments: child.data.num_comments,
      flair: child.data.link_flair_text || "General",
      permalink: `https://reddit.com${child.data.permalink}`,
    })
  );
}

/** Categorize a post based on its score */
function categorize(score: number): "viral" | "trending" | "news" {
  if (score > 10000) return "viral";
  if (score > 2000) return "trending";
  return "news";
}

/** Run the Reddit scrape and store results */
export async function scrapeReddit(): Promise<void> {
  console.log("[Reddit] Starting scrape...");

  const posts = await fetchTopPosts(20);
  const supabase = createServerSupabase();

  const records = posts.map((post) => ({
    source: "reddit" as const,
    title: post.title,
    url: post.permalink,
    summary: `${post.score} upvotes, ${post.numComments} comments. Flair: ${post.flair}`,
    category: categorize(post.score),
    engagement_score: post.score,
  }));

  const { error } = await supabase.from("content_trends").insert(records);

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  console.log(`[Reddit] Scraped ${records.length} posts from r/gaming`);
}
