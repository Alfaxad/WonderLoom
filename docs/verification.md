# Build-week verification

## Static and automated checks

- TypeScript strict typecheck: passed.
- ESLint: passed without warnings.
- Vitest: story state, bounded undo, stale-image rejection, finished-book persistence gating, generation provenance, privacy, and danger routing pass.
- Playwright: desktop and 390px mobile journeys passed; no horizontal overflow, explicit AI identity, keyboard input, and reduced-motion media behavior verified.
- Next.js production build: passed.

## Final publication verification

Repeated on 22 July 2026 before the repository was prepared for public release:

- `npm run lint`: passed.
- `npm test -- --run`: 5 test files and 17 tests passed.
- `npm run build`: production compilation, TypeScript, route collection, and static generation passed.
- `npx playwright test e2e/product-journey.spec.ts`: all 6 desktop and mobile journeys passed.
- Local Markdown audit: all relative links across 41 Markdown files resolve.
- Secret-pattern and ignore-rule audit: no credential-shaped values were found in publishable files; local environment files, Vercel metadata, generated images, story archives, test output, and planning files remain ignored.
- Repository-size audit: no publishable file exceeds GitHub's 100 MB per-file limit; the largest bundled paper is approximately 25 MB.
- Security diff scan: all changed source-like files were reviewed, reported issues were fixed and revalidated, and no reportable findings remain.
- Deployment retirement: the temporary Vercel project and its private object store were removed; the previous public URL now returns `404`.

## Finished-book archive checks

- Cleared the previous local archive and generated runtime assets.
- A newly created unfinished session produced no archive JSON and did not appear in `/api/library`.
- After a cold server restart, that unfinished session returned `404` and the library remained empty.
- A disposable book with a confirmed title and three ready pages finalized successfully, received a completion timestamp, appeared in the library, and produced one archive JSON.
- The disposable completed book was removed and the final development server was cold-started with an empty library.

## Live OpenAI checks

- Existing workspace credential validated without logging or copying the secret.
- `gpt-5.6-luna`: structured child-led turn plan passed.
- `gpt-image-2`: first scene reveal passed.
- `gpt-image-2`: source-image visual transformation passed after removing an unsupported fidelity option discovered by the live integration test.
- `gpt-5.6-luna`: exactly three editable story pages composed.
- `gpt-realtime-2.1-mini`: ephemeral client secret minted by the server with Marin audio output, low reasoning effort, far-field noise reduction, semantic VAD, interruption, and server-side safety identifier.
- OpenAI Agents SDK + WebRTC: headless browser verified the token's model and voice, connected with a simulated microphone, received real model speech, was interrupted, and disconnected cleanly.

## Deliberate MVP boundaries

- Raw audio is not stored.
- No accounts, long-term child profiles, social features, analytics dashboard, or production database.
- Finished stories and generated assets use local disk storage; active drafts survive only for the running server process. Production should move finished books to authenticated database and private object storage adapters.
