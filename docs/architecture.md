# WonderLoom Architecture

## Purpose and system boundary

WonderLoom is a local-first Next.js web application for child-led, multimodal
story creation. Its architecture is designed around one invariant: model output
may assist, reflect, arrange, illustrate, or narrate, but it may not silently
replace the child's canonical decisions.

The browser hosts the creative interface and Realtime media connection. Next.js
route handlers own OpenAI credentials, validate requests, apply safety checks,
and mutate canonical state. Local development uses memory and ignored disk
paths. A Vercel deployment switches to a private Blob adapter so sessions and
generated media survive serverless instance changes without making storage
URLs public. There is no account service, analytics service, or child profile.

## Component map

```mermaid
flowchart TB
    subgraph Browser
      Setup["Adult setup"]
      Studio["Studio and living canvas"]
      Guide["Realtime guide over WebRTC"]
      Book["Editable storybook"]
      Library["Finished-story library"]
    end

    subgraph Next["Next.js application server"]
      API["Validated route handlers"]
      Safety["PII patterns and moderation"]
      Planner["Structured story planner"]
      Canon["Canonical WonderSession"]
      Visual["Progressive image director"]
      Speech["Narration service"]
      Store["Runtime-selected private storage"]
    end

    subgraph OpenAI
      Text["gpt-5.6-luna"]
      Realtime["gpt-realtime-2.1-mini"]
      Images["gpt-image-2"]
      TTS["gpt-4o-mini-tts / Coral"]
      Moderation["omni-moderation-latest"]
    end

    Setup --> Studio
    Studio --> API
    API --> Safety --> Moderation
    API --> Planner --> Text
    Planner --> Canon
    Studio --> Guide --> Realtime
    Guide -->|typed tools| API
    Canon --> Visual --> Images
    Canon --> Speech --> TTS
    Canon --> Book --> Store --> Library
```

## Canonical state and invariants

`WonderSession` combines setup preferences, `StoryState`, bounded undo history,
generation records, timestamps, a non-identifying safety identifier, and an
explicit `completedAt` value. `StoryState` contains the child's story facts,
contributions, guide question and optional suggestions, three pages, current
illustration state, and independent story/image revision counters.

The phase machine is:

```text
seed → reveal → edit → transform → pages → finished
```

The important invariants are:

1. Contributions retain author, kind, timestamp, acceptance, and text.
2. Suggestions are not story facts until accepted or rewritten.
3. Mutations are narrow typed patches; a model cannot replace the session.
4. History is captured before meaningful edits, enabling bounded undo.
5. Image work carries a job revision; stale work cannot overwrite newer ideas.
6. Page composition creates exactly three child-editable pages.
7. The title is child-confirmed rather than assigned by the model.
8. Persistence requires three ready pages, a confirmed non-placeholder title,
   the `finished` phase, and explicit finalization.

## Request flows

### 1. Session setup

The browser submits age band, reading mode, voice preference, and adult
confirmation to `POST /api/session`. The server validates the payload, creates a
random session ID and a stable hashed safety identifier, and returns the initial
session. Locally, active drafts live in process memory. On Vercel, they are
stored privately for cross-invocation continuity and expire logically after 24
hours. In either mode, an unfinished story never appears in the library.

### 2. Typed creative turn

`POST /api/session/:id/turn` validates the contribution, performs deterministic
private-information and immediate-danger checks, calls OpenAI moderation, then
requests a structured plan from `gpt-5.6-luna`. The plan contains a reflection,
one question, optional sparks, a narrow state patch, a next phase, and a visual
intent. Zod validates the model result before the server applies it.

The route records the child or adult contribution separately from the guide's
reflection. If visual work is justified, the response tells the client to begin
that slower task without blocking the conversational loop.

### 3. Realtime voice interaction

`POST /api/realtime/session` mints a short-lived browser credential for
`gpt-realtime-2.1-mini` with the `marin` conversational voice and
`gpt-4o-mini-transcribe` input transcription. The permanent API key never
enters the browser. The browser connects to OpenAI using WebRTC and exposes a
small set of typed story tools; tool calls return to the local application API,
where normal validation and state rules still apply.

The client supports connecting, listening, thinking, speaking, muted, blocked,
and off states. A compact bar visualizer uses the microphone's frequency data
when available and a restrained state animation otherwise. Voice is optional;
the typed path remains complete.

### 4. Progressive illustration

`POST /api/session/:id/visual` starts an NDJSON stream. The server increments the
visual job revision, records a generation attempt, and requests up to three
partial images followed by a final from `gpt-image-2`. For edits, it supplies the
current generated scene as a reference. Each frame is written to the selected
media adapter and emitted as a same-origin URL. Private cloud objects are read
through `/api/media/:path`; their Blob URLs and credentials never enter story
state or browser code.

The browser interprets the sequence as sketch, color, details, and final. Before
committing any frame, the server compares the job revision with the session's
current revision. A superseded job resolves as stale instead of painting an old
idea over a newer one. Errors change the visual status to a retryable blocked
state while preserving story text and decisions.

Generated images also form a scene timeline. When pages are composed, the
newest three independent visual artifacts are assigned to pages 1–3 in order;
missing later scenes reuse the newest available image. If an older interrupted
job saved progressive frames but no final event, its most detailed stored frame
remains eligible instead of discarding the child's visible scene.

### 5. Page composition, title, and finalization

`POST /api/session/:id/compose` arranges accepted story facts into three pages
using a structured model response. It does not finish the book. Page text may be
changed through the page route. The child then supplies and confirms the title
through the state route. `POST /api/session/:id/finalize` runs the completeness
gate, enters `finished`, and adds the completion timestamp. Local mode writes
the session JSON under `data/wonderloom/`; Vercel writes it to the connected
private Blob store.

Only this finalization path creates a library entry. Incomplete sessions and
abandoned drafts remain absent from the library.

### 6. Narration

`POST /api/session/:id/speech` accepts a constrained target such as the cover or
a numbered page. It hashes the source text and checks the generation log for a
matching completed asset. A cache miss calls `gpt-4o-mini-tts` with the Coral
voice and scene-sensitive instructions for energetic, sympathetic story
narration. Audio is stored through the selected media adapter and the response carries an explicit
AI-generated narration disclosure.

## API surface

| Route | Method | Responsibility |
|---|---|---|
| `/api/session` | `POST` | Create a validated local session |
| `/api/session/:id` | `GET`, `DELETE` | Read a session or remove its archive and assets |
| `/api/session/:id/turn` | `POST` | Safety-check and plan a typed creative contribution |
| `/api/session/:id/contribution` | `POST` | Record a narrow contribution from a typed tool |
| `/api/session/:id/state` | `PATCH` | Apply a validated child-directed state change, including title |
| `/api/session/:id/undo` | `POST` | Restore the previous canonical story state |
| `/api/session/:id/visual` | `POST` | Stream progressive image frames and commit the current job |
| `/api/session/:id/compose` | `POST` | Arrange accepted material into three editable pages |
| `/api/session/:id/page` | `PATCH` | Revise a single page without replacing the book |
| `/api/session/:id/finalize` | `POST` | Enforce completion and save the finished book |
| `/api/session/:id/speech` | `POST` | Generate or reuse Coral narration for a constrained target |
| `/api/realtime/session` | `POST` | Mint a short-lived Realtime browser credential |
| `/api/safety/text` | `POST` | Run reusable text safety checks |
| `/api/library` | `GET` | List summaries of completed books |
| `/api/media/:path` | `GET` | Stream private generated media through a constrained same-origin path |

## Model responsibilities

| Capability | Model | Boundary |
|---|---|---|
| Structured planning and page composition | `gpt-5.6-luna` | Returns schema-validated plans/pages, never unrestricted state |
| Live voice collaboration | `gpt-realtime-2.1-mini` | Browser WebRTC with ephemeral credentials and typed tools |
| Voice transcription | `gpt-4o-mini-transcribe` | Realtime input transcription |
| Illustration and edits | `gpt-image-2` | Progressive, revision-checked, locally persisted assets |
| Finished-book narration | `gpt-4o-mini-tts`, `coral` | Targeted, cached audio with disclosure |
| Content classification | `omni-moderation-latest` | One layer in a larger input-safety path |

Model identifiers reflect the build's configured environment and may require a
project with access to those models.

## Storage and data lifecycle

| Data | Location | Lifetime | Git status |
|---|---|---|---|
| Active draft (local) | Server process memory | Until process exit or deletion | Never tracked |
| Active draft (Vercel) | Private Blob JSON | 24-hour logical lifetime unless completed | Never tracked |
| Completed session | Local ignored JSON or private Blob JSON | Until deletion/reset | Never tracked |
| Image partials/finals | Local ignored media or private Blob objects | Until session deletion | Never tracked |
| Narration audio | Local ignored media or private Blob objects | Until session deletion | Never tracked |
| API credential | `.env.local` | Developer managed | Ignored |
| Blob credential | Vercel environment only | Deployment managed | Ignored |
| Research and documentation | Repository | Versioned | Tracked |

JSON persistence uses a write-then-rename operation so an interrupted save does
not expose a half-written book. The library revalidates stored sessions and
filters against the same completeness predicate used by finalization.

## Trust boundaries and failure behavior

- **Browser to application:** every route revalidates untrusted JSON; browser
  state is not authoritative.
- **Application to model:** schemas constrain structured output and application
  rules decide whether a patch can be applied.
- **Application to storage:** local paths remain under the generated-media root;
  remote objects use fixed prefixes, private access, constrained names, and a
  same-origin streaming route.
- **Long-running image work:** revision comparison prevents out-of-order writes.
- **Network/model errors:** story state remains available; illustration and
  narration expose retryable states rather than deleting authored work.
- **Realtime failure:** voice can disconnect without disabling typed creation.
- **Process restart:** local drafts disappear by design; Vercel drafts reload
  from private storage so a serverless instance change does not end the studio.

## Verification strategy

Vitest covers canonical transitions, completion-gated persistence, stale image
jobs, narration records, safety routing, and streamed client events. Playwright
covers the primary product journey, responsive layouts, reduced motion,
finished-story recall, and voice configuration. TypeScript, ESLint, and the
production build provide static and integration checks. See
[`verification.md`](verification.md) for the recorded validation pass.
