"use client";

import { Keyboard, Mic, MicOff, Radio, Volume2, X } from "lucide-react";
import type { VoiceStatus } from "@/client/use-realtime-guide";
import { BarVisualizer } from "@/components/ui/bar-visualizer";

export function VoiceDock({
  status, muted, caption, voiceAllowed, mediaStream, onConnect, onMute, onStop,
}: {
  status: VoiceStatus; muted: boolean; caption: string; voiceAllowed: boolean;
  mediaStream?: MediaStream | null;
  onConnect: () => void; onMute: () => void; onStop: () => void;
}) {
  const connected = !["off", "blocked", "connecting"].includes(status);
  return (
    <section className={`voice-dock voice-dock--${status}`} aria-label="Creative Guide voice controls">
      <div className="voice-identity"><span className="guide-orb" aria-hidden="true"><i /><i /><i /></span><div><strong>Creative Guide</strong><small>AI Realtime voice · {caption}</small></div></div>
      <BarVisualizer state={status} mediaStream={mediaStream} barCount={15} />
      <div className="voice-controls">
        {!voiceAllowed ? <span className="voice-disabled"><Keyboard size={16} /> Typing mode</span> : !connected ? <button className="mic-main" type="button" onClick={onConnect} disabled={status === "connecting"}>{status === "connecting" ? <Radio /> : <Mic />}<span>{status === "connecting" ? "Connecting" : "Start voice"}</span></button> : <><button type="button" className="round-control" onClick={onMute} aria-label={muted ? "Resume microphone" : "Pause microphone"}>{muted ? <MicOff /> : <Mic />}</button><button type="button" className="round-control" onClick={onStop} aria-label="Stop voice"><X /></button><span className="speaking-state">{status === "speaking" ? <Volume2 /> : <Radio />} {status}</span></>}
      </div>
    </section>
  );
}
