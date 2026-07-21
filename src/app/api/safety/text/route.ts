import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { safetyTextSchema } from "@/lib/schemas";
import { checkTextSafety } from "@/server/safety";

export async function POST(request: Request) {
  const parsed = safetyTextSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("No text was provided.", 422);
  return NextResponse.json(await checkTextSafety(parsed.data.text));
}
