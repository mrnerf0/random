import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, hook, outline, format, customInstructions } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const script = await generateScript(title, hook || "", outline || [], format || "long-form", customInstructions || "");
    return NextResponse.json({ script });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
