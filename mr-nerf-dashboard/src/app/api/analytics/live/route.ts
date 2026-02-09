import { NextResponse } from "next/server";
import { demoLiveStats } from "@/lib/demo-data";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function GET() {
  const ytKey = process.env.YOUTUBE_API_KEY;
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const apifyToken = process.env.APIFY_API_TOKEN;
  const igUsername = process.env.INSTAGRAM_USERNAME || "mr.nerf";

  let youtube = demoLiveStats.youtube;
  let instagram = demoLiveStats.instagram;

  // Fetch live YouTube data
  if (ytKey && ytChannelId) {
    try {
      const channelRes = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=statistics,contentDetails&id=${ytChannelId}&key=${ytKey}`
      );
      const channelData = await channelRes.json();
      const stats = channelData.items?.[0]?.statistics;
      const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (stats) {
        youtube = {
          subscribers: parseInt(stats.subscriberCount, 10),
          totalViews: parseInt(stats.viewCount, 10),
          videoCount: parseInt(stats.videoCount, 10),
          recentVideos: [],
        };

        // Fetch recent videos
        if (uploadsId) {
          const plRes = await fetch(
            `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${uploadsId}&maxResults=5&key=${ytKey}`
          );
          const plData = await plRes.json();
          const videoIds = plData.items?.map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId);

          if (videoIds?.length) {
            const vRes = await fetch(
              `${YOUTUBE_API_BASE}/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${ytKey}`
            );
            const vData = await vRes.json();
            youtube.recentVideos = vData.items?.map((v: { snippet: { title: string; publishedAt: string }; statistics: { viewCount: string; likeCount: string } }) => ({
              title: v.snippet.title,
              views: parseInt(v.statistics.viewCount, 10),
              likes: parseInt(v.statistics.likeCount, 10),
              publishedAt: v.snippet.publishedAt,
            })) || [];
          }
        }
      }
    } catch (e) {
      console.error("[Live YouTube] Error:", e);
    }
  }

  // Fetch live Instagram data via Apify
  if (apifyToken) {
    try {
      const actorId = "apify~instagram-profile-scraper";
      const res = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: [igUsername] }),
        }
      );
      const data = await res.json();
      const profile = data?.[0];
      if (profile) {
        const followers = profile.followersCount || 0;
        const posts = profile.latestPosts || [];
        let engRate = 0;
        if (posts.length > 0 && followers > 0) {
          const totalEng = posts.slice(0, 10).reduce(
            (s: number, p: { likesCount?: number; commentsCount?: number }) =>
              s + (p.likesCount || 0) + (p.commentsCount || 0), 0
          );
          engRate = (totalEng / posts.length / followers) * 100;
        }
        instagram = { followers, engagementRate: Math.round(engRate * 100) / 100 };
      }
    } catch (e) {
      console.error("[Live Instagram] Error:", e);
    }
  }

  return NextResponse.json({ youtube, instagram });
}
