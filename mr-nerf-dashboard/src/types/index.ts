// Database types for the Mr. Nerf content dashboard

export type Platform = "youtube" | "instagram";
export type TrendSource = "reddit" | "twitter" | "news";
export type TrendCategory = "news" | "trending" | "viral";
export type ContentFormat = "review" | "news" | "commentary" | "tutorial";
export type IdeaStatus = "idea" | "approved" | "rejected";
export type KanbanColumn =
  | "ideas"
  | "scripting"
  | "filming"
  | "editing"
  | "scheduled"
  | "published";

export interface Analytics {
  id: string;
  date: string;
  platform: Platform;
  follower_count: number;
  monthly_views: number;
  engagement_rate: number;
  avg_views_last_5: number;
  created_at: string;
}

export interface ContentTrend {
  id: string;
  scraped_at: string;
  source: TrendSource;
  title: string;
  url: string;
  summary: string;
  category: TrendCategory;
  engagement_score: number;
  relevance_score: number | null;
}

export interface ContentIdea {
  id: string;
  created_at: string;
  title: string;
  format: ContentFormat;
  script_outline: string;
  source_trends: string[];
  status: IdeaStatus;
  estimated_virality: number;
}

export interface KanbanItem {
  id: string;
  title: string;
  description: string;
  column: KanbanColumn;
  assigned_to: string | null;
  due_date: string | null;
  format: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

// API response types
export interface GeneratedIdea {
  title: string;
  hook: string;
  outline: string[];
  virality_score: number;
}

export interface ScriptOutline {
  intro: string;
  sections: { title: string; talking_points: string[]; b_roll: string }[];
  outro: string;
}
