"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Headphones, Mic2, ShieldCheck, Type } from "lucide-react";
import { wonderApi } from "@/client/api";
import { Logo } from "@/components/logo";
import { PaperButton } from "@/components/paper-button";
import type { SetupPreferences } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<SetupPreferences>({ ageBand: "8-10", readingMode: "read-with-me", voiceEnabled: true, adultConfirmed: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function begin() {
    if (!setup.adultConfirmed) { setError("A grown-up needs to check the box before the studio opens."); return; }
    setBusy(true); setError("");
    try {
      const { session } = await wonderApi.startSession(setup);
      sessionStorage.setItem("wonderloom-session", session.id);
      router.push(`/studio?session=${session.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The studio could not open.");
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="setup-shell">
      <header className="simple-header"><Logo /><Link className="back-link" href="/"><ArrowLeft size={16} /> Back</Link></header>
      <section className="setup-grid">
        <div className="setup-intro">
          <p className="kicker"><span /> Adult setup</p>
          <h1>Safe studio<br /><em>Setup.</em></h1>
          <p>These choices shape pacing and narration for this session only. WonderLoom does not retain user data or profiles.</p>
          <div className="privacy-note"><ShieldCheck /><div><strong>A private creative session</strong><p>No raw audio is stored. Please keep real names, schools, addresses, and contact details out of the story.</p></div></div>
        </div>

        <form className="setup-card" onSubmit={(event) => { event.preventDefault(); void begin(); }}>
          <fieldset>
            <legend>About how old is the storyteller?</legend>
            <p className="field-help">This only adjusts sentence length and reading pace.</p>
            <div className="choice-row">
              {(["6-7", "8-10"] as const).map((value) => <label className={`choice-card ${setup.ageBand === value ? "is-selected" : ""}`} key={value}><input type="radio" name="age" value={value} checked={setup.ageBand === value} onChange={() => setSetup({ ...setup, ageBand: value })} /><span className="choice-title">Ages {value}</span><span>{value === "6-7" ? "Shorter prompts" : "A little more detail"}</span></label>)}
            </div>
          </fieldset>

          <fieldset>
            <legend>How should the book be read?</legend>
            <div className="choice-row">
              <label className={`choice-card ${setup.readingMode === "read-with-me" ? "is-selected" : ""}`}><input type="radio" name="reading" checked={setup.readingMode === "read-with-me"} onChange={() => setSetup({ ...setup, readingMode: "read-with-me" })} /><BookOpen /><span className="choice-title">Read with me</span><span>Keep text visible and paced</span></label>
              <label className={`choice-card ${setup.readingMode === "read-to-me" ? "is-selected" : ""}`}><input type="radio" name="reading" checked={setup.readingMode === "read-to-me"} onChange={() => setSetup({ ...setup, readingMode: "read-to-me" })} /><Headphones /><span className="choice-title">Read to me</span><span>Narration comes forward</span></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Ways to share ideas</legend>
            <label className="toggle-row"><span className="toggle-icon">{setup.voiceEnabled ? <Mic2 /> : <Type />}</span><span><strong>Allow microphone</strong><small>Voice connects directly to the Creative Guide. Typing always remains available.</small></span><input type="checkbox" checked={setup.voiceEnabled} onChange={(event) => setSetup({ ...setup, voiceEnabled: event.target.checked })} /><i aria-hidden="true" /></label>
          </fieldset>

          <label className="adult-check"><input type="checkbox" checked={setup.adultConfirmed} onChange={(event) => setSetup({ ...setup, adultConfirmed: event.target.checked })} /><span>I’m a grown-up and I understand that WonderLoom uses OpenAI models to respond, illustrate, and check safety during this session.</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <PaperButton type="submit" disabled={busy}>{busy ? "Opening the studio…" : <>Open the studio <ArrowRight size={18} /></>}</PaperButton>
        </form>
      </section>
    </main>
  );
}
