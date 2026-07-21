# From Research to Product Decisions

## Method

WonderLoom was preceded by a serial review of 13 research PDFs, eight relevant
source repositories, and six official OpenAI developer guides. The resulting 26
reports cover approximately 107,917 words and separate empirical evidence,
author claims, implementation observations, limitations, and product
implications.

The source PDFs are indexed in [`../research/README.md`](../research/README.md),
the complete reports in [`../reports/README.md`](../reports/README.md), and the
exact reviewed repository commits in
[`../reports/repository-sources.md`](../reports/repository-sources.md).

This was design research, not a meta-analysis. The papers vary widely: reviews,
co-design studies, short child studies, parent–child systems, conceptual
frameworks, prototype evaluations, model-simulated testing, and automated media
evaluation. A repeated idea influenced the product only when it could be turned
into a visible interaction, state invariant, safety boundary, or testable
implementation choice.

## Evidence-to-decision map

| Research lesson | WonderLoom decision | Where it appears |
|---|---|---|
| Child agency depends on who initiates, selects, changes, and rejects ideas—not merely on receiving personalized output. | Child contributions are canonical; guide sparks remain provisional; change, rejection, and undo are first-class. | Story state, contribution provenance, typed tools, idea shelf |
| Open-ended prompts can overwhelm younger creators; scaffolds should be small and removable. | The guide asks one focused question and offers at most three optional sparks. | Structured turn plan and studio layout |
| Tangible and multimodal feedback can make abstract narrative work concrete. | Voice or text updates a continuously visible illustrated canvas and later a physical-book-inspired view. | Realtime guide, living canvas, storybook |
| The AI should be correctable and its role legible. | Every accepted decision stays visible; images yield to text; generation and authorship records are inspectable. | Story thread, stale-job guard, grown-up summary |
| Children and adults need different but connected views of the same activity. | The child-facing loop stays playful while the summary exposes provenance, model stages, and data behavior. | Studio, storybook, summary modal |
| A finished artifact can support pride and revisiting, but output quality alone is not evidence of learning. | Only explicitly complete books enter a local library; the product makes no learning or developmental claim. | Finalization gate, library, safety documentation |
| Safety for children includes privacy, developmental fit, autonomy, and caregiver transparency in addition to content moderation. | Adult setup, no profile, privacy patterns, moderation, bounded model authority, local completion-gated persistence. | Setup, safety server, archive contract |
| Short studies commonly overinterpret engagement. | WonderLoom frames itself as a prototype and lists evaluation questions rather than claiming improved creativity. | README, limitations, future evaluation agenda |

## What the paper corpus contributed

The field reviews and design frameworks—especially
[`01-child-ai-co-creation.md`](../reports/01-child-ai-co-creation.md),
[`02-child-computer-interaction-methods-review.md`](../reports/02-child-computer-interaction-methods-review.md),
[`04-designing-safe-and-engaging-ai-experiences-for-children.md`](../reports/04-designing-safe-and-engaging-ai-experiences-for-children.md),
and [`06-once-upon-an-ai-six-scaffolds.md`](../reports/06-once-upon-an-ai-six-scaffolds.md)—shaped the agency contract, caregiver transparency, and the decision to treat AI literacy and privacy as interaction-design concerns.

The interactive storytelling systems—Colin, StoryBuddy, StoryPrompt, TaleBot,
the child participation comparison, and Tinker Tales—showed the practical value
of multimodal cues, focused scaffolds, correction, shared attention, and
physical or visual progress. They also exposed recurring limitations: small and
short studies, novelty effects, adult facilitation that is difficult to
separate from the system, and weak evidence for long-term outcomes.

MM-StoryAgent demonstrated a strong automated story-to-media pipeline and
character-consistency techniques. WonderLoom deliberately diverges from its
automation goal: instead of optimizing the complete generated artifact, the
system delays composition until the child has supplied enough decisions and
keeps the resulting pages editable.

## What the repository reviews contributed

| Source | Reused learning, not copied product | WonderLoom adaptation |
|---|---|---|
| Reading Club AI | Collaborative content structures and the risks of overlapping persistence models | One canonical session schema and one explicit completion gate |
| AI Collaborative Storyteller | Voice-led turn-taking and image generation as a slower side effect | Typed fallback, separated voice dock, progressive non-blocking images |
| AI-Generated Children's Stories | Separation of authoring, publishing, and reading experiences | Studio and finished-book views without a public publishing service |
| Dream | Specialist agents and concurrent creative tasks | Narrow model responsibilities without an autonomous multi-agent hierarchy |
| Fairytales | Mobile storybook presentation and simple generated-story flow | Tactile book view with continued editability and provenance |
| OpenAI Realtime Agents | WebRTC lifecycle, tools, guardrails, and client/server boundaries | Ephemeral browser credential, typed story tools, visible connection states |
| OpenAI Agents JS | Typed orchestration, tracing concepts, transport boundaries | Agents SDK Realtime client plus application-owned canonical state |
| MM-StoryAgent | Multistage media generation and visual consistency | Shared visual grammar, reference editing, generation records, revision guard |

WonderLoom does not vendor those source repositories. Reports link to the exact
reviewed commits so implementation observations remain reproducible without
copying unrelated applications into this codebase.

## What the OpenAI guides contributed

- The [voice-agent report](../reports/21-openai-voice-agents-guide.md) supported a
  speech-to-speech Realtime path for low-latency collaboration while preserving
  typed input as an equal path.
- The [Realtime prompting report](../reports/22-openai-realtime-models-prompting-guide.md)
  informed explicit role, phase, tool, interruption, and child-agency
  instructions rather than a single conversational persona paragraph.
- The [WebRTC report](../reports/23-openai-realtime-webrtc-guide.md) informed the
  permanent-key boundary and short-lived browser session credential.
- The [image-generation report](../reports/24-openai-image-generation-guide.md)
  led to progressive partial rendering, reference-based edits, and explicit
  accommodation for slower image latency.
- The [structured-outputs report](../reports/25-openai-structured-outputs-guide.md)
  led to Zod-validated turn and page contracts rather than parsing free prose.
- The [Under-18 guidance report](../reports/26-openai-under-18-api-guidance.md)
  informed data minimization, adult confirmation, safety identifiers, and the
  decision to document this as a local prototype rather than a ready public
  child service.

## What the evidence does not establish

The corpus does not establish that WonderLoom improves creativity, narrative
skill, resilience, literacy, wellbeing, or long-term agency. It does not prove
that every child prefers voice, that generated images always improve ideation,
or that a three-page structure is universally appropriate. It also does not
validate the present safeguards for unsupervised public use.

Those are evaluation questions. The current contribution is a working,
inspectable design hypothesis: a generative system can be architected so the
child repeatedly exercises authorship instead of submitting one prompt and
watching the model finish.

## Future evaluation agenda

A responsible study should combine interaction logs with observation,
child-friendly interviews, caregiver feedback, artifact analysis, and
independent safety review. Useful measures include:

- proportion and narrative importance of child-originated decisions;
- rates of suggestion acceptance, revision, rejection, and undo;
- whether children can explain what the AI contributed;
- diversity between a child's initial idea and final artifact without loss of
  ownership;
- interruption success and recovery from voice/image failures;
- frustration, cognitive load, accessibility, and age-band differences;
- personal-information attempts, unsafe-output rate, and adult escalation;
- whether children revisit, edit, retell, or extend a finished story;
- longitudinal transfer to unaided storytelling or other creative media.

Any study involving children should use age-appropriate assent, guardian
consent, data minimization, trained facilitators, and a predeclared safety and
incident protocol.
