"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Plus, FileText, Film, Clapperboard } from "lucide-react";
import type { GeneratedIdea } from "@/types";

interface IdeaCardProps {
  idea: GeneratedIdea;
  onSaveToKanban: (idea: GeneratedIdea) => void;
  onGenerateScript: (idea: GeneratedIdea) => void;
}

export function IdeaCard({
  idea,
  onSaveToKanban,
  onGenerateScript,
}: IdeaCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm">{idea.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500">
              {idea.virality_score}/10
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {idea.format === "short-form" ? (
              <><Clapperboard className="h-3 w-3 mr-1" /> Short-Form</>
            ) : (
              <><Film className="h-3 w-3 mr-1" /> Long-Form</>
            )}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{idea.hook}</p>

        <div className="space-y-1 mb-3">
          {idea.outline.map((point, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {i + 1}
              </Badge>
              <span>{point}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onSaveToKanban(idea)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Save to Kanban
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onGenerateScript(idea)}
          >
            <FileText className="h-3 w-3 mr-1" />
            Generate Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
