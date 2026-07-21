# WonderLoom Documentation

This directory describes WonderLoom as both a product experiment and a
local-first software system with an optional private-storage Vercel runtime. The documents separate the intended child experience from the
technical mechanisms, evidence base, safety boundaries, and verification work
behind it.

Local development keeps generated stories and media on the machine running the
application. The Vercel adapter keeps them in private Blob storage. Neither
runtime commits them to Git.

## Start here

### Product and design

- [`Wonderloom_Product_Experience_and_Technical_Spec.md`](Wonderloom_Product_Experience_and_Technical_Spec.md)
  is the source product specification: audience, agency contract, experience,
  system behavior, models, and acceptance criteria.
- [`../brand.md`](../brand.md) defines the fox identity, typography, palette,
  paper-cut material language, components, and motion principles.
- [`animation-review.md`](animation-review.md) records the motion review and the
  reduced-motion behavior.
- [`build-brief.md`](build-brief.md) captures the implementation brief used for
  the build-week prototype.

### Engineering

- [`architecture.md`](architecture.md) explains component boundaries, state,
  routes, model calls, storage, trust boundaries, and recovery behavior.
- [`local-development.md`](local-development.md) is the complete installation,
  runtime, test, reset, and troubleshooting guide.
- [`progressive-image-pipeline.md`](progressive-image-pipeline.md) documents the
  streamed sketch-to-final illustration experience and stale-job protection.
- [`story-archive.md`](story-archive.md) defines when a book is complete enough
  to save and which generation records accompany it.

### Research, safety, and evaluation

- [`research-to-product.md`](research-to-product.md) maps findings from the
  papers, source repositories, and OpenAI guides to concrete product choices.
- [`safety-and-privacy.md`](safety-and-privacy.md) distinguishes implemented
  safeguards from prototype limitations and lists production gates.
- [`verification.md`](verification.md) records the tests and manual product
  checks performed during development.
- [`../research/README.md`](../research/README.md) indexes the 13 source PDFs.
- [`../reports/README.md`](../reports/README.md) indexes all 26 research,
  repository, and official-documentation reports.

## Canonical source of truth

The TypeScript types in [`../src/lib/types.ts`](../src/lib/types.ts) and state
transitions in [`../src/lib/story-state.ts`](../src/lib/story-state.ts) are the
executable source of truth. Documentation describes those contracts but does
not supersede them.

Runtime data is deliberately absent from the repository:

- `data/wonderloom/` contains completed session JSON in local development.
- `public/generated/` contains generated illustrations, partials, and audio.
- `.env.local` contains the developer's server-side OpenAI credential.

All three paths are ignored by Git.
