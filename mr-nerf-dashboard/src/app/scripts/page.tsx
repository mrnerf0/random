"use client";

import { useState, useEffect } from "react";
import { PenTool, Save, RefreshCw, Film, Clapperboard, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScriptViewer } from "@/components/content/script-viewer";
import type { ScriptOutline, WritingInstructions } from "@/types";
import { demoWritingInstructions } from "@/lib/demo-data";

export default function ScriptsPage() {
  const [instructions, setInstructions] = useState<WritingInstructions>(demoWritingInstructions);
  const [showSettings, setShowSettings] = useState(false);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [outline, setOutline] = useState("");
  const [format, setFormat] = useState<"short-form" | "long-form">("long-form");
  const [script, setScript] = useState<ScriptOutline | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load instructions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mr-nerf-writing-instructions");
    if (stored) {
      try {
        setInstructions(JSON.parse(stored));
      } catch {
        // Use defaults
      }
    }
  }, []);

  function saveInstructions() {
    localStorage.setItem("mr-nerf-writing-instructions", JSON.stringify(instructions));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function generateScript() {
    if (!title.trim()) return;
    setGenerating(true);
    try {
      const customInstructions = `
Tone: ${instructions.tone}
Style: ${instructions.style_notes}
Catchphrases to use naturally: ${instructions.catchphrases.join(", ")}
Intro style: ${instructions.intro_style}
Outro style: ${instructions.outro_style}
Reference: ${instructions.example_scripts}
      `.trim();

      const res = await fetch("/api/ideas/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hook,
          outline: outline.split("\n").filter(Boolean),
          format,
          customInstructions,
        }),
      });
      const json = await res.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      setScript(json.script);
    } catch (err) {
      console.error("Failed to generate script:", err);
      alert("Failed to generate script. Make sure ANTHROPIC_API_KEY is set.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Script Writer</h1>
          <Badge variant="outline" className="gap-1">
            <PenTool className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
        <Button
          variant={showSettings ? "default" : "outline"}
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Writing Style
        </Button>
      </div>

      {/* Writing Instructions Settings */}
      {showSettings && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Custom Writing Instructions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define how Mr. Nerf writes. Claude will match this voice and style exactly.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tone & Voice</label>
              <Textarea
                value={instructions.tone}
                onChange={(e) => setInstructions({ ...instructions, tone: e.target.value })}
                rows={2}
                placeholder="Describe the overall tone..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Style Notes</label>
              <Textarea
                value={instructions.style_notes}
                onChange={(e) => setInstructions({ ...instructions, style_notes: e.target.value })}
                rows={2}
                placeholder="Specific writing style details..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Catchphrases (comma-separated)</label>
              <Input
                value={instructions.catchphrases.join(", ")}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    catchphrases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Let's GO!, That's INSANE, ..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Intro Style</label>
                <Textarea
                  value={instructions.intro_style}
                  onChange={(e) => setInstructions({ ...instructions, intro_style: e.target.value })}
                  rows={3}
                  placeholder="How videos should open..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Outro Style</label>
                <Textarea
                  value={instructions.outro_style}
                  onChange={(e) => setInstructions({ ...instructions, outro_style: e.target.value })}
                  rows={3}
                  placeholder="How videos should end..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Example Scripts / Reference</label>
              <Textarea
                value={instructions.example_scripts}
                onChange={(e) => setInstructions({ ...instructions, example_scripts: e.target.value })}
                rows={4}
                placeholder="Paste example scripts or describe the writing pattern..."
              />
            </div>
            <Button onClick={saveInstructions} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Instructions"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Script Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Script</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={format === "long-form" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("long-form")}
              className="gap-1.5"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              Long-Form (8-15 min)
            </Button>
            <Button
              variant={format === "short-form" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("short-form")}
              className="gap-1.5"
            >
              <Film className="h-3.5 w-3.5" />
              Short-Form (30-60s)
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Video Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Nerf Pro 2.0 - Is It Worth The Hype?"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Hook / Angle</label>
            <Input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="e.g., First look at the most anticipated blaster of 2026"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Key Points (one per line)</label>
            <Textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              rows={4}
              placeholder={"Unboxing and first impressions\nPerformance testing (FPS, accuracy)\nComparison to competitors\nFinal verdict and rating"}
            />
          </div>
          <Button onClick={generateScript} disabled={generating || !title.trim()} className="gap-2">
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <PenTool className="h-4 w-4" />
            )}
            {generating ? "Writing Script..." : "Generate Script"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Script */}
      {script && (
        <ScriptViewer script={script} title={title} onClose={() => setScript(null)} />
      )}
    </div>
  );
}
