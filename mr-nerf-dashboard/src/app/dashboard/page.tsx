"use client";

import { useState } from "react";
import { Youtube, Instagram, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/analytics/stat-card";
import { MilestoneTracker } from "@/components/analytics/milestone-tracker";
import { ViewsChart } from "@/components/analytics/views-chart";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { demoYouTubeData, demoInstagramData } from "@/lib/demo-data";

export default function DashboardPage() {
  const [ytData] = useState(demoYouTubeData);
  const [igData] = useState(demoInstagramData);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" disabled>
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
    </div>
  );
}
