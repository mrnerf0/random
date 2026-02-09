/**
 * Claude API integration for AI-powered content generation.
 * Generates video ideas and script outlines based on trending topics.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedIdea, ScriptOutline, ContentTrend } from "@/types";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }
  return new Anthropic({ apiKey });
}

/**
 * Generate video ideas based on trending gaming topics.
 * Sends the top trends to Claude and gets back structured ideas.
 */
export async function generateVideoIdeas(
  trends: ContentTrend[]
): Promise<GeneratedIdea[]> {
  const client = getClient();

  const trendSummary = trends
    .slice(0, 10)
    .map((t, i) => `${i + 1}. ${t.title} (${t.source}, engagement: ${t.engagement_score})`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Based on these trending gaming topics:

${trendSummary}

Generate 10 YouTube video ideas for a gaming news/commentary channel called "Mr. Nerf". For each idea provide:
1) Catchy title
2) Hook/angle (one sentence)
3) Brief outline with 3-5 main points
4) Estimated virality score (1-10)

Respond ONLY with valid JSON in this exact format:
[
  {
    "title": "Video Title",
    "hook": "Why viewers should watch",
    "outline": ["Point 1", "Point 2", "Point 3"],
    "virality_score": 7
  }
]`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse ideas from Claude response");
  }

  const ideas: GeneratedIdea[] = JSON.parse(jsonMatch[0]);
  return ideas;
}

/**
 * Generate a full script outline for a content idea.
 */
export async function generateScriptOutline(
  title: string,
  hook: string,
  outline: string[]
): Promise<ScriptOutline> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Create a detailed YouTube script outline for the Mr. Nerf gaming channel.

Video: "${title}"
Hook: ${hook}
Key Points: ${outline.join(", ")}

Create a script structure with:
1. Intro (30 seconds) - attention-grabbing opener
2. 3-5 main content sections, each with:
   - Section title
   - 3-4 talking points
   - B-roll/footage suggestions
3. Outro with call-to-action

Respond ONLY with valid JSON in this exact format:
{
  "intro": "Opening script text...",
  "sections": [
    {
      "title": "Section Title",
      "talking_points": ["Point 1", "Point 2", "Point 3"],
      "b_roll": "Suggested footage/visuals"
    }
  ],
  "outro": "Closing script and CTA..."
}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse script outline from Claude response");
  }

  const script: ScriptOutline = JSON.parse(jsonMatch[0]);
  return script;
}
