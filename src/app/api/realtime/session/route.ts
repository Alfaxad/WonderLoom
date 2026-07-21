import { NextResponse } from "next/server";
import { apiError, messageFromError } from "@/app/api/_shared";
import { REALTIME_MODEL, REALTIME_REASONING_EFFORT, REALTIME_VOICE } from "@/lib/openai-models";
import { realtimeTokenSchema } from "@/lib/schemas";
import { CHILD_SAFETY_RULES } from "@/server/prompts";
import { getSession, prepareSession } from "@/server/session-store";

const attempts = new Map<string, number[]>();

function withinRateLimit(id: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(id) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return false;
  attempts.set(id, [...recent, now]);
  return true;
}

export async function POST(request: Request) {
  const parsed = realtimeTokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("A valid studio session is required.", 422);
  await prepareSession(parsed.data.sessionId);
  const session = getSession(parsed.data.sessionId);
  if (!session || !session.setup.adultConfirmed || !session.setup.voiceEnabled) {
    return apiError("Voice is not available for this studio session.", 403, "VOICE_NOT_ALLOWED");
  }
  if (!withinRateLimit(session.id)) return apiError("Please wait before reconnecting voice.", 429, "RATE_LIMITED");

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_KEY;
  if (!apiKey) return apiError("Voice is not configured on this server.", 503);
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": session.safetyIdentifier,
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: REALTIME_MODEL,
          instructions: CHILD_SAFETY_RULES,
          output_modalities: ["audio"],
          reasoning: { effort: REALTIME_REASONING_EFFORT },
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe" },
              noise_reduction: { type: "far_field" },
              turn_detection: {
                type: "semantic_vad",
                eagerness: "auto",
                create_response: true,
                interrupt_response: true,
              },
            },
            output: { voice: REALTIME_VOICE, speed: 1 },
          },
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) return apiError("Voice could not start right now.", response.status, "REALTIME_TOKEN_FAILED");
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "X-WonderLoom-Realtime-Model": REALTIME_MODEL,
        "X-WonderLoom-Realtime-Voice": REALTIME_VOICE,
      },
    });
  } catch (error) {
    console.error("[WonderLoom Realtime token]", messageFromError(error));
    return apiError("Voice could not start right now.", 502, "REALTIME_TOKEN_FAILED");
  }
}
