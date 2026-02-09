"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { ContentTrend } from "@/types";

interface TrendCardProps {
  trend: ContentTrend;
}

const sourceColors: Record<string, string> = {
  reddit: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  twitter: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  news: "bg-green-500/10 text-green-500 border-green-500/20",
};

const categoryColors: Record<string, string> = {
  viral: "bg-red-500/10 text-red-400 border-red-500/20",
  trending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  news: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function TrendCard({ trend }: TrendCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={sourceColors[trend.source] || ""} variant="outline">
                {trend.source}
              </Badge>
              <Badge
                className={categoryColors[trend.category] || ""}
                variant="outline"
              >
                {trend.category}
              </Badge>
              {trend.engagement_score > 0 && (
                <span className="text-xs text-muted-foreground">
                  Score: {trend.engagement_score.toLocaleString()}
                </span>
              )}
            </div>
            <h3 className="font-medium text-sm leading-tight">{trend.title}</h3>
            {trend.summary && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {trend.summary}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(trend.scraped_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {trend.url && (
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
