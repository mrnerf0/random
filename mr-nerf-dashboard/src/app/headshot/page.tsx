"use client";

import { useEffect, useState } from "react";
import {
  Crosshair,
  RefreshCw,
  Sparkles,
  Eye,
  Calendar,
  Megaphone,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HeadshotAd, HeadshotAdIdea } from "@/types";
import { demoHeadshotAds } from "@/lib/demo-data";

const FORMAT_LABELS: Record<string, string> = {
  "ugc-testimonial": "UGC Testimonial",
  "problem-solution": "Problem-Solution",
  "before-after": "Before/After",
  unboxing: "Unboxing",
  lifestyle: "Lifestyle",
};

const FORMAT_COLORS: Record<string, string> = {
  "ugc-testimonial": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "problem-solution": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "before-after": "bg-green-500/10 text-green-400 border-green-500/20",
  unboxing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  lifestyle: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function HeadshotPage() {
  const [ads, setAds] = useState<HeadshotAd[]>(demoHeadshotAds);
  const [ideas, setIdeas] = useState<HeadshotAdIdea[]>([]);
  const [brandContext, setBrandContext] = useState(
    "Headshot (playheadshot.com) is a gaming-focused brand. We create products for the gaming community."
  );
  const [loadingAds, setLoadingAds] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoadingAds(true);
    try {
      const res = await fetch("/api/headshot/ads");
      const json = await res.json();
      if (json.data?.length) setAds(json.data);
    } catch (err) {
      console.error("Failed to fetch ads:", err);
    } finally {
      setLoadingAds(false);
    }
  }

  async function generateIdeas() {
    setGenerating(true);
    try {
      const res = await fetch("/api/headshot/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorAds: ads, brandContext }),
      });
      const json = await res.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      setIdeas(json.ideas || []);
    } catch (err) {
      console.error("Failed to generate ideas:", err);
      alert("Failed to generate ideas. Make sure ANTHROPIC_API_KEY is set.");
    } finally {
      setGenerating(false);
    }
  }

  function copyScript(idea: HeadshotAdIdea) {
    const text = `HOOK: ${idea.hook}\n\nSCRIPT:\n${idea.script}\n\nVISUAL DIRECTION:\n${idea.visual_direction}\n\nTARGET: ${idea.target_audience}\nCTA: ${idea.cta}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Headshot</h1>
          <Badge variant="outline" className="gap-1">
            <Crosshair className="h-3 w-3" />
            UGC Ads
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAds} disabled={loadingAds}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingAds ? "animate-spin" : ""}`} />
            Refresh Ads
          </Button>
          <Button onClick={generateIdeas} disabled={generating} className="gap-2">
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : "Generate UGC Ideas"}
          </Button>
        </div>
      </div>

      {/* Brand Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Brand Context</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={brandContext}
            onChange={(e) => setBrandContext(e.target.value)}
            rows={2}
            placeholder="Describe the Headshot brand, products, and target audience..."
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Generated UGC Ad Ideas */}
      {ideas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generated UGC Ad Ideas
            <Badge variant="secondary">{ideas.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ideas.map((idea, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className={FORMAT_COLORS[idea.format] || ""}
                    >
                      {FORMAT_LABELS[idea.format] || idea.format}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => copyScript(idea)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">HOOK (first 3 sec)</p>
                      <p className="text-sm font-semibold">{idea.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">SCRIPT</p>
                      <p className="text-sm whitespace-pre-line">{idea.script}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">VISUAL DIRECTION</p>
                      <p className="text-xs text-muted-foreground">{idea.visual_direction}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Target: {idea.target_audience}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        CTA: {idea.cta}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Ads */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Competitor Ads
          <Badge variant="secondary">{ads.length}</Badge>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{ad.page_name}</span>
                  <Badge variant="outline" className="text-xs">{ad.platform}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {ad.ad_text}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ad.started_running).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {ad.impressions_range}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
