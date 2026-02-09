"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, X } from "lucide-react";
import type { ScriptOutline } from "@/types";

interface ScriptViewerProps {
  script: ScriptOutline;
  title: string;
  onClose: () => void;
}

export function ScriptViewer({ script, title, onClose }: ScriptViewerProps) {
  function copyToClipboard() {
    const text = formatScript(script, title);
    navigator.clipboard.writeText(text);
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Script: {title}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Intro */}
        <div>
          <Badge className="mb-2">Intro (30 sec)</Badge>
          <p className="text-sm">{script.intro}</p>
        </div>

        {/* Main Sections */}
        {script.sections.map((section, i) => (
          <div key={i} className="border-l-2 border-primary/30 pl-4">
            <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
            <ul className="space-y-1 mb-2">
              {section.talking_points.map((point, j) => (
                <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">-</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic">
              B-Roll: {section.b_roll}
            </p>
          </div>
        ))}

        {/* Outro */}
        <div>
          <Badge variant="secondary" className="mb-2">
            Outro & CTA
          </Badge>
          <p className="text-sm">{script.outro}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatScript(script: ScriptOutline, title: string): string {
  let text = `# ${title}\n\n`;
  text += `## Intro (30 sec)\n${script.intro}\n\n`;

  script.sections.forEach((section, i) => {
    text += `## Section ${i + 1}: ${section.title}\n`;
    section.talking_points.forEach((p) => {
      text += `- ${p}\n`;
    });
    text += `\nB-Roll: ${section.b_roll}\n\n`;
  });

  text += `## Outro\n${script.outro}\n`;
  return text;
}
