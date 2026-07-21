import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { setupSchema } from "@/lib/schemas";
import { createSession, flushSessionPersistence } from "@/server/session-store";

export async function POST(request: Request) {
  const parsed = setupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("A grown-up needs to finish the setup first.", 422, "INVALID_SETUP");
  const session = createSession(parsed.data);
  await flushSessionPersistence(session.id);
  return NextResponse.json({ session }, { status: 201 });
}
