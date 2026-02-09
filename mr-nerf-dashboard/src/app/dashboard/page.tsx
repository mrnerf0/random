"use client";

import { useEffect, useState, useCallback } from "react";
import { Youtube, Instagram, RefreshCw, Eye, Video, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/analytics/stat-card";
import { MilestoneTracker } from "@/components/analytics/milestone-tracker";
import { ViewsChart } from "@/components/analytics/views-chart";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import type { Analytics, LiveStats } from "@/types";
import { demoYouTubeData, demoInstagramData, demoLiveStats } from "@/lib/demo-data";

export default function DashboardPage() {
  const [liveStats, setLiveStats] = useState<LiveStats>(demoLiveStats);
  const [ytData, setYtData] = useState<Analytics[]>(demoYouTubeData);
  const [igData, setIgData] = useState<Analytics[]>(demoInstagramData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLiveStats = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/live");
      const json = await res.json();
      setLiveStats({ youtube: json.youtube, instagram: json.instagram });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch live stats:", err);
    }
  }, []);

  const fetchHistorical = useCallback(async () => {
    try {
      const [ytRes, igRes] = await Promise.all([
        fetch("/api/analytics?platform=youtube&days=180"),
        fetch("/api/analytics?platform=instagram&days=180"),
      ]);
      const [ytJson, igJson] = await Promise.all([ytRes.json(), igRes.json()]);
      if (ytJson.data?.length) setYtData(ytJson.data);
      if (igJson.data?.length) setIgData(igJson.data);
    } catch (err) {
      console.error("Failed to fetch historical analytics:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLiveStats(), fetchHistorical()]);
    setLoading(false);
  }, [fetchLiveStats, fetchHistorical]);

  useEffect(() => {
    refreshAll();
    // Auto-refresh live stats every 60 seconds
    const interval = setInterval(fetchLiveStats, 60000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchLiveStats]);

  // Historical chart data
  const latestYt = ytData[ytData.length - 1];
  const prevYt = ytData[ytData.length - 2];
  const latestIg = igData[igData.length - 1];
  const prevIg = igData[igData.length - 2];

  const ytGrowth =
    latestYt && prevYt && prevYt.follower_count > 0
      ? ((latestYt.follower_count - prevYt.follower_count) / prevYt.follower_count) * 100
      : 0;

  const igGrowth =
    latestIg && prevIg && prevIg.follower_count > 0
      ? ((latestIg.follower_count - prevIg.follower_count) / prevIg.follower_count) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Badge variant="outline" className="gap-1.5 text-green-500 border-green-500/30">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="YouTube Subscribers"
          value={liveStats.youtube.subscribers}
          change={ytGrowth}
          icon={<Youtube className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          title="Instagram Followers"
          value={liveStats.instagram.followers}
          change={igGrowth}
          icon={<Instagram className="h-5 w-5 text-pink-500" />}
        />
        <StatCard
          title="Total YT Views"
          value={liveStats.youtube.totalViews}
          icon={<Eye className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Engagement Rate"
          value={`${liveStats.instagram.engagementRate}%`}
          subtitle="Instagram"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
      </div>

      {/* Milestone Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MilestoneTracker current={liveStats.youtube.subscribers} label="YouTube Subs" />
        <MilestoneTracker current={liveStats.instagram.followers} label="Instagram Followers" />
      </div>

      {/* Recent Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recent Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveStats.youtube.recentVideos.map((video, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(video.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium">{video.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{video.likes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">likes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ViewsChart data={ytData} title="YouTube Views Over Time" />
        <EngagementChart data={ytData} />
      </div>
    </div>
  );
}
