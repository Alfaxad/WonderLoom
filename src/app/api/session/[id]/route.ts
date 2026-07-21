import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { deleteSession, flushSessionPersistence, getSession, prepareSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const session = getSession(id);
  if (!session) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  return NextResponse.json({ session });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  deleteSession(id);
  await flushSessionPersistence(id);
  return new NextResponse(null, { status: 204 });
}
