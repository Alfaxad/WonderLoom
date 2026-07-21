# WonderLoom Research Reports

This folder contains 26 serial reports: 13 research-paper analyses, seven requested open-source repository studies, and six analyses of official OpenAI developer guides. The repository reviews include source-level architecture and workflow tracing, security/privacy/child-safety analysis, reproducibility checks, and concrete implications for the broader CreativeOS exploration that produced WonderLoom. The documentation reports distinguish official mechanisms from the product architecture WonderLoom adds around them.

## Coverage

This folder contains one comprehensive analytical report for every PDF currently present in [`../research`](../research). The corpus was processed serially in the numbered order below; the later-added `MM-StoryAgent.pdf` was handled as paper 13.

- **PDFs covered:** 13 of 13
- **Source pages read:** 226
- **Extracted source text inspected:** approximately 148,614 words
- **Report body output:** approximately 44,694 words, excluding this index
- **Repository audit:** completed for every paper
- **Verified first-party repositories found and cloned:** 1
- **Directly requested repositories cloned and reviewed:** 7
- **Official OpenAI developer guides covered:** 6
- **Complete report body:** 107,917 words across 26 reports, excluding this index

Each report covers bibliographic context, research question, conceptual or system design, method, participants/data, measures, findings, limitations, critical appraisal, safety/ethics, reproducibility, implications for CreativeOS, and open-source repository status. The reports deliberately distinguish what a paper’s evidence establishes from what its authors propose or infer.

## Paper-to-report index

| # | Source PDF | Report | Evidence type | Repository result |
|---:|---|---|---|---|
| 1 | [`Child-AI Co-Creation.pdf`](<../research/Child-AI Co-Creation.pdf>) | [`01-child-ai-co-creation.md`](01-child-ai-co-creation.md) | Research-landscape review and six design considerations | No verified first-party source repository |
| 2 | [`Child–Computer Interaction.pdf`](<../research/Child–Computer Interaction.pdf>) | [`02-child-computer-interaction-methods-review.md`](02-child-computer-interaction-methods-review.md) | Systematic review of 272 empirical CCI papers | No verified first-party source repository; publisher supplement is not code |
| 3 | [`Colin.pdf`](../research/Colin.pdf) | [`03-colin.md`](03-colin.md) | Multimodal child-storytelling system and user study | No verified first-party source repository |
| 4 | [`Designing Safe and Engaging AI Experiences for Children.pdf`](<../research/Designing Safe and Engaging AI Experiences for Children.pdf>) | [`04-designing-safe-and-engaging-ai-experiences-for-children.md`](04-designing-safe-and-engaging-ai-experiences-for-children.md) | Conceptual workshop/best-practices paper | No verified first-party source repository |
| 5 | [`Interactive Storytelling for Children.pdf`](<../research/Interactive Storytelling for Children.pdf>) | [`05-interactive-storytelling-for-children-ethical-conversational-ai.md`](05-interactive-storytelling-for-children-ethical-conversational-ai.md) | Ethical conversational-AI design case study | No verified first-party source repository |
| 6 | [`Once Upon an AI.pdf`](<../research/Once Upon an AI.pdf>) | [`06-once-upon-an-ai-six-scaffolds.md`](06-once-upon-an-ai-six-scaffolds.md) | Conceptual child–AI scaffolding framework | No verified first-party source repository |
| 7 | [`StoryBuddy.pdf`](../research/StoryBuddy.pdf) | [`07-storybuddy.md`](07-storybuddy.md) | Parent–child–AI storytelling system and study | No first-party project repository; cited chatbot dependency was not treated as project source |
| 8 | [`StoryPrompt.pdf`](../research/StoryPrompt.pdf) | [`08-storyprompt.md`](08-storyprompt.md) | Elementary-child co-design and deployed storytelling-system study | No verified first-party source repository; figure assets are not code |
| 9 | [`TaleBot.pdf`](../research/TaleBot.pdf) | [`09-talebot.md`](09-talebot.md) | Tangible AI storytelling and resilience-focused child study | No verified first-party source repository |
| 10 | [`ccs.pdf`](../research/ccs.pdf) | [`10-childrens-narrative-participation-ai-vs-human.md`](10-childrens-narrative-participation-ai-vs-human.md) | Controlled AI-versus-human story co-creation study | No verified first-party source repository |
| 11 | [`tinkertales.pdf`](../research/tinkertales.pdf) | [`11-tinker-tales-framework.md`](11-tinker-tales-framework.md) | Tangible system prototype with model-simulated evaluation | No verified first-party source repository; demo videos only |
| 12 | [`tinkertalesv2.pdf`](../research/tinkertalesv2.pdf) | [`12-tinker-tales-tangible-dialogue-system.md`](12-tinker-tales-tangible-dialogue-system.md) | Revised tangible dialogue system with a 10-child home study | No verified first-party source repository |
| 13 | [`MM-StoryAgent.pdf`](../research/MM-StoryAgent.pdf) | [`13-mm-storyagent.md`](13-mm-storyagent.md) | Multi-agent multimodal generation system with automatic and adult evaluation | Official Apache-2.0 repository: [`X-PLUG/MM_StoryAgent`](https://github.com/X-PLUG/MM_StoryAgent) |

## Cross-corpus orientation

The papers fall into four broad groups:

1. **Field and design guidance:** papers 1, 2, 4, and 6 synthesize research or propose principles.
2. **Interactive child/parent storytelling systems:** papers 3, 5, 7, 8, 9, 10, and 12 contribute empirical observations involving people, with substantial differences in sample, method, and evidentiary strength.
3. **Prototype/synthetic evaluation:** paper 11 presents a tangible pipeline but tests it with an LLM role-playing children.
4. **Automated media production:** paper 13 generates complete storybook videos and evaluates output quality without a child study.

Across the corpus, the most credible recurring design lesson is to bound the AI’s role, scaffold specific child contributions, preserve visible child agency, support correction, and involve caregivers transparently. The most common evidence gap is the leap from attractive generated output or short-term participation to claims about creativity, narrative development, resilience, social-emotional learning, AI literacy, or safety.

## Requested repository analyses

Seven repositories supplied directly for review were cloned and studied in the requested order. These reports contain 39,001 words.

| # | Repository | Report | Implementation type | Key validation |
|---:|---|---|---|---|
| 14 | [`The-Reading-Club/reading-club-ai`](https://github.com/The-Reading-Club/reading-club-ai) | [`14-reading-club-ai-repository.md`](14-reading-club-ai-repository.md) | Full-stack collaborative reading/writing platform with two overlapping persistence architectures | Dependency install, production build, lint, tests, route/runtime and secret/configuration review |
| 15 | [`Johnxjp/ai-collaborative-storyteller`](https://github.com/Johnxjp/ai-collaborative-storyteller) | [`15-ai-collaborative-storyteller-repository.md`](15-ai-collaborative-storyteller-repository.md) | Voice-led collaborative storytelling and generated-image prototype | Frontend/backend install, build, lint, compile/import, API and credential-boundary review |
| 16 | [`COS301-SE-2023/AI-Generated-Children-s-Stories`](https://github.com/COS301-SE-2023/AI-Generated-Children-s-Stories) | [`16-ai-generated-childrens-stories-repository.md`](16-ai-generated-childrens-stories-repository.md) | JavaFX editorial workstation, Spring publication API, and Flutter child reader | Shallow current-tree clone after full history pack failures; cross-application build/config, binary-secret, API, and mobile review |
| 17 | [`yashwanth-3000/dream`](https://github.com/yashwanth-3000/dream) | [`17-dream-repository.md`](17-dream-repository.md) | Next.js creative-learning workspace with MAF/CrewAI/A2A specialist services | Frontend build/lint/audit, Python installs/tests/compile/import, service smoke tests, persistence and cost-concurrency analysis |
| 18 | [`alexandengstrom/fairytales`](https://github.com/alexandengstrom/fairytales) | [`18-fairytales-repository.md`](18-fairytales-repository.md) | Native Android character-to-bedtime-story application | Isolated Java 17/Android SDK build, unit tasks, debug APK assembly, merged-manifest inspection, and full Android Lint classification |
| 19 | [`openai/openai-realtime-agents`](https://github.com/openai/openai-realtime-agents) | [`19-openai-realtime-agents-repository.md`](19-openai-realtime-agents-repository.md) | Next.js reference application for browser Realtime voice agents, scenarios, guardrails, handoffs, and simulated transport | Frozen install, production build, lint/type checks, source-level client/server trust-boundary trace, scenario tests, and configuration/security analysis |
| 20 | [`openai/openai-agents-js`](https://github.com/openai/openai-agents-js) | [`20-openai-agents-js-repository.md`](20-openai-agents-js-repository.md) | TypeScript monorepo for OpenAI agent orchestration across Responses, Realtime, extensions, transports, and provider adapters | Frozen install, package build, lint, example type checks, comprehensive tests/coverage, documentation build, and deep runtime/control-flow analysis |

## Official OpenAI developer-guide analyses

Six official guides were read and analyzed serially on July 16, 2026. These reports contain 24,222 words. Model names, limits, prices, policy language, endpoint behavior, and SDK surfaces are time-sensitive snapshots; production work should recheck the live official pages.

| # | Official guide | Report | Main coverage |
|---:|---|---|---|
| 21 | [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) | [`21-openai-voice-agents-guide.md`](21-openai-voice-agents-guide.md) | Speech-to-speech versus chained architectures, transports, SDK choice, tools, safety, latency, and CreativeOS voice design |
| 22 | [Realtime models prompting](https://developers.openai.com/api/docs/guides/realtime-models-prompting) | [`22-openai-realtime-models-prompting-guide.md`](22-openai-realtime-models-prompting-guide.md) | Prompt structure, phases, tools, language/audio behavior, long sessions, state updates, evaluation, and child-facing constraints |
| 23 | [Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) | [`23-openai-realtime-webrtc-guide.md`](23-openai-realtime-webrtc-guide.md) | SDP, media/data channels, unified and ephemeral-token flows, credential boundaries, lifecycle, and production hardening |
| 24 | [Image generation](https://developers.openai.com/api/docs/guides/image-generation) | [`24-openai-image-generation-guide.md`](24-openai-image-generation-guide.md) | Image versus Responses APIs, generation/editing, multi-turn lineage, masks/references, streaming, output controls, moderation, and asset operations |
| 25 | [Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | [`25-openai-structured-outputs-guide.md`](25-openai-structured-outputs-guide.md) | Function calling versus structured text, SDK parsing, JSON Schema subset and limits, refusals/incomplete states, streaming, JSON mode, and typed application boundaries |
| 26 | [Under 18 API Guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance) | [`26-openai-under-18-api-guidance.md`](26-openai-under-18-api-guidance.md) | Regulatory/safety standards, consent and age design, Zero Data Retention, child-specific safeguards, escalation, multimodal risks, auditing, and CreativeOS rollout gates |

## Reviewed repository sources

The eight source repositories are not vendored into WonderLoom. Their exact reviewed commits, licenses, validation steps, and public source links are preserved in [`repository-sources.md`](repository-sources.md). Each paper report separately explains why linked demos, supplements, assets, or third-party dependencies were or were not treated as official paper source code.
