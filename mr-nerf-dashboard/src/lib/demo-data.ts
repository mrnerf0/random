import type { Analytics, ContentTrend, KanbanItem, TeamMember, LiveStats, HeadshotAd, WritingInstructions } from "@/types";

// Generate date strings for the last N days
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// Simulate subscriber growth from ~42K to ~48.5K over 180 days
function generateYouTubeAnalytics(): Analytics[] {
  const data: Analytics[] = [];
  for (let i = 180; i >= 0; i -= 3) {
    const progress = (180 - i) / 180;
    const base = 42000 + Math.floor(progress * 6500);
    const noise = Math.floor(Math.random() * 200 - 100);
    const views = 850000 + Math.floor(progress * 400000) + Math.floor(Math.random() * 50000);
    const avgViews = 45000 + Math.floor(progress * 25000) + Math.floor(Math.random() * 5000);
    const engagement = 4.2 + progress * 1.8 + Math.random() * 0.5;
    data.push({
      id: `yt-${i}`,
      date: daysAgo(i),
      platform: "youtube",
      follower_count: base + noise,
      monthly_views: views,
      engagement_rate: parseFloat(engagement.toFixed(1)),
      avg_views_last_5: avgViews,
      created_at: daysAgo(i),
    });
  }
  return data;
}

function generateInstagramAnalytics(): Analytics[] {
  const data: Analytics[] = [];
  for (let i = 180; i >= 0; i -= 3) {
    const progress = (180 - i) / 180;
    const base = 12000 + Math.floor(progress * 5200);
    const noise = Math.floor(Math.random() * 100 - 50);
    data.push({
      id: `ig-${i}`,
      date: daysAgo(i),
      platform: "instagram",
      follower_count: base + noise,
      monthly_views: 120000 + Math.floor(progress * 80000),
      engagement_rate: parseFloat((3.5 + progress * 1.2 + Math.random() * 0.3).toFixed(1)),
      avg_views_last_5: 8000 + Math.floor(progress * 6000),
      created_at: daysAgo(i),
    });
  }
  return data;
}

export const demoYouTubeData: Analytics[] = generateYouTubeAnalytics();
export const demoInstagramData: Analytics[] = generateInstagramAnalytics();

export const demoTrends: ContentTrend[] = [
  {
    id: "t1",
    scraped_at: new Date().toISOString(),
    source: "reddit",
    title: "Nerf Rival Knockout just dropped to $8 at Target - insane deal",
    url: "https://reddit.com",
    summary: "Multiple users confirming Target clearance pricing on the Rival Knockout. Some stores also have the Takedown for $12.",
    category: "trending",
    engagement_score: 2847,
    relevance_score: 92,
  },
  {
    id: "t2",
    scraped_at: new Date().toISOString(),
    source: "twitter",
    title: "Hasbro announces new Nerf Pro 2.0 line for competitive play",
    url: "https://twitter.com",
    summary: "Official Hasbro account teasing a new pro-grade line with higher FPS and modular rail systems. Community is hyped.",
    category: "news",
    engagement_score: 5420,
    relevance_score: 98,
  },
  {
    id: "t3",
    scraped_at: new Date().toISOString(),
    source: "news",
    title: "World Nerf Championship 2026 location revealed: Austin, TX",
    url: "https://example.com",
    summary: "The annual competitive Nerf tournament will be held in Austin Convention Center this summer with $50K in prizes.",
    category: "news",
    engagement_score: 1893,
    relevance_score: 85,
  },
  {
    id: "t4",
    scraped_at: new Date().toISOString(),
    source: "reddit",
    title: "3D printed flywheel cage mod gets 200+ FPS - full guide inside",
    url: "https://reddit.com",
    summary: "Detailed build guide for a custom flywheel cage that achieves 200+ FPS consistently. Includes STL files and parts list.",
    category: "viral",
    engagement_score: 4231,
    relevance_score: 88,
  },
  {
    id: "t5",
    scraped_at: new Date().toISOString(),
    source: "twitter",
    title: "Dart Zone just teased something BIG on their Instagram story",
    url: "https://twitter.com",
    summary: "Silhouette of what appears to be a full-auto blaster with integrated magazine. Expected reveal next week.",
    category: "trending",
    engagement_score: 3102,
    relevance_score: 90,
  },
  {
    id: "t6",
    scraped_at: new Date().toISOString(),
    source: "news",
    title: "Study: Foam blaster hobby grew 340% since 2020",
    url: "https://example.com",
    summary: "Market research report shows the Nerf and foam blaster community has seen explosive growth driven by YouTube content creators.",
    category: "news",
    engagement_score: 987,
    relevance_score: 75,
  },
  {
    id: "t7",
    scraped_at: new Date().toISOString(),
    source: "reddit",
    title: "My 500-blaster collection room tour - 5 years in the making",
    url: "https://reddit.com",
    summary: "Incredible collection showcase with custom wall mounts, LED lighting, and organized by era. The community is asking for a video tour.",
    category: "viral",
    engagement_score: 6120,
    relevance_score: 82,
  },
  {
    id: "t8",
    scraped_at: new Date().toISOString(),
    source: "twitter",
    title: "New Nerf x Fortnite collab blaster spotted at Walmart",
    url: "https://twitter.com",
    summary: "Unreleased Fortnite-branded blaster found on Walmart shelves early. Looks like a reskin of the Stryfe platform.",
    category: "trending",
    engagement_score: 4580,
    relevance_score: 93,
  },
  {
    id: "t9",
    scraped_at: new Date().toISOString(),
    source: "news",
    title: "Top 10 budget blasters for beginners in 2026",
    url: "https://example.com",
    summary: "Comprehensive roundup of the best entry-level foam blasters under $25, featuring options from Nerf, Dart Zone, and X-Shot.",
    category: "trending",
    engagement_score: 1543,
    relevance_score: 70,
  },
];

export const demoTeamMembers: TeamMember[] = [
  { id: "tm1", name: "Mr. Nerf", email: "mrnerf@example.com", role: "creator", avatar_url: null },
  { id: "tm2", name: "Alex Chen", email: "alex@example.com", role: "editor", avatar_url: null },
  { id: "tm3", name: "Sam Rivera", email: "sam@example.com", role: "manager", avatar_url: null },
];

export const demoKanbanItems: KanbanItem[] = [
  {
    id: "k1",
    title: "Nerf Pro 2.0 First Look",
    description: "Unboxing and first impressions of the new Nerf Pro 2.0 lineup",
    column: "ideas",
    assigned_to: "tm1",
    due_date: null,
    format: "review",
    notes: "Wait for official release date confirmation",
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
  {
    id: "k2",
    title: "Budget Blaster Battle Royale",
    description: "Testing 10 blasters under $20 to find the best value",
    column: "scripting",
    assigned_to: "tm1",
    due_date: daysAgo(-7),
    format: "review",
    notes: "Script outline: intro, unboxing, tests (accuracy, range, ROF), ranking, conclusion",
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
  },
  {
    id: "k3",
    title: "200 FPS Flywheel Mod Guide",
    description: "Step-by-step tutorial for the viral 3D printed flywheel cage",
    column: "filming",
    assigned_to: "tm1",
    due_date: daysAgo(-3),
    format: "tutorial",
    notes: "Need to print backup parts. Film in workshop.",
    created_at: daysAgo(14),
    updated_at: daysAgo(1),
  },
  {
    id: "k4",
    title: "Nerf World Championship Preview",
    description: "Everything we know about the 2026 tournament in Austin",
    column: "editing",
    assigned_to: "tm2",
    due_date: daysAgo(-1),
    format: "news",
    notes: "Add map graphics and prize pool breakdown",
    created_at: daysAgo(8),
    updated_at: daysAgo(0),
  },
  {
    id: "k5",
    title: "Dart Zone vs Nerf: Ultimate Comparison",
    description: "Head-to-head comparison of top blasters from both brands",
    column: "scheduled",
    assigned_to: "tm1",
    due_date: daysAgo(-14),
    format: "commentary",
    notes: "Scheduled for Saturday 10 AM release",
    created_at: daysAgo(21),
    updated_at: daysAgo(3),
  },
  {
    id: "k6",
    title: "My Top 10 Blasters of All Time",
    description: "Personal ranking with reasoning and demonstrations",
    column: "published",
    assigned_to: "tm1",
    due_date: null,
    format: "commentary",
    notes: "Published! 85K views in first 48 hours",
    created_at: daysAgo(30),
    updated_at: daysAgo(14),
  },
  {
    id: "k7",
    title: "Fortnite x Nerf Collab Review",
    description: "Is the new Fortnite blaster worth it? Honest review.",
    column: "ideas",
    assigned_to: null,
    due_date: null,
    format: "review",
    notes: "Spotted at Walmart, need to grab one",
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "k8",
    title: "500 Blaster Collection Tour",
    description: "Full walkthrough of the Mr. Nerf collection room",
    column: "scripting",
    assigned_to: "tm1",
    due_date: daysAgo(-10),
    format: "commentary",
    notes: "Inspired by viral Reddit post. Need to clean and organize room first.",
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
  {
    id: "k9",
    title: "Beginner's Guide to Nerf Wars",
    description: "Complete starter guide covering loadout, strategy, and etiquette",
    column: "published",
    assigned_to: "tm1",
    due_date: null,
    format: "tutorial",
    notes: "Evergreen content performing well. 120K views.",
    created_at: daysAgo(45),
    updated_at: daysAgo(30),
  },
];

export const demoLiveStats: LiveStats = {
  youtube: {
    subscribers: 48500,
    totalViews: 12500000,
    videoCount: 342,
    recentVideos: [
      { title: "NERF Pro 2.0 - Is It Worth The Hype?", views: 89000, likes: 4200, publishedAt: daysAgo(2) },
      { title: "I Tested Every $10 Blaster So You Don't Have To", views: 156000, likes: 8900, publishedAt: daysAgo(5) },
      { title: "This 3D Printed Mod Changes EVERYTHING", views: 234000, likes: 12000, publishedAt: daysAgo(9) },
      { title: "Nerf War: 50 vs 50 Battle Royale", views: 567000, likes: 28000, publishedAt: daysAgo(14) },
      { title: "Unboxing $500 of Mystery Nerf Blasters", views: 412000, likes: 19500, publishedAt: daysAgo(19) },
    ],
  },
  instagram: {
    followers: 17200,
    engagementRate: 4.8,
  },
};

export const demoHeadshotAds: HeadshotAd[] = [
  {
    id: "ha1",
    page_name: "Headshot",
    ad_text: "Level up your game with Headshot. The gaming energy drink that keeps you focused for hours. No crash, no jitters.",
    media_url: null,
    started_running: daysAgo(15),
    platform: "Facebook",
    impressions_range: "50K-100K",
  },
  {
    id: "ha2",
    page_name: "Headshot Gaming",
    ad_text: "Pro gamers trust Headshot for tournament day. Clean energy, zero sugar, maximum focus.",
    media_url: null,
    started_running: daysAgo(7),
    platform: "Instagram",
    impressions_range: "100K-200K",
  },
  {
    id: "ha3",
    page_name: "Headshot",
    ad_text: "Stop losing to brain fog. Headshot gives you the edge with nootropics + natural caffeine.",
    media_url: null,
    started_running: daysAgo(3),
    platform: "Facebook",
    impressions_range: "25K-50K",
  },
];

export const demoWritingInstructions: WritingInstructions = {
  tone: "Energetic, enthusiastic, knowledgeable but approachable. Like talking to your best friend who happens to be a Nerf expert.",
  style_notes: "Use short punchy sentences. Address the viewer directly. Include moments of genuine excitement. Don't be afraid to be goofy or use sound effects.",
  catchphrases: ["Let's GO!", "That's INSANE", "No way...", "This changes everything", "You guys are NOT ready for this"],
  intro_style: "Always start with a bold statement or question that hooks the viewer in the first 3 seconds. Example: 'This blaster just DESTROYED every other Nerf gun I own.'",
  outro_style: "End with a genuine call to action and a tease for the next video. Example: 'Smash that subscribe button because next week... I'm modding this thing to shoot 300 FPS.'",
  example_scripts: "Hook: 'Hasbro just released their most INSANE blaster ever... and I got my hands on it early.'\nThen show the unboxing with genuine reactions. Test it with measurable results (chronograph readings, accuracy tests). Compare to popular alternatives. Give honest verdict.",
};
