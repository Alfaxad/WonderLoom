"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OpenAIRealtimeWebRTC, RealtimeAgent, RealtimeSession, tool, type RealtimeOutputGuardrail } from "@openai/agents/realtime";
import { z } from "zod";
import { WonderApiError, wonderApi } from "@/client/api";
import { useSessionStore } from "@/client/session-store";
import { REALTIME_MODEL, REALTIME_REASONING_EFFORT, REALTIME_VOICE } from "@/lib/openai-models";
import type { StoryState, VisualIntent } from "@/lib/types";

export type VoiceStatus = "off" | "connecting" | "listening" | "thinking" | "speaking" | "muted" | "blocked";

const REALTIME_INSTRUCTIONS = `
You are WonderLoom's Creative Guide, an AI creative tool for children aged 6–10. You are not a friend, therapist, teacher, parent, or authority.
Help the child make their own three-page story. Ask exactly one brief, specific question at a time. Reflect their exact idea first. Offer no more than three optional ideas and always say they can make their own.
You must call record_child_contribution for every story idea the child says before responding. Use update_story_state only for a fact the child explicitly established. Never treat your suggestion as an accepted fact.
At semantic checkpoints use request_visual_update: reveal for the first world, transform for a direct visual change, advance for the next event. Do not call it on every turn.
Image generation can take much longer than speech or text. request_visual_update returns immediately and the canvas paints progressively. If useful, say the picture is taking shape, then continue with the next question without waiting.
When enough story facts exist, call compose_story_pages. The child may revise, reject, skip, interrupt, or undo at any time.
After the pages are composed, ask the child what their story should be called. Record their exact title with update_story_state using the title field before offering to finalize. Never invent or silently assign the final title.
Never ask for or repeat real names, school, address, location, contact details, or secrets. Never diagnose or interpret psychology. Keep fantasy age-appropriate and non-graphic. Spoken responses should be 1–3 short sentences except page narration.
`;

interface HookOptions { sessionId: string; voiceAllowed: boolean }

export function useRealtimeGuide({ sessionId, voiceAllowed }: HookOptions) {
  const sdkSession = useRef<RealtimeSession | null>(null);
  const microphoneStream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("off");
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState("Voice is off");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const setSession = useSessionStore((store) => store.setSession);
  const setError = useSessionStore((store) => store.setError);
  const setVisualPreview = useSessionStore((store) => store.setVisualPreview);

  const close = useCallback(async () => {
    sdkSession.current?.close();
    sdkSession.current = null;
    microphoneStream.current?.getTracks().forEach((track) => track.stop());
    microphoneStream.current = null;
    setMediaStream(null);
    setMuted(false);
    setStatus("off");
    setCaption("Voice is off");
  }, []);

  useEffect(() => () => {
    sdkSession.current?.close();
    microphoneStream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const connect = useCallback(async () => {
    if (!voiceAllowed || status === "connecting") return;
    if (sdkSession.current) {
      await close();
      return;
    }
    setStatus("connecting");
    setCaption("Opening the microphone…");
    try {
      const recordTool = tool({
        name: "record_child_contribution",
        description: "Record one story fact or choice the child just contributed. Call before responding to each story contribution.",
        parameters: z.object({
          text: z.string().min(1).max(800),
          kind: z.enum(["idea", "choice", "revision"]),
        }),
        execute: async ({ text, kind }) => {
          const result = await wonderApi.contribute(sessionId, text, "child", kind);
          setSession(result.session);
          return { recorded: true, revision: result.session.state.revision };
        },
      });

      const patchTool = tool({
        name: "update_story_state",
        description: "Apply one narrow canonical story fact that the child explicitly established.",
        parameters: z.object({
          field: z.enum(["title", "seed", "hero", "heroDetail", "world", "goal", "challenge", "nextBeat", "ending"]),
          value: z.string().min(1).max(1200),
        }),
        execute: async ({ field, value }) => {
          const result = await wonderApi.patch(sessionId, field, value);
          setSession(result.session);
          return { changed: field, revision: result.session.state.revision };
        },
      });

      const visualTool = tool({
        name: "request_visual_update",
        description: "Request a semantic scene reveal, direct transformation, or next-beat advance. This starts a slow background paint job with progressive previews; do not wait for it before continuing the conversation.",
        parameters: z.object({
          intent: z.enum(["reveal", "transform", "advance"]),
          prompt: z.string().min(1).max(1800),
        }),
        execute: async ({ intent, prompt }) => {
          const current = useSessionStore.getState().session;
          if (!current) return { started: false, reason: "no session" };
          const expectedRevision = current.state.revision;
          setVisualPreview({ jobRevision: current.state.visualJobRevision + 1, partialIndex: -1, imageUrl: null, stage: "warming", message: "Warming the paper" });
          void wonderApi.visual(sessionId, intent as VisualIntent, prompt, expectedRevision, (event) => {
            if (event.type === "started") {
              setSession(event.session);
              setVisualPreview({ jobRevision: event.jobRevision, partialIndex: -1, imageUrl: null, stage: "warming", message: "Warming the paper" });
            }
            if (event.type === "partial") setVisualPreview({ jobRevision: event.jobRevision, partialIndex: event.partialIndex, imageUrl: event.imageUrl, stage: event.stage, message: event.message });
            if (event.type === "complete") { setSession(event.session); setVisualPreview(null); }
            if ((event.type === "error" || event.type === "stale") && event.session) setSession(event.session);
          })
            .catch(async (error: Error) => {
              setVisualPreview(null);
              const latest = await wonderApi.getSession(sessionId).catch(() => null);
              if (latest) setSession(latest.session);
              if (!(error instanceof WonderApiError && ["STALE_REVISION", "STALE_VISUAL_JOB", "IMAGE_UNAVAILABLE"].includes(error.code ?? ""))) setError(error.message);
            });
          return { started: true, backgroundResult: true, expectedRevision };
        },
      });

      const composeTool = tool({
        name: "compose_story_pages",
        description: "Arrange established story facts into exactly three editable pages when the child is ready.",
        parameters: z.object({ ready: z.boolean() }),
        execute: async ({ ready }) => {
          if (!ready) return { composed: false };
          const result = await wonderApi.compose(sessionId);
          setSession(result.session);
          return { composed: true, pageCount: result.session.state.pages.length };
        },
      });

      const finalizeTool = tool({
        name: "finalize_story",
        description: "Finish the storybook only after the child explicitly chooses to finish.",
        parameters: z.object({ confirmedByChild: z.boolean() }),
        execute: async ({ confirmedByChild }) => {
          if (!confirmedByChild) return { finalized: false };
          const result = await wonderApi.finalize(sessionId);
          setSession(result.session);
          return { finalized: true };
        },
      });

      const undoTool = tool({
        name: "undo_last_change",
        description: "Undo the most recent reversible story change when the child asks.",
        parameters: z.object({ requested: z.boolean() }),
        execute: async ({ requested }) => {
          if (!requested) return { undone: false };
          const result = await wonderApi.undo(sessionId);
          setSession(result.session);
          return { undone: true, revision: result.session.state.revision };
        },
      });

      const outputGuardrail: RealtimeOutputGuardrail = {
        name: "WonderLoom child safety",
        execute: async ({ agentOutput }) => {
          const response = await fetch("/api/safety/text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: agentOutput || "(empty)" }),
          });
          const result = await response.json();
          return { tripwireTriggered: !result.allowed, outputInfo: result };
        },
      };

      const agent = new RealtimeAgent({
        name: "WonderLoom Creative Guide",
        instructions: REALTIME_INSTRUCTIONS,
        tools: [recordTool, patchTool, visualTool, composeTool, finalizeTool, undoTool],
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
      });
      microphoneStream.current = stream;
      setMediaStream(stream);
      const transport = new OpenAIRealtimeWebRTC({ mediaStream: stream });
      const next = new RealtimeSession(agent, {
        model: REALTIME_MODEL,
        transport,
        outputGuardrails: [outputGuardrail],
        outputGuardrailSettings: { debounceTextLength: 120 },
        config: {
          outputModalities: ["audio"],
          reasoning: { effort: REALTIME_REASONING_EFFORT },
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe" },
              noiseReduction: { type: "far_field" },
              turnDetection: {
                type: "semantic_vad",
                eagerness: "auto",
                createResponse: true,
                interruptResponse: true,
              },
            },
            output: { voice: REALTIME_VOICE, speed: 1 },
          },
        },
      });

      next.on("agent_start", () => { setStatus("thinking"); setCaption("Thinking with your idea"); });
      next.on("audio_start", () => { setStatus("speaking"); setCaption("Creative Guide is speaking"); });
      next.on("audio_stopped", () => { setStatus("listening"); setCaption("Listening for your idea"); });
      next.on("audio_interrupted", () => { setStatus("listening"); setCaption("Stopped—your turn"); });
      next.on("guardrail_tripped", () => { setStatus("blocked"); setCaption("The Guide paused an unsafe response"); });
      next.on("error", () => { setStatus("blocked"); setCaption("Voice needs a moment"); });

      const tokenResponse = await fetch("/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenData.error ?? "Voice could not start.");
      await next.connect({ apiKey: tokenData.value });
      sdkSession.current = next;
      setStatus("listening");
      setCaption("Listening for your idea");
      const current = useSessionStore.getState().session;
      next.sendMessage(`Begin this session with one short welcome and ask this question: ${current?.state.guideQuestion ?? "What tiny idea should we begin with?"}`);
    } catch (error) {
      sdkSession.current?.close();
      sdkSession.current = null;
      microphoneStream.current?.getTracks().forEach((track) => track.stop());
      microphoneStream.current = null;
      setMediaStream(null);
      const message = error instanceof Error ? error.message : "Voice could not start.";
      setStatus("blocked");
      setCaption("Voice is unavailable—typing still works");
      setError(message);
    }
  }, [close, sessionId, setError, setSession, setVisualPreview, status, voiceAllowed]);

  const toggleMute = useCallback(() => {
    if (!sdkSession.current) return;
    const nextMuted = !muted;
    sdkSession.current.mute(nextMuted);
    setMuted(nextMuted);
    setStatus(nextMuted ? "muted" : "listening");
    setCaption(nextMuted ? "Microphone paused" : "Listening for your idea");
  }, [muted]);

  const shareContext = useCallback((state: StoryState) => {
    if (!sdkSession.current) return;
    sdkSession.current.sendMessage(`Silent studio update. Canonical phase is ${state.phase}; hero: ${state.hero || "unset"}; world: ${state.world || "unset"}; next beat: ${state.nextBeat || "unset"}. Acknowledge only if the child is waiting.`);
  }, []);

  return { status, muted, caption, mediaStream, connect, close, toggleMute, shareContext };
}
