-- Mr. Nerf Dashboard - Initial Database Schema
-- Run this in your Supabase SQL editor to create all tables

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  avatar_url TEXT
);

-- Analytics table (YouTube & Instagram metrics)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram')),
  follower_count INTEGER NOT NULL DEFAULT 0,
  monthly_views INTEGER NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_views_last_5 INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, platform)
);

-- Content Trends table (scraped from Reddit, Twitter, News)
CREATE TABLE IF NOT EXISTS content_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('reddit', 'twitter', 'news')),
  title TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  category TEXT NOT NULL CHECK (category IN ('news', 'trending', 'viral')),
  engagement_score INTEGER NOT NULL DEFAULT 0,
  relevance_score DECIMAL(3, 1)
);

-- Content Ideas table (AI-generated ideas)
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('review', 'news', 'commentary', 'tutorial')),
  script_outline TEXT,
  source_trends JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'approved', 'rejected')),
  estimated_virality INTEGER CHECK (estimated_virality BETWEEN 1 AND 10)
);

-- Kanban Items table (production workflow)
CREATE TABLE IF NOT EXISTS kanban_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  "column" TEXT NOT NULL DEFAULT 'ideas' CHECK ("column" IN ('ideas', 'scripting', 'filming', 'editing', 'scheduled', 'published')),
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  due_date DATE,
  format TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_analytics_date ON analytics(date DESC);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_content_trends_scraped_at ON content_trends(scraped_at DESC);
CREATE INDEX idx_content_trends_source ON content_trends(source);
CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_kanban_items_column ON kanban_items("column");
CREATE INDEX idx_kanban_items_assigned ON kanban_items(assigned_to);

-- Auto-update updated_at on kanban_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kanban_items_updated_at
  BEFORE UPDATE ON kanban_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed team members
INSERT INTO team_members (name, email, role) VALUES
  ('Mr. Nerf', 'mrnerf@example.com', 'Creator'),
  ('Editor', 'editor@example.com', 'Editor'),
  ('Manager', 'manager@example.com', 'Manager')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (optional, for Supabase Auth)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_items ENABLE ROW LEVEL SECURITY;

-- Policies: allow all authenticated users full access (internal team tool)
CREATE POLICY "Allow authenticated access" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON analytics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON content_trends FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON content_ideas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON kanban_items FOR ALL USING (auth.role() = 'authenticated');
