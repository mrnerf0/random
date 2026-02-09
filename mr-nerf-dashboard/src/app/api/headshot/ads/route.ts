import { NextResponse } from "next/server";
import { demoHeadshotAds } from "@/lib/demo-data";

export async function GET() {
  const token = process.env.FACEBOOK_AD_LIBRARY_TOKEN;

  if (token) {
    try {
      // Facebook Ad Library API - search for gaming/energy drink related ads
      const searchTerms = encodeURIComponent("headshot gaming energy");
      const url = `https://graph.facebook.com/v18.0/ads_archive?access_token=${token}&search_terms=${searchTerms}&ad_type=ALL&ad_reached_countries=US&fields=id,page_name,ad_creative_bodies,ad_delivery_start_time,impressions,publisher_platforms&limit=25`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        const ads = json.data.map((ad: {
          id: string;
          page_name?: string;
          ad_creative_bodies?: string[];
          ad_delivery_start_time?: string;
          publisher_platforms?: string[];
          impressions?: { lower_bound: string; upper_bound: string };
        }) => ({
          id: ad.id,
          page_name: ad.page_name || "Unknown",
          ad_text: ad.ad_creative_bodies?.[0] || "",
          media_url: null,
          started_running: ad.ad_delivery_start_time || "",
          platform: ad.publisher_platforms?.join(", ") || "Facebook",
          impressions_range: ad.impressions
            ? `${ad.impressions.lower_bound}-${ad.impressions.upper_bound}`
            : "N/A",
        }));
        return NextResponse.json({ data: ads });
      }
    } catch (e) {
      console.error("[Headshot Ads] Error:", e);
    }
  }

  return NextResponse.json({ data: demoHeadshotAds });
}
