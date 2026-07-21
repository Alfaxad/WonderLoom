# Story archive and generation provenance

WonderLoom keeps a story as an active draft while the child creates it, then turns it into a durable creative project only when the child finishes the book. Draft mutations remain in the running server session and do not create archive JSON. A story becomes eligible for `data/wonderloom/sessions/<session-id>.json` only after the explicit **Finish my book** action succeeds and the server verifies all of the following:

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

Drafts are intentionally session-only: refreshing within the same running development server can retain the active draft, but a cold server restart discards it. Generated binary working assets live under `public/generated/<session-id>/`. They are not shelf entries and are retained independently so route initialization cannot remove an illustration while an active draft is still using it. A production storage adapter should expire unreferenced draft assets with a coordinated background retention job.

The server loads only verified finished-book JSON files on process start. Any legacy or malformed incomplete snapshot is removed rather than exposed as a saved story. Each finished-book write goes to a same-directory temporary file before an atomic rename, preventing a partially written snapshot from replacing the last good book. Later edits to a finished book continue to update that archive while it satisfies the completeness invariant. If an undo makes it incomplete, it leaves the saved shelf until it is finalized again.

Speech cache keys include model, voice, exact narration text, and instructions; changing a title or page therefore produces a fresh narration asset while unchanged text reuses the saved MP3.

The archive is intentionally local for this prototype. A future multi-device account system would need authenticated object storage and a transactional database without changing the `WonderSession` contract. That hosted architecture is deliberately outside this repository's documented run path.
