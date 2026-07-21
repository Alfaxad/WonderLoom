import { NextResponse } from "next/server";
import { listSavedStoriesAsync } from "@/server/session-store";

export async function GET() {
  return NextResponse.json({ stories: await listSavedStoriesAsync() });
}
