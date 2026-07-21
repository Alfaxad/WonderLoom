# Progressive image pipeline

WonderLoom treats image generation as a long-running, concurrent creative process rather than a blocking request. Voice and text remain interactive while the visual layer catches up.

## Runtime contract

The visual route returns newline-delimited JSON (`application/x-ndjson`) with this sequence:

1. `started` — the canonical session enters `visualStatus: "painting"`.
2. `partial` — up to three temporary JPEG URLs, labeled `sketch`, `color`, and `details`.
3. `complete` — the final JPEG is persisted and committed to `currentImageUrl` and any pages sharing the canvas scene.

The API may return fewer than three partials when the final image completes quickly. The UI therefore treats stages as observed frames, not a percentage-based time estimate.

## State separation

- `StoryState` remains canonical and stores only the completed image URL.
- `VisualPreview` is ephemeral client state for the currently visible partial.
- Partial base64 payloads never enter session state or history.
- A newer visual job supersedes an older job without unrelated story edits invalidating the active image request.
- The client aborts an older stream when a newer visual request begins.

## Child-facing experience

- The placeholder glows while the request is preparing.
- Partial frames crossfade from a muted sketch treatment toward full color and detail.
- A small pencil cue and four observed-stage marks explain what is happening.
- The composer and Realtime voice controls stay usable throughout painting.
- If painting fails, the canvas shows an inline retry and explicitly preserves the story.
- The storybook polls while painting and gives the final image a short settle transition when it arrives.

## Storage and cleanup

Temporary frames use `scene-NNN-partial-N.jpg`. They are retained with the generation record so a saved story preserves how its illustration emerged. Local development stores the JPEGs under `public/generated/<session-id>/`. Vercel stores them in private Blob storage and streams them through the validated same-origin `/api/media/...` route, so neither storage credentials nor public Blob URLs reach the browser.

## OpenAI API basis

WonderLoom uses `gpt-image-2` through the Image API with `stream: true` and `partial_images: 3` for generation and edit requests. The API documents 0–3 partial images and a separate final completion event. JPEG output is retained because the official guidance recommends it when latency matters.

Reference: [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation#streaming)
