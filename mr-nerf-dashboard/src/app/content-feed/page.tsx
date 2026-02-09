"use client";

import { useState } from "react";
import { Search, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendCard } from "@/components/content/trend-card";
import type { ContentTrend } from "@/types";
import { demoTrends } from "@/lib/demo-data";

type SourceFilter = "all" | "reddit" | "twitter" | "news";

export default function ContentFeedPage() {
  const [trends] = useState<ContentTrend[]>(demoTrends);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filteredTrends = trends.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === "all" || t.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Feed</h1>
        <div className="flex gap-2">
          <Button disabled className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "reddit", "twitter", "news"] as SourceFilter[]).map(
            (source) => (
              <Button
                key={source}
                variant={sourceFilter === source ? "default" : "outline"}
                size="sm"
                onClick={() => setSourceFilter(source)}
              >
                <Filter className="h-3 w-3 mr-1" />
                {source === "all"
                  ? "All"
                  : source.charAt(0).toUpperCase() + source.slice(1)}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Trending Content */}
      {filteredTrends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No trending content found.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
