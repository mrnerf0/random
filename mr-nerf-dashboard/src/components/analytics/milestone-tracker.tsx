"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface MilestoneTrackerProps {
  current: number;
  label: string;
}

function getNextMilestone(current: number): number {
  const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  for (const m of milestones) {
    if (current < m) return m;
  }
  // Beyond 1M, next milestone is the next million
  return Math.ceil(current / 1000000) * 1000000 + 1000000;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function MilestoneTracker({ current, label }: MilestoneTrackerProps) {
  const nextMilestone = getNextMilestone(current);
  const prevMilestone = current > 1000 ? getNextMilestone(current) / 2 : 0;
  const progress = ((current - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  const remaining = nextMilestone - current;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          {label} - Next Milestone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{formatNumber(current)}</span>
          <span className="text-sm text-muted-foreground">
            {formatNumber(remaining)} to go
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="bg-primary rounded-full h-3 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          Target: {formatNumber(nextMilestone)}
        </p>
      </CardContent>
    </Card>
  );
}
