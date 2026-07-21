"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookCheck, ChevronLeft, ChevronRight, HeartHandshake, Pause, Pencil, PencilLine, Play, ShieldCheck, Sparkles, WandSparkles, X } from "lucide-react";
import { wonderApi } from "@/client/api";
import { Logo } from "@/components/logo";
import { PaperButton } from "@/components/paper-button";
import type { Contributor, GenerationRecord, WonderSession } from "@/lib/types";

const authorMeta: Record<Contributor, { label: string; icon: typeof Pencil; color: string }> = {
  child: { label: "Your ideas", icon: Pencil, color: "coral" },
  guide: { label: "Guide suggestions", icon: WandSparkles, color: "lilac" },
  adult: { label: "Grown-up help", icon: HeartHandshake, color: "teal" },
  system: { label: "WonderLoom arrangement", icon: Sparkles, color: "neutral" },
};

const generationLabels: Record<GenerationRecord["kind"], string> = {
  guide: "Creative Guide step",
  composition: "Page arrangement",
  image: "Illustration",
  speech: "Coral narration",
};

export function Storybook({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<WonderSession | null>(null);
  const [pageIndex, setPageIndex] = useState(-1);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [summary, setSummary] = useState<"authorship" | "parent" | null>(null);
  const [error, setError] = useState("");
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { wonderApi.getSession(sessionId).then(({ session: value }) => setSession(value)).catch((caught: Error) => setError(caught.message)); }, [sessionId]);
  useEffect(() => {
    if (session?.state.visualStatus !== "painting") return;
    const timer = window.setInterval(() => {
      void wonderApi.getSession(sessionId).then(({ session: value }) => setSession(value)).catch(() => undefined);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [session?.state.visualStatus, sessionId]);
  const stopNarration = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    setSpeaking(false);
    setSpeechLoading(false);
  }, []);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  useEffect(() => {
    if (!summary) return;
    modalCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSummary(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [summary]);

  const counts = useMemo(() => {
    const value: Record<Contributor, number> = { child: 0, guide: 0, adult: 0, system: 0 };
    session?.state.contributions.forEach((item) => { value[item.author] += 1; });
    return value;
  }, [session]);

  const speak = useCallback(async () => {
    if (!session) return;
    if (speaking || speechLoading) { stopNarration(); return; }
    const selectedPage = pageIndex >= 0 ? session.state.pages[pageIndex] : null;
    if (pageIndex >= 0 && !selectedPage) return;
    setSpeechLoading(true);
    setError("");
    try {
      const result = await wonderApi.speech(sessionId, selectedPage ? { kind: "page", pageId: selectedPage.id } : { kind: "cover" });
      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      audio.onplay = () => { setSpeechLoading(false); setSpeaking(true); };
      audio.onended = () => { audioRef.current = null; setSpeaking(false); };
      audio.onerror = () => { audioRef.current = null; setSpeechLoading(false); setSpeaking(false); setError("Coral could not play this narration. The written story is still here."); };
      await audio.play();
    } catch (caught) {
      setSpeechLoading(false);
      setError(caught instanceof Error ? caught.message : "Coral could not read this part right now.");
    }
  }, [pageIndex, session, sessionId, speaking, speechLoading, stopNarration]);

  async function savePage() {
    const page = session?.state.pages[pageIndex];
    if (!page || !draft.trim()) return;
    try { const result = await wonderApi.updatePage(sessionId, page.id, draft); setSession(result.session); setEditing(false); } catch (caught) { setError(caught instanceof Error ? caught.message : "The page could not be saved."); }
  }

  async function saveTitle() {
    if (!session || !titleDraft.trim()) return;
    try {
      const result = await wonderApi.patch(sessionId, "title", titleDraft.trim());
      setSession(result.session);
      setEditingTitle(false);
      stopNarration();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The title could not be saved."); }
  }

  if (!session) return <main id="main-content" className="loading-studio"><span className="guide-orb"><i /><i /><i /></span><h1>{error || "Opening your book…"}</h1>{error && <PaperButton href="/setup">Start a new story</PaperButton>}</main>;
  const page = pageIndex >= 0 ? session.state.pages[pageIndex] : null;
  const totalViews = session.state.pages.length + 1;
  const coverImage = session.state.currentImageUrl || "/images/wonderloom-welcome-hero.png";
  const pageImage = page?.imageUrl || session.state.currentImageUrl || "/images/wonderloom-empty-stage.png";

  return (
    <main id="main-content" className="storybook-shell">
      <header className="storybook-header"><Logo /><Link href={`/studio?session=${sessionId}`} className="back-link"><ArrowLeft /> Back to studio</Link><button className="summary-link" onClick={() => setSummary("authorship")}><BookCheck /> How this was made</button></header>

      <section className="storybook-stage" aria-label={`Storybook view ${pageIndex + 2} of ${totalViews}`}>
        <button className="page-arrow" type="button" disabled={pageIndex === -1} onClick={() => { setPageIndex((value) => value - 1); setEditing(false); setEditingTitle(false); stopNarration(); }} aria-label="Previous page"><ChevronLeft /></button>

        {pageIndex === -1 ? (
          <article className="book-cover" key="cover">
            <div className="cover-art"><img className="storybook-scene" key={coverImage} src={coverImage} alt={session.state.currentImageUrl ? `Cover illustration for ${session.state.title}` : "A handcrafted paper fox carrying a tiny sunrise"} />{session.state.visualStatus === "painting" && <span className="storybook-paint-note"><PencilLine /> Finishing the illustration…</span>}</div>
            <div className="cover-copy"><p>A WonderLoom story</p>{editingTitle ? <div className="title-editor"><label htmlFor="story-title">Change your book title</label><textarea id="story-title" rows={3} maxLength={100} value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} autoFocus /><div><button className="text-button" onClick={() => setEditingTitle(false)}>Cancel</button><PaperButton onClick={() => void saveTitle()} disabled={!titleDraft.trim()}>Save title</PaperButton></div></div> : <><h1>{session.state.title}</h1><span>Imagined and shaped by you</span><button className="edit-title" onClick={() => { setTitleDraft(session.state.titleConfirmed ? session.state.title : ""); setEditingTitle(true); }}><Pencil /> {session.state.titleConfirmed ? "Change the title" : "Choose the title"}</button></>}</div>
            <i className="cover-spine" />
          </article>
        ) : page ? (
          <article className="book-page" key={page.id}>
            <div className="book-page__image"><img className="storybook-scene" key={pageImage} src={pageImage} alt={page.imageUrl || session.state.currentImageUrl ? `Illustration for page ${page.pageNumber}` : "A handcrafted paper landscape waiting for this scene"} /><span>{String(page.pageNumber).padStart(2, "0")}</span>{session.state.visualStatus === "painting" && <span className="storybook-paint-note"><PencilLine /> Finishing the illustration…</span>}</div>
            <div className="book-page__copy">
              <p className="chapter-label">Page {page.pageNumber} of {session.state.pages.length}</p>
              {editing ? <div className="page-editor"><label htmlFor="page-text">Change this page in your own words</label><textarea id="page-text" value={draft} onChange={(event) => setDraft(event.target.value)} rows={7} maxLength={1600} /><div><button className="text-button" onClick={() => setEditing(false)}>Cancel</button><PaperButton onClick={() => void savePage()}>Save my words</PaperButton></div></div> : <><p className={`page-prose ${page.text.length > 240 ? "page-prose--long" : page.text.length > 170 ? "page-prose--medium" : ""}`}>{page.text}</p><button className="edit-page" onClick={() => { setDraft(page.text); setEditing(true); }}><Pencil /> Change this page</button></>}
            </div>
          </article>
        ) : <div className="book-page book-page--empty"><h1>Your pages are still being arranged.</h1><PaperButton href={`/studio?session=${sessionId}`}>Return to the studio</PaperButton></div>}

        <button className="page-arrow" type="button" disabled={pageIndex >= session.state.pages.length - 1} onClick={() => { setPageIndex((value) => value + 1); setEditing(false); setEditingTitle(false); stopNarration(); }} aria-label="Next page"><ChevronRight /></button>
      </section>

      <div className="storybook-controls">
        <div className="narration-control"><button type="button" className="narrate-button" onClick={() => void speak()}>{speaking || speechLoading ? <Pause /> : <Play />} {speechLoading ? "Preparing Coral…" : speaking ? "Stop reading" : "Read this aloud"}</button><small>AI-generated narration · Coral voice</small></div>
        <div className="page-dots" aria-label="Choose a page">{Array.from({ length: totalViews }, (_, index) => <button key={index} className={pageIndex + 1 === index ? "is-current" : ""} onClick={() => { setPageIndex(index - 1); setEditing(false); setEditingTitle(false); stopNarration(); }} aria-label={index === 0 ? "Cover" : `Page ${index}`} />)}</div>
        <button className="parent-link" onClick={() => setSummary("parent")}><ShieldCheck /> Grown-up summary</button>
      </div>

      {error && <div className="studio-alert" role="alert"><span>{error}</span><button onClick={() => setError("")}><X /></button></div>}

      {summary && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSummary(null); }}>
          <section className="summary-modal" role="dialog" aria-modal="true" aria-labelledby="summary-title">
            <button ref={modalCloseRef} className="modal-close" onClick={() => setSummary(null)} aria-label="Close summary"><X /></button>
            {summary === "authorship" ? <>
              <p className="kicker"><span /> Clear authorship</p><h2 id="summary-title">How this story was made</h2>
              <p>WonderLoom keeps the creative thread visible. Counts show contributions, not scores or judgments.</p>
              <div className="authorship-grid">{(Object.keys(authorMeta) as Contributor[]).map((author) => { const meta = authorMeta[author]; const Icon = meta.icon; return <div className={`authorship-card authorship-card--${meta.color}`} key={author}><Icon /><strong>{counts[author]}</strong><span>{meta.label}</span></div>; })}</div>
              <div className="summary-principle"><Sparkles /><p><strong>The child’s words are authoritative.</strong> The Guide offered prompts; WonderLoom arranged accepted ideas into pages. Pictures never changed the story facts.</p></div>
              <section className="generation-log" aria-labelledby="generation-log-title">
                <div><p className="kicker"><span /> Saved provenance</p><h3 id="generation-log-title">Generation process</h3></div>
                {session.generationRecords.length > 0 ? <div className="generation-log__list">{session.generationRecords.map((record, index) => <details className="generation-record" key={record.id}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{generationLabels[record.kind]}</strong><small>{record.model} · {record.status}</small></summary>
                  <dl><div><dt>Target</dt><dd>{record.target || record.intent || "Story canvas"}</dd></div><div><dt>Started</dt><dd>{new Date(record.startedAt).toLocaleString()}</dd></div>{record.completedAt && <div><dt>Completed</dt><dd>{new Date(record.completedAt).toLocaleString()}</dd></div>}</dl>
                  {record.prompt && <div className="generation-record__text"><strong>Input / prompt</strong><p>{record.prompt}</p></div>}
                  {record.instructions && <div className="generation-record__text"><strong>Instructions</strong><p>{record.instructions}</p></div>}
                  {record.result && <div className="generation-record__text"><strong>Saved result</strong><p>{record.result}</p></div>}
                  {record.partialAssetUrls && record.partialAssetUrls.length > 0 && <div className="generation-thumbnails" aria-label="Saved partial illustrations">{record.partialAssetUrls.map((url, partialIndex) => <img key={url} src={url} alt={`Illustration stage ${partialIndex + 1}`} />)}</div>}
                  {record.assetUrl && record.kind === "image" && <img className="generation-final" src={record.assetUrl} alt="Final saved illustration" />}
                  {record.assetUrl && record.kind === "speech" && <audio className="generation-audio" src={record.assetUrl} controls preload="none">Your browser cannot play this saved narration.</audio>}
                  {record.error && <p className="generation-error">{record.error}</p>}
                </details>)}</div> : <p className="generation-empty">No model generation has been requested for this story yet.</p>}
              </section>
            </> : <>
              <p className="kicker"><span /> Session summary</p><h2 id="summary-title">A calm look for grown-ups</h2>
              <p>This is a provenance summary—not an assessment of the child.</p>
              <dl className="parent-stats"><div><dt>Story path</dt><dd>{session.state.phase === "finished" ? "Finished" : "Still editable"}</dd></div><div><dt>Child contributions</dt><dd>{counts.child}</dd></div><div><dt>Revisions made</dt><dd>{session.state.contributions.filter((item) => item.kind === "revision").length}</dd></div><div><dt>Pages</dt><dd>{session.state.pages.length}</dd></div><div><dt>Microphone recordings stored</dt><dd>None</dd></div><div><dt>Story archive</dt><dd>{session.completedAt ? "Finished book saved" : "Saves when finished"}</dd></div></dl>
              <p className="parent-caveat">WonderLoom stores this story and its generated assets on this device. WonderLoom does not infer personality, emotion, reading ability, or development from this session.</p>
            </>}
          </section>
        </div>
      )}
    </main>
  );
}
