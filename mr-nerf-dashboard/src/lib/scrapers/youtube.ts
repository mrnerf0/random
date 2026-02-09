/**
 * YouTube Data API scraper
 * Fetches channel statistics and recent video performance.
 */

import { createServerSupabase } from "../supabase";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

interface VideoStats {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

/** Fetch channel-level statistics (subscribers, total views) */
async function getChannelStats(): Promise<YouTubeChannelStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID");
  }

  const url = `${YOUTUBE_API_BASE}/channels?part=statistics&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const stats = data.items?.[0]?.statistics;

  if (!stats) {
    throw new Error("No channel data returned from YouTube API");
  }

  return {
    subscriberCount: parseInt(stats.subscriberCount, 10),
    viewCount: parseInt(stats.viewCount, 10),
    videoCount: parseInt(stats.videoCount, 10),
  };
}

/** Fetch the last N videos from the channel's uploads playlist */
async function getRecentVideos(count = 5): Promise<VideoStats[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID");
  }

  // Step 1: Get the uploads playlist ID
  const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("Could not find uploads playlist");
  }

  // Step 2: Get recent video IDs from the playlist
  const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${count}&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl);
  const playlistData = await playlistRes.json();
  const videoIds = playlistData.items?.map(
    (item: { contentDetails: { videoId: string } }) =>
      item.contentDetails.videoId
  );

  if (!videoIds?.length) {
    return [];
  }

  // Step 3: Get detailed stats for each video
  const videosUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${apiKey}`;
  const videosRes = await fetch(videosUrl);
  const videosData = await videosRes.json();

  return videosData.items.map(
    (video: {
      id: string;
      snippet: { title: string; publishedAt: string };
      statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
      };
    }) => ({
      id: video.id,
      title: video.snippet.title,
      views: parseInt(video.statistics.viewCount, 10),
      likes: parseInt(video.statistics.likeCount, 10),
      comments: parseInt(video.statistics.commentCount, 10),
      publishedAt: video.snippet.publishedAt,
    })
  );
}

/** Run the full YouTube scrape and store results in Supabase */
export async function scrapeYouTube(): Promise<void> {
  console.log("[YouTube] Starting scrape...");

  const [channelStats, recentVideos] = await Promise.all([
    getChannelStats(),
    getRecentVideos(5),
  ]);

  const avgViewsLast5 =
    recentVideos.length > 0
      ? Math.round(
          recentVideos.reduce((sum, v) => sum + v.views, 0) /
            recentVideos.length
        )
      : 0;

  // Calculate engagement rate: (likes + comments) / views * 100
  const totalEngagement = recentVideos.reduce(
    (sum, v) => sum + v.likes + v.comments,
    0
  );
  const totalViews = recentVideos.reduce((sum, v) => sum + v.views, 0);
  const engagementRate =
    totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

  const today = new Date().toISOString().split("T")[0];

  const supabase = createServerSupabase();
  const { error } = await supabase.from("analytics").upsert(
    {
      date: today,
      platform: "youtube",
      follower_count: channelStats.subscriberCount,
      monthly_views: channelStats.viewCount,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      avg_views_last_5: avgViewsLast5,
    },
    { onConflict: "date,platform" }
  );

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  console.log(
    `[YouTube] Scraped: ${channelStats.subscriberCount} subs, avg ${avgViewsLast5} views/video`
  );
}
