import { NextRequest, NextResponse } from "next/server";
import { getTrends } from "@/lib/get-trends";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || undefined;

  const data = await getTrends(source);
  return NextResponse.json({ data });
}
