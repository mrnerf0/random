import { NextRequest, NextResponse } from "next/server";
import { generateScriptOutline } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, hook, outline } = body;

    if (!title || !hook || !outline) {
      return NextResponse.json(
        { error: "Missing required fields: title, hook, outline" },
        { status: 400 }
      );
    }

    const script = await generateScriptOutline(title, hook, outline);
    return NextResponse.json({ script });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
