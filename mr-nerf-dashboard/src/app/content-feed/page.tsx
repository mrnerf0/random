"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, RefreshCw, Filter, Film, Clapperboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendCard } from "@/components/content/trend-card";
import { IdeaCard } from "@/components/content/idea-card";
import { ScriptViewer } from "@/components/content/script-viewer";
import type { ContentTrend, GeneratedIdea, ScriptOutline, WritingInstructions } from "@/types";
import { demoTrends } from "@/lib/demo-data";

type SourceFilter = "all" | "reddit" | "twitter" | "news";
type FormatFilter = "all" | "short-form" | "long-form";

export default function ContentFeedPage() {
  const [trends, setTrends] = useState<ContentTrend[]>(demoTrends);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [script, setScript] = useState<{ outline: ScriptOutline; title: string } | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTrends(); }, [sourceFilter]);

  async function fetchTrends() {
    try {
      const params = sourceFilter !== "all" ? `?source=${sourceFilter}` : "";
      const res = await fetch(`/api/trends${params}`);
      const json = await res.json();
      if (json.data?.length) setTrends(json.data);
    } catch (err) {
      console.error("Failed to fetch trends:", err);
    }
  }

  async function handleScrapeNow() {
    setScraping(true);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const json = await res.json();
      if (json.trends?.length) {
        setTrends(json.trends);
      } else {
        // Refetch from trends API after scrape
        await fetchTrends();
      }
    } catch (err) {
      console.error("Scrape failed:", err);
    } finally {
      setScraping(false);
    }
  }

  function getCustomInstructions(): string {
    try {
      const stored = localStorage.getItem("mr-nerf-writing-instructions");
      if (stored) {
        const instructions: WritingInstructions = JSON.parse(stored);
        return `
Tone: ${instructions.tone}
Style: ${instructions.style_notes}
Catchphrases to use naturally: ${instructions.catchphrases.join(", ")}
Intro style: ${instructions.intro_style}
Outro style: ${instructions.outro_style}
Reference: ${instructions.example_scripts}
        `.trim();
      }
    } catch {}
    return "";
  }

  async function generateIdeas() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: formatFilter === "all" ? "both" : formatFilter,
          customInstructions: getCustomInstructions(),
        }),
      });
      const json = await res.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      setIdeas(json.ideas || []);
    } catch (err) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateScript(idea: GeneratedIdea) {
    setGeneratingScript(true);
    try {
      const res = await fetch("/api/ideas/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          hook: idea.hook,
          outline: idea.outline,
          format: idea.format || "long-form",
          customInstructions: getCustomInstructions(),
        }),
      });
      const json = await res.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      setScript({ outline: json.script, title: idea.title });
    } catch (err) {
      console.error("Failed to generate script:", err);
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleSaveToKanban(idea: GeneratedIdea) {
    try {
      const res = await fetch("/api/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.hook,
          column: "ideas",
          format: idea.format === "short-form" ? "short-form" : "commentary",
          notes: idea.outline.join("\n"),
        }),
      });
      if (res.ok) alert("Saved to Kanban board!");
    } catch (err) {
      console.error("Failed to save to kanban:", err);
    }
  }

  const filteredTrends = trends.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIdeas = ideas.filter(
    (idea) => formatFilter === "all" || idea.format === formatFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Feed</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleScrapeNow} disabled={scraping} className="gap-2">
            {scraping ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {scraping ? "Scraping..." : "Scrape Now"}
          </Button>
          <Button onClick={generateIdeas} disabled={generating} className="gap-2">
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : "Generate Ideas"}
          </Button>
        </div>
      </div>

      {/* Format Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "short-form", "long-form"] as FormatFilter[]).map((fmt) => (
          <Button
            key={fmt}
            variant={formatFilter === fmt ? "default" : "outline"}
            size="sm"
            onClick={() => setFormatFilter(fmt)}
            className="gap-1.5"
          >
            {fmt === "short-form" && <Film className="h-3.5 w-3.5" />}
            {fmt === "long-form" && <Clapperboard className="h-3.5 w-3.5" />}
            {fmt === "all" ? "All Formats" : fmt === "short-form" ? "Short-Form" : "Long-Form"}
          </Button>
        ))}
      </div>

      {/* Script Viewer */}
      {script && (
        <ScriptViewer script={script.outline} title={script.title} onClose={() => setScript(null)} />
      )}

      {generatingScript && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Generating script outline...
        </div>
      )}

      {/* AI Generated Ideas */}
      {filteredIdeas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Ideas
            <Badge variant="secondary" className="text-xs">{filteredIdeas.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredIdeas.map((idea, i) => (
              <IdeaCard
                key={i}
                idea={idea}
                onSaveToKanban={handleSaveToKanban}
                onGenerateScript={handleGenerateScript}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search & Source Filters */}
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
          {(["all", "reddit", "twitter", "news"] as SourceFilter[]).map((source) => (
            <Button
              key={source}
              variant={sourceFilter === source ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter(source)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {source === "all" ? "All" : source.charAt(0).toUpperCase() + source.slice(1)}
            </Button>
          ))}
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
