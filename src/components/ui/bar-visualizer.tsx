"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { VoiceStatus } from "@/client/use-realtime-guide";

const IDLE_PATTERN = [0.22, 0.38, 0.56, 0.32, 0.72, 0.45, 0.84, 0.52, 0.68, 0.36, 0.58, 0.29, 0.48, 0.25, 0.4];

export interface BarVisualizerProps {
  state: VoiceStatus;
  barCount?: number;
  mediaStream?: MediaStream | null;
  minHeight?: number;
  maxHeight?: number;
  centerAlign?: boolean;
  className?: string;
}

export function BarVisualizer({
  state,
  barCount = 15,
  mediaStream = null,
  minHeight = 16,
  maxHeight = 100,
  centerAlign = true,
  className = "",
}: BarVisualizerProps) {
  const reduceMotion = useReducedMotion();
  const liveBands = useMultibandVolume(state === "listening" && !reduceMotion ? mediaStream : null, barCount);
  const pattern = useMemo(
    () => Array.from({ length: barCount }, (_, index) => IDLE_PATTERN[index % IDLE_PATTERN.length]),
    [barCount],
  );
  const hasLiveAudio = Boolean(mediaStream && state === "listening" && liveBands.some((value) => value > 0.04));

  return (
    <div
      className={`bar-visualizer bar-visualizer--${state} ${centerAlign ? "is-centered" : ""} ${className}`.trim()}
      role="img"
      aria-label={`Voice activity: ${state}`}
      data-animated={!reduceMotion && ["connecting", "listening", "thinking", "speaking"].includes(state)}
      data-live={hasLiveAudio}
    >
      {pattern.map((resting, index) => {
        const volume = hasLiveAudio ? liveBands[index] : resting;
        const bounded = Math.min(1, Math.max(0, volume));
        const scale = (minHeight + bounded * (maxHeight - minHeight)) / 100;
        return (
          <i
            key={index}
            style={{
              transform: `scaleY(${state === "off" || state === "blocked" || state === "muted" ? Math.min(scale, 0.36) : scale})`,
              animationDelay: `${-index * 47}ms`,
              transitionDelay: hasLiveAudio ? "0ms" : `${index * 8}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export function useMultibandVolume(mediaStream: MediaStream | null, bands = 15): number[] {
  const [volumes, setVolumes] = useState<number[]>(() => Array.from({ length: bands }, () => 0));

  useEffect(() => {
    if (!mediaStream || typeof window === "undefined") {
      return;
    }

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.72;
    analyser.minDecibels = -82;
    analyser.maxDecibels = -18;
    const source = context.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame = 0;
    let previousUpdate = 0;

    const sample = (time: number) => {
      if (time - previousUpdate >= 32) {
        analyser.getByteFrequencyData(frequencyData);
        const usableBins = Math.max(bands, Math.floor(frequencyData.length * 0.72));
        const next = Array.from({ length: bands }, (_, band) => {
          const start = Math.floor((band / bands) ** 1.35 * usableBins);
          const end = Math.max(start + 1, Math.floor(((band + 1) / bands) ** 1.35 * usableBins));
          let total = 0;
          for (let index = start; index < end; index += 1) total += frequencyData[index] ?? 0;
          return Math.min(1, total / Math.max(1, end - start) / 190);
        });
        setVolumes(next);
        previousUpdate = time;
      }
      animationFrame = requestAnimationFrame(sample);
    };
    animationFrame = requestAnimationFrame(sample);

    return () => {
      cancelAnimationFrame(animationFrame);
      source.disconnect();
      analyser.disconnect();
      void context.close();
    };
  }, [bands, mediaStream]);

  return volumes;
}
