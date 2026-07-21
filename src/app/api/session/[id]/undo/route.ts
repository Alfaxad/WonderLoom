import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { flushSessionPersistence, getSession, prepareSession, undoSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  if (current.history.length === 0) return apiError("There is nothing to undo yet.", 409, "NOTHING_TO_UNDO");
  const session = undoSession(id);
  await flushSessionPersistence(id);
  return NextResponse.json({ session });
}
