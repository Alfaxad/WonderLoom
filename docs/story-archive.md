# Story archive and generation provenance

WonderLoom keeps a story as a recoverable active draft while the child creates it, then turns it into a library entry only when the child finishes the book. Local development keeps active drafts in process memory and writes only complete books to `data/wonderloom/sessions/<session-id>.json`. Vercel stores active and complete sessions as private Blob objects, but applies the same finished-book gate to the library. A story becomes eligible for the shelf only after the explicit **Finish my book** action succeeds and the server verifies all of the following:

- The child has confirmed a non-placeholder title.
- The story contains exactly three pages.
- Every page is ready and contains non-empty text.
- The canonical story phase is `finished`.

Setting a finished phase on its own is not enough: the finalization route marks the verified session complete. The **Your stories** shelf reads this finished-book archive, so partial drafts never appear there.

## What is retained

- Setup preferences and the canonical story fields.
- The child-selected title and whether it has been confirmed.
- All three editable pages and their current illustration references.
- Child, adult, Creative Guide, and system contributions with authorship labels.
- Bounded undo history for story-state changes.
- Guide-planning and page-composition inputs, instructions, models, results, timestamps, and failures.
- Image prompts, streamed partial illustrations, final images, job revisions, and failures.
- Narration text, scene-adaptive voice instructions, source hashes, cached MP3s, and failures.

Raw microphone recordings are never added to the archive. The storybook identifies Coral narration as AI-generated.

## Draft lifecycle, recovery, and caching

In local development, refreshing within the same running server can retain the active draft, while a cold restart discards it. On Vercel, each mutation is flushed to private Blob storage and each request rehydrates the canonical session before reading or changing it. Active cloud drafts have a 24-hour logical lifetime; complete books remain until explicitly deleted. This prevents serverless instance changes from ending a live studio session without allowing unfinished work onto the shelf.

Local generated media lives under `public/generated/<session-id>/`. Vercel generated images, progressive previews, and narration MP3s live in the same private Blob store and are streamed through the validated same-origin `/api/media/...` route; storage URLs and credentials are never exposed. Deleting a session removes its session object and associated media.

The local server loads only verified finished-book JSON files on process start. Any legacy or malformed incomplete snapshot is removed rather than exposed as a saved story. Each local finished-book write goes to a same-directory temporary file before an atomic rename, preventing a partially written snapshot from replacing the last good book. Later edits to a finished book continue to update its record while it satisfies the completeness invariant. If an undo makes it incomplete, it leaves the saved shelf until it is finalized again.

Speech cache keys include model, voice, exact narration text, and instructions; changing a title or page therefore produces a fresh narration asset while unchanged text reuses the saved MP3.

The Vercel adapter provides restart-safe prototype sessions, not multi-user accounts or cross-device identity. A durable multi-user product would still need authentication, per-user authorization, explicit retention controls, and transactional storage without changing the `WonderSession` contract.
