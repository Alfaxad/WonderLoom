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
- `npm test -- --run`: 6 test files and 20 tests passed.
- `npm run build`: production compilation, TypeScript, route collection, and static generation passed.
- `npx playwright test e2e/product-journey.spec.ts`: all 6 desktop and mobile journeys passed.
- Local Markdown audit: all relative links across 41 Markdown files resolve.
- Secret-pattern and ignore-rule audit: no credential-shaped values were found in publishable files; local environment files, Vercel metadata, generated images, story archives, test output, and planning files remain ignored.
- Repository-size audit: no publishable file exceeds GitHub's 100 MB per-file limit; the largest bundled paper is approximately 25 MB.
- Security diff scan: all changed source-like files were reviewed, reported issues were fixed and revalidated, and no reportable findings remain.
- `npm audit --omit=dev`: two transitive advisory families remain at moderate severity. The Hono finding is confined to an unused Windows static-file adapter pulled through the Agents SDK's MCP dependency, while the PostCSS finding is in Next.js's build-time CSS dependency; npm offers only breaking downgrades, so neither was force-applied. Reassess when upstream patch releases become available.
- Vercel project metadata and environment values remain untracked and ignored.

## Temporary Vercel deployment verification

Repeated on 22 July 2026 after adding the private Blob runtime adapter:

- Production build completed successfully and exposed every expected dynamic API route, including the private `/api/media/[...path]` proxy.
- A disposable active session survived repeated process restarts during isolated cold-recovery testing and accepted a later contribution.
- The live verifier covers setup, 12 concurrent session recoveries, Realtime token configuration, contribution, narrow edit, undo, structured guide turns, streamed image partials and finals, three independent page illustrations, media delivery, three-page composition, editable title and page, finalization, library inclusion, story route, Coral narration, narration caching, and cleanup.
- Live browser checks passed on desktop and 390 px mobile for welcome, setup, studio layout, AI disclosure, generated assets, keyboard access, reduced motion, and horizontal overflow.
- A real headless WebRTC connection received a `gpt-realtime-2.1-mini` session using Marin, reached the listening/speaking flow, passed the output safety call, and disconnected cleanly.
- The disposable completed book returned `404` after deletion, the live library returned empty, and the private Blob store contained no remaining session or media objects.
- Error-level Vercel logs for the acceptance window were empty.
- `wonderloom-openai.vercel.app` is the sole friendly WonderLoom alias. Vercel's immutable deployment URL still exists as part of the platform.
- Page-illustration regression: a disposable live story generated three independent scenes, retained three distinct page URLs through composition, rendered each URL in the storybook, and removed all test media afterward. A read-only browser check also confirmed that a previously collapsed saved book recovered three distinct stored visual artifacts, including the best available progressive frame from an interrupted legacy job.

## Finished-book archive checks

- Cleared the previous local archive and generated runtime assets.
- A newly created unfinished session produced no archive JSON and did not appear in `/api/library`.
- In local mode, a cold server restart discarded that unfinished session and the library remained empty.
- In Vercel mode, active drafts recovered from private Blob storage across cold starts but remained absent from the library.
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
- Local development uses ignored disk for completed books and media, while active drafts survive only for the running process. The temporary Vercel runtime uses private Blob objects with a 24-hour logical draft lifetime. It is restart-safe but is not a substitute for authenticated, tenant-isolated production storage.
