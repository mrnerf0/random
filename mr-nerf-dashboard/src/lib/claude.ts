/**
 * Claude API integration for AI-powered content generation.
 * Generates video ideas, scripts, and UGC ad ideas.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedIdea, ScriptOutline, ContentTrend, HeadshotAd, HeadshotAdIdea } from "@/types";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable. Add it to your .env.local file.");
  }
  return new Anthropic({ apiKey });
}

/**
 * Generate video ideas based on trending topics.
 * Supports short-form (Shorts/Reels) and long-form (YouTube videos).
 */
export async function generateVideoIdeas(
  trends: ContentTrend[],
  format: "short-form" | "long-form" | "both" = "both",
  customInstructions: string = ""
): Promise<GeneratedIdea[]> {
  const client = getClient();

  const trendSummary = trends
    .slice(0, 10)
    .map((t, i) => `${i + 1}. ${t.title} (${t.source}, engagement: ${t.engagement_score})`)
    .join("\n");

  const formatInstructions = format === "both"
    ? "Generate 5 short-form ideas (YouTube Shorts/Reels, 30-60 seconds) and 5 long-form ideas (full YouTube videos, 8-15 minutes)."
    : format === "short-form"
    ? "Generate 10 short-form ideas (YouTube Shorts/Reels, 30-60 seconds each)."
    : "Generate 10 long-form ideas (full YouTube videos, 8-15 minutes each).";

  const customContext = customInstructions
    ? `\n\nIMPORTANT - Use these custom writing style instructions:\n${customInstructions}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Based on these trending gaming/nerf topics:

${trendSummary}

${formatInstructions}

The channel is "Mr. Nerf" - a Nerf blaster and foam dart content creator. The audience loves reviews, mod guides, battle footage, and gaming commentary.${customContext}

For each idea provide:
1) Catchy title
2) Hook/angle (one sentence)
3) Brief outline with 3-5 main points
4) Estimated virality score (1-10)
5) Format: "short-form" or "long-form"

Respond ONLY with valid JSON array:
[
  {
    "title": "Video Title",
    "hook": "Why viewers should watch",
    "outline": ["Point 1", "Point 2", "Point 3"],
    "virality_score": 7,
    "format": "short-form"
  }
]`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse ideas from Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate a full script for a video idea with custom writing instructions.
 */
export async function generateScript(
  title: string,
  hook: string,
  outline: string[],
  format: "short-form" | "long-form" = "long-form",
  customInstructions: string = ""
): Promise<ScriptOutline> {
  const client = getClient();

  const isShort = format === "short-form";
  const durationGuide = isShort
    ? "This is a SHORT-FORM video (30-60 seconds). Keep it extremely concise and punchy. Every second counts."
    : "This is a LONG-FORM video (8-15 minutes). Include detailed talking points, transitions, and B-roll suggestions.";

  const customContext = customInstructions
    ? `\n\nIMPORTANT WRITING STYLE INSTRUCTIONS (write EXACTLY in this voice/style):\n${customInstructions}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Create a detailed script for the Mr. Nerf channel.

Video: "${title}"
Hook: ${hook}
Key Points: ${outline.join(", ")}

${durationGuide}${customContext}

Create a script structure with:
1. Intro - attention-grabbing opener${isShort ? " (5 seconds max)" : " (30 seconds)"}
2. ${isShort ? "2-3" : "3-5"} main content sections, each with:
   - Section title
   - ${isShort ? "1-2" : "3-4"} talking points (written as actual spoken dialogue, not bullet points)
   - B-roll/footage suggestions
3. Outro with call-to-action${isShort ? " (5 seconds)" : ""}

Write the talking points as ACTUAL SCRIPT LINES that Mr. Nerf would say on camera. Make them conversational and engaging.

Respond ONLY with valid JSON:
{
  "intro": "Opening script text...",
  "sections": [
    {
      "title": "Section Title",
      "talking_points": ["Actual spoken line 1", "Actual spoken line 2"],
      "b_roll": "Suggested footage/visuals"
    }
  ],
  "outro": "Closing script and CTA...",
  "estimated_duration": "${isShort ? "45 seconds" : "10 minutes"}"
}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse script from Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate UGC ad ideas for the Headshot brand based on competitor ads.
 */
export async function generateHeadshotAdIdeas(
  competitorAds: HeadshotAd[],
  brandContext: string = ""
): Promise<HeadshotAdIdea[]> {
  const client = getClient();

  const adSummary = competitorAds.length > 0
    ? competitorAds
        .slice(0, 10)
        .map((a, i) => `${i + 1}. [${a.page_name}] "${a.ad_text}" (${a.impressions_range} impressions)`)
        .join("\n")
    : "No competitor ads available - generate ideas based on general gaming/energy drink UGC ad trends.";

  const brandInfo = brandContext || "Headshot (playheadshot.com) is a gaming-focused brand. Generate UGC ad ideas that would resonate with gamers and the gaming community.";

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are a UGC ad creative strategist. Generate 6 UGC ad ideas for the Headshot brand.

Brand context: ${brandInfo}

Competitor ads for reference:
${adSummary}

For each UGC ad idea, provide:
1) Hook (first 3 seconds - what stops the scroll)
2) Full script (30-60 second UGC style)
3) Visual direction (how it should be filmed)
4) Target audience segment
5) Call-to-action
6) Format type: "ugc-testimonial", "problem-solution", "before-after", "unboxing", or "lifestyle"

Respond ONLY with valid JSON array:
[
  {
    "hook": "Scroll-stopping opener...",
    "script": "Full 30-60 second script...",
    "visual_direction": "How to film this...",
    "target_audience": "Who this targets...",
    "cta": "Call to action...",
    "format": "ugc-testimonial"
  }
]`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse ad ideas from Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}
