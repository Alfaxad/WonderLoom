"use client";

import { Feather, Map, PackageOpen, Sparkles } from "lucide-react";
import type { StoryState } from "@/lib/types";

const defaults = [
  { label: "A creature", icon: Feather, color: "coral" },
  { label: "A curious place", icon: Map, color: "teal" },
  { label: "A surprising object", icon: PackageOpen, color: "saffron" },
];

export function IdeaShelf({ state, onChoose, disabled }: { state: StoryState; onChoose: (value: string) => void; disabled: boolean }) {
  const ideas = state.suggestions.length ? state.suggestions : defaults.map((item) => item.label);
  return (
    <aside className="idea-shelf" aria-labelledby="idea-shelf-title">
      <div className="panel-heading"><div><p className="panel-kicker">Optional sparks</p><h2 id="idea-shelf-title">Idea shelf</h2></div><Sparkles size={17} /></div>
      <p className="shelf-help">Choose one, change one, or make your own.</p>
      <div className="idea-stack">
        {ideas.slice(0, 3).map((idea, index) => {
          const fallback = defaults[index] ?? defaults[0];
          const Icon = fallback.icon;
          return <button type="button" disabled={disabled} className={`idea-card idea-card--${fallback.color}`} onClick={() => onChoose(idea)} key={idea}><span><Icon size={18} /></span><strong>{idea}</strong><small>Try this</small></button>;
        })}
      </div>
      <div className="shelf-note"><span>✦</span><p>The Guide’s ideas stay suggestions until you choose them.</p></div>
    </aside>
  );
}
