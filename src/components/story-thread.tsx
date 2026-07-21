"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bot, HeartHandshake, Pencil, WandSparkles } from "lucide-react";
import type { Contribution } from "@/lib/types";

const labels = {
  child: { label: "Your idea", icon: Pencil },
  guide: { label: "Guide suggestion", icon: WandSparkles },
  adult: { label: "Grown-up helped", icon: HeartHandshake },
  system: { label: "WonderLoom arranged", icon: Bot },
};

export function StoryThread({ contributions }: { contributions: Contribution[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <aside className="story-thread" aria-labelledby="story-thread-title">
      <div className="panel-heading"><div><p className="panel-kicker">Always visible</p><h2 id="story-thread-title">Your story thread</h2></div><span>{contributions.filter((item) => item.author === "child").length} yours</span></div>
      <div className="thread-list" aria-live="polite">
        {contributions.length === 0 && <div className="thread-empty"><i /><p>Your ideas will gather here, one by one.</p></div>}
        <AnimatePresence initial={false}>
          {contributions.map((item) => {
            const meta = labels[item.author];
            const Icon = meta.icon;
            return (
              <motion.article
                layout={!reduceMotion}
                initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(14px)" }}
                animate={{ opacity: 1, transform: reduceMotion ? "none" : "translateY(0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`thread-card thread-card--${item.author} ${!item.accepted ? "is-provisional" : ""}`}
                key={item.id}
              >
                <div className="thread-meta"><span><Icon size={13} /> {meta.label}</span>{!item.accepted && <em>provisional</em>}</div>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
}
