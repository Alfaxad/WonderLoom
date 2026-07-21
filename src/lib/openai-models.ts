/**
 * One shared source of truth for the two intentionally separate voice paths.
 * Realtime handles the live, interruptible Creative Guide conversation.
 * Speech handles deterministic narration of saved book text.
 */
export const REALTIME_MODEL = "gpt-realtime-2.1-mini" as const;
export const REALTIME_VOICE = "marin" as const;
export const REALTIME_REASONING_EFFORT = "low" as const;

export const BOOK_NARRATION_MODEL = "gpt-4o-mini-tts" as const;
export const BOOK_NARRATION_VOICE = "coral" as const;
