"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Redo2, Send, Sparkles, Undo2, X } from "lucide-react";
import { WonderApiError, wonderApi } from "@/client/api";
import { useRealtimeGuide } from "@/client/use-realtime-guide";
import { useSessionStore } from "@/client/session-store";
import { IdeaShelf } from "@/components/idea-shelf";
import { LivingCanvas } from "@/components/living-canvas";
import { Logo } from "@/components/logo";
import { PaperButton } from "@/components/paper-button";
import { StoryThread } from "@/components/story-thread";
import { VoiceDock } from "@/components/voice-dock";
import { progressForPhase } from "@/lib/story-state";
import type { VisualIntent } from "@/lib/types";

export function Studio({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { session, busy, error, visualPreview, setSession, setBusy, setError, clearError, setVisualPreview } = useSessionStore();
  const [text, setText] = useState("");
  const [adultAssist, setAdultAssist] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"ideas" | "thread" | null>(null);
  const voice = useRealtimeGuide({ sessionId, voiceAllowed: session?.setup.voiceEnabled ?? false });

  useEffect(() => {
    let live = true;
    setVisualPreview(null);
    setBusy("Opening your studio");
    wonderApi.getSession(sessionId).then(({ session: loaded }) => { if (live) { setSession(loaded); setBusy(null); } }).catch((caught: Error) => { if (live) setError(caught.message); });
    return () => { live = false; };
  }, [sessionId, setBusy, setError, setSession, setVisualPreview]);

  const state = session?.state;
  const progress = state ? progressForPhase(state.phase) : 0;
  const childCount = useMemo(() => state?.contributions.filter((item) => item.author === "child").length ?? 0, [state]);

  async function paint(intent: VisualIntent, prompt: string, expectedRevision: number) {
    const current = useSessionStore.getState().session;
    if (!current) return;
    setVisualPreview({ jobRevision: current.state.visualJobRevision + 1, partialIndex: -1, imageUrl: null, stage: "warming", message: "Warming the paper" });
    try {
      await wonderApi.visual(sessionId, intent, prompt, expectedRevision, (event) => {
        if (event.type === "started") {
          setSession(event.session);
          setVisualPreview({ jobRevision: event.jobRevision, partialIndex: -1, imageUrl: null, stage: "warming", message: "Warming the paper" });
        }
        if (event.type === "partial") {
          setVisualPreview({ jobRevision: event.jobRevision, partialIndex: event.partialIndex, imageUrl: event.imageUrl, stage: event.stage, message: event.message });
        }
        if (event.type === "complete") {
          setSession(event.session);
          setVisualPreview(null);
        }
        if ((event.type === "error" || event.type === "stale") && event.session) setSession(event.session);
      });
    } catch (caught) {
      setVisualPreview(null);
      const latest = await wonderApi.getSession(sessionId).catch(() => null);
      if (latest) {
        setSession(latest.session);
      } else {
        const fallback = useSessionStore.getState().session;
        if (fallback) setSession({ ...fallback, state: { ...fallback.state, visualStatus: "blocked", visualError: "The image connection was interrupted." } });
      }
      if (!(caught instanceof WonderApiError && ["STALE_REVISION", "STALE_VISUAL_JOB", "IMAGE_UNAVAILABLE"].includes(caught.code ?? ""))) {
        setError(caught instanceof Error ? caught.message : "The scene could not be painted.");
      }
    }
  }

  async function submitIdea(value = text) {
    const idea = value.trim();
    if (!idea || !session || busy) return;
    setText(""); setBusy("The Guide is thinking"); clearError();
    try {
      const result = await wonderApi.turn(sessionId, idea, adultAssist ? "adult" : "child");
      setSession(result.session); setBusy(null);
      if (result.visual?.prompt) void paint(result.visual.intent, result.visual.prompt, result.session.state.revision);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The Guide could not answer."); }
  }

  async function editVisual(prompt: string) {
    if (!session || busy) return;
    setBusy("Saving your visual change"); clearError();
    try {
      const updated = await wonderApi.contribute(sessionId, prompt, adultAssist ? "adult" : "child", "revision");
      setSession(updated.session); setBusy(null);
      void paint("transform", `${updated.session.state.visualPrompt}. Change only this visible detail: ${prompt}. Preserve all established characters, composition, and story facts.`, updated.session.state.revision);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "That change could not be saved."); }
  }

  async function runAction(action: "undo" | "compose" | "finish") {
    if (!session || busy) return;
    setBusy(action === "undo" ? "Unweaving the last change" : action === "compose" ? "Arranging three pages" : "Binding your story"); clearError();
    try {
      const result = action === "undo" ? await wonderApi.undo(sessionId) : action === "compose" ? await wonderApi.compose(sessionId) : await wonderApi.finalize(sessionId);
      setSession(result.session); setBusy(null);
      if (action === "finish") router.push(`/story/${sessionId}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "That action could not be completed."); }
  }

  if (!session || !state) return <main id="main-content" className="loading-studio"><span className="guide-orb"><i /><i /><i /></span><h1>{error || "Opening your studio…"}</h1>{error && <PaperButton href="/setup">Start a new session</PaperButton>}</main>;

  return (
    <main id="main-content" className="studio-shell">
      <header className="studio-header">
        <Logo compact />
        <div className="story-progress"><div><span>Story path</span><strong>{state.phase === "finished" ? "Ready" : `${progress}%`}</strong></div><div className="progress-track"><i style={{ transform: `scaleX(${progress / 100})` }} /></div></div>
        <div className="studio-header-actions"><button type="button" className="icon-text-button" onClick={() => void runAction("undo")} disabled={busy !== null || session.history.length === 0}><Undo2 /> Undo</button><span className="autosave"><i /> Draft · session only</span></div>
      </header>

      <div className="mobile-panel-bar"><button onClick={() => setMobilePanel("ideas")}><Sparkles /> Ideas</button><span>{childCount} ideas in your thread</span><button onClick={() => setMobilePanel("thread")}><BookOpen /> Thread</button></div>

      <div className="studio-grid">
        <div className={`mobile-tray ${mobilePanel === "ideas" ? "is-open" : ""}`}><button className="tray-close" onClick={() => setMobilePanel(null)} aria-label="Close idea shelf"><X /></button><IdeaShelf state={state} onChoose={(idea) => { setMobilePanel(null); void submitIdea(idea); }} disabled={busy !== null} /></div>
        <div className="desktop-left"><IdeaShelf state={state} onChoose={(idea) => void submitIdea(idea)} disabled={busy !== null} /></div>

        <div className="studio-center">
          <section className="guide-prompt" aria-live="polite"><span className="guide-orb guide-orb--small" aria-hidden="true"><i /><i /><i /></span><div><p>Creative Guide <em>AI</em></p><h1>{busy ? `${busy}…` : state.guideQuestion}</h1></div></section>
          <LivingCanvas state={state} preview={visualPreview} busy={busy !== null} onEdit={(prompt) => void editVisual(prompt)} onRetry={() => void paint(state.currentImageUrl ? "transform" : "reveal", state.visualPrompt || `${state.hero || state.seed || "A new story hero"} in ${state.world || "a magical paper world"}`, state.revision)} />

          <VoiceDock status={voice.status} muted={voice.muted} caption={voice.caption} voiceAllowed={session.setup.voiceEnabled} mediaStream={voice.mediaStream} onConnect={() => void voice.connect()} onMute={voice.toggleMute} onStop={() => void voice.close()} />

          <form className="idea-composer" onSubmit={(event) => { event.preventDefault(); void submitIdea(); }}>
            <label htmlFor="story-idea">Add your next idea</label>
            <div className="composer-row"><textarea id="story-idea" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type anything you imagine…" maxLength={800} rows={1} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitIdea(); } }} /><button type="submit" disabled={!text.trim() || busy !== null} aria-label="Share this idea"><Send /></button></div>
            <div className="composer-options"><label><input type="checkbox" checked={adultAssist} onChange={(event) => setAdultAssist(event.target.checked)} /> A grown-up is helping type</label><span>{text.length}/800</span></div>
          </form>

          <div className="studio-next-actions">
            {state.pages.length === 0 && childCount >= 2 && <PaperButton variant="secondary" onClick={() => void runAction("compose")} disabled={busy !== null}><BookOpen /> Arrange my three pages</PaperButton>}
            {state.pages.length > 0 && <><PaperButton variant="secondary" href={`/story/${sessionId}`}><BookOpen /> Look through my pages</PaperButton><PaperButton onClick={() => void runAction("finish")} disabled={busy !== null || !state.titleConfirmed}>{state.titleConfirmed ? "Finish my book" : "Choose a title first"} <Redo2 /></PaperButton></>}
          </div>
        </div>

        <div className="desktop-right"><StoryThread contributions={state.contributions} /></div>
        <div className={`mobile-tray mobile-tray--right ${mobilePanel === "thread" ? "is-open" : ""}`}><button className="tray-close" onClick={() => setMobilePanel(null)} aria-label="Close story thread"><X /></button><StoryThread contributions={state.contributions} /></div>
      </div>

      {error && <div className="studio-alert" role="alert"><span>{error}</span><button onClick={clearError} aria-label="Dismiss message"><X /></button></div>}

    </main>
  );
}
