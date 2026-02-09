"use client";

import { useEffect, useState } from "react";
import { Youtube, Instagram, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/analytics/stat-card";
import { MilestoneTracker } from "@/components/analytics/milestone-tracker";
import { ViewsChart } from "@/components/analytics/views-chart";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import type { Analytics } from "@/types";

export default function DashboardPage() {
  const [ytData, setYtData] = useState<Analytics[]>([]);
  const [igData, setIgData] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const [ytRes, igRes] = await Promise.all([
        fetch("/api/analytics?platform=youtube&days=180"),
        fetch("/api/analytics?platform=instagram&days=180"),
      ]);
      const [ytJson, igJson] = await Promise.all([ytRes.json(), igRes.json()]);
      setYtData(ytJson.data || []);
      setIgData(igJson.data || []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Get latest data points
  const latestYt = ytData[ytData.length - 1];
  const prevYt = ytData[ytData.length - 2];
  const latestIg = igData[igData.length - 1];
  const prevIg = igData[igData.length - 2];

  // Calculate growth percentages
  const ytGrowth =
    latestYt && prevYt && prevYt.follower_count > 0
      ? ((latestYt.follower_count - prevYt.follower_count) /
          prevYt.follower_count) *
        100
      : 0;

  const igGrowth =
    latestIg && prevIg && prevIg.follower_count > 0
      ? ((latestIg.follower_count - prevIg.follower_count) /
          prevIg.follower_count) *
        100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="YouTube Subscribers"
          value={latestYt?.follower_count || 0}
          change={ytGrowth}
          icon={<Youtube className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          title="Instagram Followers"
          value={latestIg?.follower_count || 0}
          change={igGrowth}
          icon={<Instagram className="h-5 w-5 text-pink-500" />}
        />
        <StatCard
          title="Avg Views (Last 5)"
          value={latestYt?.avg_views_last_5 || 0}
          subtitle="per video"
        />
        <StatCard
          title="Engagement Rate"
          value={`${latestYt?.engagement_rate || 0}%`}
          subtitle="YouTube"
        />
      </div>

      {/* Milestone Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MilestoneTracker
          current={latestYt?.follower_count || 0}
          label="YouTube Subs"
        />
        <MilestoneTracker
          current={latestIg?.follower_count || 0}
          label="Instagram Followers"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ViewsChart data={ytData} title="YouTube Views Over Time" />
        <EngagementChart data={ytData} />
      </div>

      {/* Empty state */}
      {ytData.length === 0 && igData.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No analytics data yet.</p>
          <p className="text-sm mt-2">
            Run the scrapers to start collecting data, or wait for the daily
            GitHub Action.
          </p>
        </div>
      )}
    </div>
  );
}
