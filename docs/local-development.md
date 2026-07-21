# Local Development

WonderLoom is local-first. No remote deployment or cloud storage is required
for local development; the private Blob adapter activates only when both the
Vercel runtime marker and its connected storage token are present.

## Prerequisites

- Node.js 20.9 or newer (Node.js 22 LTS is recommended)
- npm 10 or newer
- A modern Chromium, Firefox, or Safari browser
- An OpenAI API key with access to the models listed in
  [`architecture.md`](architecture.md#model-responsibilities)

Image generation, Realtime voice, moderation, and narration are billable OpenAI
API operations. Use a project with appropriate spend limits while developing.

## Install and configure

```bash
git clone https://github.com/Alfaxad/WonderLoom.git
cd WonderLoom
npm install
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder:

```dotenv
OPENAI_API_KEY=your-server-side-openai-key
```

Do not use a `NEXT_PUBLIC_` variable for this credential. The application keeps
the permanent key on the server and sends only a short-lived Realtime client
credential to the browser.

## Start the application

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). A normal first-run check is:

1. Open the welcome screen and select **Begin imagining**.
2. Complete the adult setup.
3. Type a small idea and confirm that the guide responds.
4. Allow an illustration time to progress from sketch to final.
5. If voice is enabled, grant microphone permission and start the guide.

The typed experience remains usable when microphone access is declined.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Produce a production Next.js build |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | Validate TypeScript without emitting files |
| `npm run lint` | Run ESLint across the repository |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest interactively |
| `npm run test:e2e` | Run Playwright browser journeys |
| `WONDERLOOM_BASE_URL=https://example.vercel.app npm run test:deployment` | Run the billable disposable deployment acceptance journey |

Install Playwright's browser once if needed:

```bash
npx playwright install chromium
```

## Local files and reset behavior

WonderLoom writes runtime data to two ignored locations:

- `data/wonderloom/` — JSON for explicitly completed stories
- `public/generated/` — generated image frames, final images, and narration

To start with an empty local library, stop the server and remove both generated
directories. They will be recreated as needed. This permanently removes the
local stories and media, so copy anything you want to keep first.

Unfinished stories are held in process memory and intentionally disappear when
the development server stops. This prevents abandoned drafts from appearing in
the finished-story library.

## Browser and media notes

- Microphone access works on `localhost` and `127.0.0.1` because browsers treat
  them as secure local contexts.
- If voice is blocked, inspect the browser's site permissions, then reload.
- Headphones reduce echo during Realtime conversations.
- Image generation is not instantaneous. The canvas should show its warming,
  sketch, color, and detail stages while text and voice remain available.
- Narration is generated on first use and then reused when the source text has
  not changed.

## Troubleshooting

### “Voice is not configured for this server”

Confirm that `.env.local` contains `OPENAI_API_KEY`, restart `npm run dev`, and
check the server terminal for the underlying OpenAI response. Never paste the
credential into browser code or a public issue.

### The Creative Guide cannot complete a step

Check the terminal for a model-access, billing, moderation, schema, or network
error. The UI intentionally gives a child-safe message while the server retains
the diagnostic detail.

### The picture pauses

The story text is still canonical. Retry from the canvas. If the request was
superseded by a newer idea, a stale result is discarded intentionally. Check
that `public/generated/` is writable and that the API project can use
`gpt-image-2`.

### A completed book is missing from the library

The archive accepts only an explicitly finalized book with a confirmed title
and exactly three ready pages. Return to the studio, complete any missing page
or title step, and finish the book.

### Port 3000 is busy

Start Next.js on another local port:

```bash
npm run dev -- --port 3001
```

### Build or dependency state looks stale

Stop the server, remove `.next`, reinstall dependencies if needed, and rerun the
static checks. `.next` is generated and ignored by Git.

## Responsible local testing

Use fictional content, supervise child testing, and avoid entering names,
contact details, locations, school information, or other personal information.
The prototype includes safeguards but is not a substitute for a complete child
safety, privacy, consent, and compliance program. Review
[`safety-and-privacy.md`](safety-and-privacy.md) before testing with children.
