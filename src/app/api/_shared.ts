import { NextResponse } from "next/server";
import type { ApiErrorShape } from "@/lib/types";

export function apiError(error: string, status = 400, code?: string): NextResponse<ApiErrorShape> {
  return NextResponse.json({ error, ...(code ? { code } : {}) }, { status });
}

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
