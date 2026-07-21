# WonderLoom build-week brief

## Product loop

The build must demonstrate one coherent five-minute loop:

1. A grown-up completes lightweight setup and understands microphone/AI use.
2. A child names a seed idea by voice or text.
3. The Creative Guide reflects the idea and asks one specific open question.
4. A first world image is revealed.
5. The child directly edits one concrete visual property.
6. The child decides what happens next; the world visibly transforms.
7. WonderLoom composes three editable pages.
8. The finished book can be narrated and shows a plain-language authorship summary.

## Non-negotiable agency contract

- Every stored contribution has an author and timestamp.
- AI suggestions remain provisional until accepted or revised.
- Reject, skip, revise, and undo remain visible.
- The story state is canonical; images illustrate it and cannot silently rewrite it.
- Tools make narrow typed changes instead of replacing the whole story.
- A late image response cannot overwrite a newer revision.

## Technical shape

- Next.js App Router, TypeScript, React.
- One `RealtimeAgent` / `RealtimeSession` for the Creative Guide.
- Browser voice connection uses a server-minted ephemeral Realtime client secret.
- `gpt-realtime-2.1-mini` provides direct speech-to-speech conversation, tool use, semantic turn detection, and interruption over WebRTC.
- `gpt-5.6-luna` produces typed turn plans and page drafts.
- `gpt-image-2` reveals and edits the living canvas.
- The server owns provider credentials, moderation, tool authorization, revision checks, and canonical session state.
- `gpt-4o-mini-tts` with Coral narrates the saved book; Realtime remains the live conversational voice.
- Local persistent storage retains only explicitly finished, titled three-page books and their generation provenance. Active drafts are session-only. No child profile or raw microphone audio is retained.

## Safety boundary

- Moderate child text, generated prompts, and guide output.
- Do not ask for names, locations, school, contact information, or secrets.
- Do not diagnose, assess, or infer emotions or personality.
- If input suggests immediate danger, stop the creative flow and ask the child to get a trusted grown-up now.
- No client-visible OpenAI API key and no anonymous generic proxy endpoint.

## Acceptance criteria

- Complete loop works with typed input if microphone access is absent.
- Realtime voice can connect, disconnect, be interrupted, and clearly exposes state.
- Scene generation supports reveal, transform, and advance semantics.
- Three pages can be composed, revised, narrated, finalized, and undone.
- Authorship summary distinguishes child, guide, adult-assisted, and system-arranged contributions.
- Layout is useful at 375px, 768px, and desktop widths.
- Keyboard focus, labels, contrast, reduced motion, and live status updates are present.
- Lint, typecheck, tests, and production build pass.
