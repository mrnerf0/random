/**
 * Twitter/X scraper for gaming news accounts
 * Uses Twitter API v2 with Bearer token authentication.
 */

import { createServerSupabase } from "../supabase";

// Gaming news accounts to monitor
const GAMING_ACCOUNTS = ["Dexerto", "VGC_News", "charlieINTEL"];

interface Tweet {
  id: string;
  text: string;
  authorUsername: string;
  metrics: {
    retweets: number;
    likes: number;
    replies: number;
  };
}

/** Fetch recent tweets from a specific user */
async function fetchUserTweets(username: string): Promise<Tweet[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error("Missing TWITTER_BEARER_TOKEN");
  }

  // First get the user ID
  const userRes = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
    }
  );

  if (!userRes.ok) {
    console.warn(`[Twitter] Could not fetch user ${username}: ${userRes.status}`);
    return [];
  }

  const userData = await userRes.json();
  const userId = userData.data?.id;

  if (!userId) return [];

  // Fetch recent tweets (last 24 hours)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&start_time=${since}&tweet.fields=public_metrics`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
    }
  );

  if (!tweetsRes.ok) {
    console.warn(
      `[Twitter] Could not fetch tweets for ${username}: ${tweetsRes.status}`
    );
    return [];
  }

  const tweetsData = await tweetsRes.json();

  if (!tweetsData.data) return [];

  return tweetsData.data.map(
    (tweet: {
      id: string;
      text: string;
      public_metrics: {
        retweet_count: number;
        like_count: number;
        reply_count: number;
      };
    }) => ({
      id: tweet.id,
      text: tweet.text,
      authorUsername: username,
      metrics: {
        retweets: tweet.public_metrics.retweet_count,
        likes: tweet.public_metrics.like_count,
        replies: tweet.public_metrics.reply_count,
      },
    })
  );
}

/** Run the Twitter scrape and store results */
export async function scrapeTwitter(): Promise<void> {
  console.log("[Twitter] Starting scrape...");

  const allTweets: Tweet[] = [];

  for (const account of GAMING_ACCOUNTS) {
    const tweets = await fetchUserTweets(account);
    allTweets.push(...tweets);
    // Small delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (allTweets.length === 0) {
    console.log("[Twitter] No tweets found in the last 24 hours.");
    return;
  }

  const supabase = createServerSupabase();

  const records = allTweets.map((tweet) => {
    const totalEngagement =
      tweet.metrics.retweets + tweet.metrics.likes + tweet.metrics.replies;
    return {
      source: "twitter" as const,
      title: tweet.text.substring(0, 200),
      url: `https://twitter.com/${tweet.authorUsername}/status/${tweet.id}`,
      summary: `@${tweet.authorUsername}: ${tweet.metrics.likes} likes, ${tweet.metrics.retweets} RTs`,
      category: totalEngagement > 1000 ? ("viral" as const) : ("trending" as const),
      engagement_score: totalEngagement,
    };
  });

  const { error } = await supabase.from("content_trends").insert(records);

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  console.log(
    `[Twitter] Scraped ${records.length} tweets from ${GAMING_ACCOUNTS.length} accounts`
  );
}
