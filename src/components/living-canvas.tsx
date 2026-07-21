"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ImageIcon, PencilLine, RefreshCcw, WandSparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PaperButton } from "@/components/paper-button";
import type { StoryState, VisualPreview } from "@/lib/types";

export function LivingCanvas({ state, preview, busy, onEdit, onRetry }: { state: StoryState; preview: VisualPreview | null; busy: boolean; onEdit: (prompt: string) => void; onRetry: () => void }) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState("");
  const hasImage = Boolean(state.currentImageUrl);
  const displayedImage = preview?.imageUrl || state.currentImageUrl;
  const isPainting = state.visualStatus === "painting" || Boolean(preview);
  const partialStep = preview ? Math.max(0, preview.partialIndex + 1) : 0;
  const visualMessage = preview?.message || (state.visualStatus === "painting" ? "Preparing the first sketch" : state.visualStatus === "blocked" ? "Paint paused" : hasImage ? "Scene ready" : "Waiting for a spark");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!edit.trim()) return;
    onEdit(edit.trim()); setEdit(""); setEditing(false);
  }

  return (
    <section className="living-canvas" aria-labelledby="canvas-title">
      <div className="canvas-toolbar">
        <div><p className="panel-kicker">Living canvas</p><h2 id="canvas-title">{state.world || state.title}</h2></div>
        <div className={`visual-state visual-state--${isPainting ? "painting" : state.visualStatus}`} aria-live="polite">
          <i />{visualMessage}
        </div>
      </div>

      <div className={`canvas-stage ${isPainting ? "is-painting" : ""} ${preview?.imageUrl ? "has-partial" : ""}`}>
        <div className="canvas-visual-stack">
          {!displayedImage && (
            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0.01 : 0.24 }} className="canvas-placeholder"><img className="canvas-static-art" src="/images/wonderloom-empty-stage.png" alt="A handcrafted paper landscape waiting for a story" /><div className="canvas-invitation"><ImageIcon /><strong>Your world will appear here</strong><span>Begin with any tiny idea.</span></div></motion.div>
          )}
          <AnimatePresence initial={false}>
            {displayedImage && <motion.img className={`canvas-render ${preview?.imageUrl ? `canvas-render--partial-${partialStep}` : "canvas-render--final"}`} key={displayedImage} initial={{ opacity: 0, transform: reduceMotion ? "none" : "scale(1.012)" }} animate={{ opacity: 1, transform: "scale(1)" }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: [0.16, 1, 0.3, 1] }} src={displayedImage} alt={preview?.imageUrl ? `${visualMessage} for the child's story world` : `A cut-paper illustration of ${state.visualPrompt || state.seed || "the child's story world"}`} />}
          </AnimatePresence>
        </div>
        {isPainting && <div className={`paint-wash ${preview?.imageUrl ? "paint-wash--partial" : ""}`}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><div className="canvas-making" role="status" aria-live="polite"><span><PencilLine className="painting-pencil" /> {visualMessage}</span><div className="making-steps" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <b className={index <= partialStep ? "is-filled" : ""} key={index} />)}</div><small>You can keep talking or typing while WonderLoom paints.</small></div></div>}
      </div>

      <div className="canvas-actions">
        {hasImage && !editing && !isPainting && state.visualStatus !== "blocked" && <PaperButton variant="secondary" onClick={() => setEditing(true)} disabled={busy}><WandSparkles size={17} /> Change something you can see</PaperButton>}
        {isPainting && <p className="canvas-caption canvas-caption--painting"><PencilLine /> Your words stay in charge while the picture catches up.</p>}
        {state.visualStatus === "blocked" && <div className="canvas-retry"><span>{state.visualError ? "The picture paused, but your story is safe." : "The picture paused before it was ready."}</span><PaperButton variant="secondary" onClick={onRetry} disabled={busy}><RefreshCcw size={16} /> Try painting again</PaperButton></div>}
        {editing && <form className="canvas-edit" onSubmit={submit}><label htmlFor="visual-edit">What should look different?</label><div><input id="visual-edit" value={edit} onChange={(event) => setEdit(event.target.value)} placeholder="Give the hero a bright red cape…" maxLength={500} autoFocus /><PaperButton type="submit" disabled={!edit.trim() || busy}><RefreshCcw size={16} /> Paint change</PaperButton></div><button type="button" className="text-button" onClick={() => setEditing(false)}>Keep it as it is</button></form>}
        {!hasImage && !isPainting && state.visualStatus !== "blocked" && <p className="canvas-caption">The picture follows the story. If they disagree, your words win.</p>}
      </div>
    </section>
  );
}
