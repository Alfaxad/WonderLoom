# Safety and Privacy

## Scope

WonderLoom is a research-informed prototype, not a certified child-safety
platform or a production compliance program. This document distinguishes what
the software currently enforces from what a public child-facing service would
still need.

The design goal is data minimization and creative agency: no child account, no
behavioral profile, no analytics integration, no raw microphone recording, and
no archive entry until a book is explicitly complete. OpenAI model requests are
still network processing and are governed by the developer's OpenAI account,
settings, terms, and applicable policies.

## Assets and threat model

The system handles story text, optional voice audio in transit, generated
images, narration audio, setup preferences, contribution provenance, and a
server-side API credential. Relevant risks include accidental disclosure of
personal information, unsafe model output, an adult or child misunderstanding
AI authorship, secret leakage, path traversal, stale asynchronous results,
incomplete drafts being presented as finished, and local users seeing another
local user's saved stories.

This build assumes a trusted person controls access to the local or temporary
hosted URL. It does not provide accounts, authentication, authorization, tenant
isolation, or a family-level access-control boundary.

## Implemented controls

### Adult setup and transparent modes

The setup requires adult confirmation and makes microphone use optional. It
states that OpenAI models respond, illustrate, and check safety. Typed creation
is a complete fallback. Narration is labeled as AI-generated, and the finished
book exposes an authorship and generation summary.

### Input privacy and safety checks

Typed contributions pass through deterministic checks for common private-data
patterns and immediate-danger language before model planning. Inputs also pass
through `omni-moderation-latest`. The server sends a stable, pseudonymous
`safety_identifier` derived from the random session ID rather than a child's
identity.

The immediate-danger branch avoids continuing the creative flow as if nothing
happened and directs the child to a trusted grown-up or emergency help. These
checks are intentionally conservative, but pattern matching and moderation can
produce both false positives and false negatives.

### Constrained model authority

Structured outputs and typed tools restrict changes to known story fields.
Application code, not the prompt, enforces completion, history, image revision,
and persistence rules. Suggestions remain marked and do not become accepted
story facts automatically. The title must be explicitly supplied and confirmed
by the child.

### Credential boundaries

The permanent OpenAI key is loaded only from the ignored `.env.local` file or a
server-side Vercel environment variable.
Realtime voice receives a short-lived client credential from a server route.
Generated assets use same-origin application paths. Cloud media and session
objects are held in a private Blob store and never exposed through raw storage
URLs. No credential or generated child data belongs in Git.

### Output and media handling

Text planning uses child-centered instructions plus schema validation. Image
requests use OpenAI moderation and a consistent age-appropriate visual grammar.
Long-running image jobs are revision checked so an old scene cannot overwrite a
new decision. Narration is generated for known story targets rather than
arbitrary text and is explicitly disclosed as synthetic speech.

### Data minimization

| Information | Collected or inferred? | Storage behavior |
|---|---|---|
| Name, email, address, school | Not requested; common patterns are blocked | Not intentionally stored |
| Child account/profile | No | None |
| Age band | Chosen by adult | Session/book only |
| Reading mode | Chosen by adult | Session/book only |
| Story contributions | Yes | Local memory for drafts; private 24-hour cloud draft continuity; completed-book storage after finalization |
| Raw microphone audio | Used for live WebRTC when enabled | Not stored by WonderLoom |
| Transcription | Used in the live interaction | Reflected only through accepted contributions |
| Generated images/audio | Yes | Ignored local media or private cloud objects |
| Analytics/advertising identifiers | No integration | None |
| Personality, emotion, ability, development | Not inferred | None |

## Creative-agency safeguards

Safety includes authorship and autonomy, not only content classification. The
interface keeps optional ideas visibly optional; asks one question at a time;
supports change, rejection, interruption, and undo; records who contributed
what; and treats the child's established words as canonical when an image or
model response disagrees.

The local library also applies a semantic boundary: an abandoned session is not
a finished story. Only a titled, three-page, explicitly finalized book is
persisted and revisitable.

## Known limitations

- There is no authentication or per-person access control. Anyone with access
  to the same local server or temporary hosted URL can see its finished shelf.
- Local JSON and media are not encrypted at rest.
- Deleting a library entry is not a forensic secure erase.
- Regex checks cannot recognize every form of identifying information.
- Moderation and prompting do not guarantee safe output.
- The prototype has no age-assurance, parental-consent record, jurisdictional
  policy engine, abuse-monitoring operation, or human escalation service.
- Realtime and model-provider data handling depends on the configured API
  project and current provider policies.
- The research corpus supports design hypotheses, not proof of developmental,
  learning, wellbeing, or long-term creativity outcomes.
- The build has not undergone an independent child-safety, privacy, penetration,
  accessibility, or legal compliance audit.

## Production gates

Before any public child-facing launch, a responsible team should at minimum:

1. Complete child-safety, privacy, accessibility, abuse, and threat-model
   reviews with qualified independent experts.
2. Establish verified parental consent and age-appropriate notices where
   required, with deletion, access, and retention controls.
3. Confirm current OpenAI Under-18 API requirements and obtain any necessary
   approvals or Zero Data Retention configuration.
4. Add authenticated tenant isolation, server-side authorization, encrypted
   storage, secret rotation, rate limits across all costly endpoints, and abuse
   monitoring.
5. Evaluate prompts, tools, images, narration, multilingual behavior, and
   adversarial inputs with child-specific test sets and human review.
6. Define incident response, trusted-adult escalation, support, audit logging,
   rollback, and provider-outage behavior.
7. Run supervised studies that measure agency, comprehension, correction,
   frustration, inclusion, and unintended influence—not only engagement.
8. Provide a plain-language deletion and export experience for families.

## Reporting a concern

Do not include API keys, child data, story contents, or generated private assets
in a public issue. Reproduce with fictional content and describe the affected
route, state, expected behavior, and observed safe summary.
