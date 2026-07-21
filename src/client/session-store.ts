"use client";

import { create } from "zustand";
import type { VisualPreview, WonderSession } from "@/lib/types";

interface SessionStore {
  session: WonderSession | null;
  busy: string | null;
  error: string | null;
  visualPreview: VisualPreview | null;
  setSession: (session: WonderSession | null) => void;
  setBusy: (busy: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setVisualPreview: (preview: VisualPreview | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  busy: null,
  error: null,
  visualPreview: null,
  setSession: (session) => set({ session }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error, busy: null }),
  clearError: () => set({ error: null }),
  setVisualPreview: (visualPreview) => set({ visualPreview }),
}));
