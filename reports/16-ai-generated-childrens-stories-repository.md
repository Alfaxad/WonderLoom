# AI-Generated Children's Stories Repository Analysis

## Report scope

This report analyzes the current source tree of [`COS301-SE-2023/AI-Generated-Children-s-Stories`](https://github.com/COS301-SE-2023/AI-Generated-Children-s-Stories) at the reviewed commit. The review covers all three applications in the repository: the JavaFX story-authoring workstation, Spring Boot publication API, and Flutter reading app. It traces the complete generation and reading workflows; inspects data, authentication, external-service, deployment, testing, privacy, child-safety, and educational-design choices; and distinguishes demonstrated behavior from incomplete or unreproducible behavior.

The upstream repository was unusually expensive to clone because its history contains large binary artifacts. Two full-clone attempts failed during Git pack transfer. The reviewed checkout is therefore a successful `--depth 1` clone of `main`: it contains the complete current tree and exact current commit, but not enough history to make historical authorship, commit-count, or secret-removal claims.

## Repository record

- **Upstream:** [`COS301-SE-2023/AI-Generated-Children-s-Stories`](https://github.com/COS301-SE-2023/AI-Generated-Children-s-Stories)
- **Reviewed source:** [`COS301-SE-2023/AI-Generated-Children-s-Stories`](https://github.com/COS301-SE-2023/AI-Generated-Children-s-Stories/tree/a96761b323305f311699d5d112377e729a095c03)
- **Reviewed branch:** `main`
- **Reviewed commit:** `a96761b323305f311699d5d112377e729a095c03`
- **Reviewed commit date:** October 27, 2023
- **Clone depth:** One commit, after two full-history transfers failed on the large pack
- **License:** No repository-level license or code license was found. Bundled fonts have their own licenses, but those do not license the application code or assets.
- **Tracked files:** 309
- **Source size:** Approximately 7,623 lines of Java, Dart, and SQL, including 114 test lines. The three main application trees contain approximately 2,506 Java/FXML lines in the desktop app, 1,334 Java lines in the backend, and 4,623 Dart lines in the mobile app.
- **Primary stack:** JavaFX, OpenAI Chat Completions, unofficial Midjourney-via-Discord automation, OkHttp, Spring Boot 3.1.2, Java 17, JPA, MySQL, Firebase Admin, Flutter, Firebase Auth, Google Sign-In, secure local storage, HTTP, and device text-to-speech
- **Tracked release artifacts:** Two backend JARs of approximately 84.3 MB each, in addition to Maven's wrapper JAR
- **Automated tests:** Four small test files across all three applications; coverage is model-getter and context-smoke level rather than behavioral

## Executive summary

AI-Generated Children's Stories is a 2023 student capstone that separates story production from story consumption. An administrator uses a desktop authoring tool to enter an idea and target age, generate and edit prose with GPT-3.5 Turbo, generate and select images through Midjourney's Discord interface, approve a title, cover, trailer, and every illustrated page, and publish the resulting story to a backend. Children use a separate mobile app to browse the curated catalog, like stories, resume reading, and listen to device text-to-speech with word highlighting. This separation is the repository's strongest product and safety decision: a child is never placed directly in front of an unconstrained generative model, and a human can reject or rewrite every generated artifact before publication.

The authoring workflow is far more complete than a one-shot “make me a book” prompt. It deliberately decomposes generation into story, character description, cover/trailer moment, title, per-paragraph image prompts, and individual page images. Each major output has an edit, regenerate, or accept gate. The fixed image seed and repeated character reference attempt visual continuity. The reader likewise contains several thoughtful literacy-experience elements: visual story cards, progress, a distraction-light portrait reader, text-to-speech, per-word highlighting, encouragement, likes, and a gentle prompt to ask an adult for help signing in.

The implementation is not production-ready or reproducible from a clean source checkout. Essential source configuration is absent: the desktop `config.json`, backend database and Firebase configuration, Flutter `firebase_options.dart`, and Android `google-services.json` are not tracked. No setup template explains their schemas or provisioning. The mobile repository has no tracked `pubspec.lock`. The authoring app depends on hard-coded and unofficial Discord/Midjourney request details, including command identifiers, cookies, and raw user/bot authorization. It performs long network calls and polling synchronously on the JavaFX UI thread. Provider failure can freeze or crash the workflow, and published image URLs appear to remain Discord CDN links rather than durable assets owned by the platform.

The most urgent finding is credential exposure in both tracked backend JARs. Inspection of archive entry names and configuration-field presence—without reproducing values—confirmed that each binary contains a Firebase service-account JSON with a private key and a Spring configuration file with nonempty database credentials and a Google OAuth client secret. A public Git repository must treat every embedded credential as compromised. The credentials should be revoked or rotated immediately; binaries must be removed from the current tree; and the full Git history, releases, forks, build caches, and deployment logs must be audited and rewritten where appropriate. Removing only the current files would not invalidate already copied secrets.

The network and API design compounds that exposure. Both administrator publication and every mobile request use plain HTTP to `api.fullstackfox.co.za`. Firebase identity tokens, custom API tokens, reading progress, and likes can therefore transit without TLS. Several endpoints return a user's library, likes, or random recommendations solely from a numeric `userId`, with no authentication. `/logout` also accepts only a numeric ID, allowing another party to invalidate a guessed user's session. Custom bearer-equivalent tokens are stored in plaintext, placed in form parameters or JSON, and logged or handled without a central authentication boundary. This is an insecure direct object reference and privacy problem, not just incomplete hardening.

Child privacy and educational claims need substantial work. The app's policy says it is intended for children but also says it does not knowingly collect personal information from children under 13; the product uses Google/Firebase identity, stores reading histories and likes, and does not implement verified parental consent or an account-deletion route. A link advertises a right to delete that the UI and API cannot fulfill. Content is described as age-appropriate, but arbitrary age text is accepted, the GPT prompt is the only content control, and there is no independent text/image moderation, reading-level analysis, child-development rubric, cultural review, accessibility assessment, or post-publication reporting mechanism. The app is a curated illustrated reader, not yet an evidence-based literacy platform.

For CreativeOS, the repository offers a valuable structural lesson: split an AI production studio from the child-facing library and retain approval gates around every content unit. Its exact implementation should not be reused without replacing its secret management, transport, authentication, storage, provider integrations, state model, safety evaluation, and build system.

## Product and user roles

The system has two intentionally different audiences.

The **administrator/creator** operates a JavaFX desktop application. They define the initial story concept, target age, and approximate length; evaluate generated prose and image prompts; select from Midjourney grids; upscale assets; edit the title and other text; and finally publish. The desktop is effectively a guided editorial assembly line.

The **reader** uses the Flutter mobile application. They authenticate through Google/Firebase, browse the library, view a trailer/cover, open a story, read or listen page by page, save progress, like stories, and receive completion encouragement. There is no generation interface in the child-facing application.

The broad system flow is:

```mermaid
flowchart LR
    A["Administrator enters idea, age, and length"] --> G["GPT generates editable prose and metadata"]
    G --> M["Midjourney through Discord generates image grids"]
    M --> H["Administrator edits, selects, upscales, and approves"]
    H --> P["Desktop posts story and remote image URLs over HTTP"]
    P --> B["Spring Boot and MySQL catalog"]
    C["Child signs in with Google and Firebase"] --> B
    B --> L["Flutter library, likes, and progress"]
    L --> R["Portrait page reader and device TTS highlighting"]
```

This architecture creates a meaningful editorial boundary. The generated material can be reviewed before it reaches children, and generation credentials need not be present on the mobile device. That principle should survive any rewrite.

## Desktop story-authoring workflow

### 1. Story brief and length mapping

The first screen accepts a story idea, a target age, and a length slider. The prompt processor divides the slider's value by five to produce a requested paragraph count and categorizes the result into short, medium, long, or very long bands. The age is free text rather than a constrained developmental band. The default JavaFX slider behavior also appears broader than a carefully controlled book-length selector.

GPT-3.5 Turbo receives an instruction to produce a coherent, age-appropriate children's story with the requested paragraph count. The creator can edit the prose, regenerate it, accept it, or discard the flow. Human editing before any image generation is a good cost and quality gate.

### 2. Main-character extraction and image reference

The application asks GPT to extract a detailed physical description of the main character. That result becomes a Midjourney prompt. The creator can adjust the prompt, request another four-image grid, select one quadrant, and upscale it. This selected image is carried forward as a visual reference.

The implementation tries to preserve character consistency through the accepted image URL and a fixed seed of `123`. This is directionally useful, but neither a constant seed nor an external CDN reference guarantees identity, costume, palette, or setting consistency across many independently generated frames. A production pipeline needs explicit character sheets, structured attributes, model/version locking, and review criteria.

### 3. Cover or trailer image

GPT extracts a key visual moment from the story. Midjourney generates another grid from it, and the administrator again edits, regenerates, selects, and upscales. The selected result is stored as the story's trailer/cover image. This turns a long narrative into a separate merchandising/browse asset rather than reusing a random interior page.

### 4. Title

GPT proposes a title which remains editable. This is a small but important approval point because titles carry discoverability, promises about content, and potential intellectual-property or cultural issues.

### 5. Per-page prompt planning

The story is split by paragraph. GPT is asked to return a numbered image prompt for each paragraph; the creator can edit those prompts before paying for full illustration generation. This planning stage is one of the repository's strongest reusable ideas: it exposes the visual interpretation of every page before committing to a costly generation sequence.

The parser, however, assumes the model will obey a numbered-list format exactly and that prompt count will equal paragraph count. There is no schema validation or repair path. Missing, extra, or malformed items can later become index errors or associate the wrong scene with a page. Structured model output with a page ID, bounded array length, and server validation would make this robust.

### 6. Individual page illustration

Each paragraph is processed separately. Midjourney produces a four-image grid; the creator may rewrite the prompt, regenerate, choose a quadrant, upscale it, and accept that image. The resulting `Page` combines paragraph text and the selected remote URL. The repeated approval step is slower but appropriate for child-directed content.

### 7. Publication

The finished `Story`, including title, trailer URL, and pages, is serialized and posted with an administrator API token to `http://api.fullstackfox.co.za/story`. Exceptions are generally printed or swallowed; the interface can advance to a “Story Sent To Database” screen without demonstrating that the backend persisted the upload. There is no idempotency key, draft save, resumable upload, asset-ingestion step, revision history, or publication status.

The source also keeps story construction in static/singleton-style state. Page collections, `currentPage`, and the expected page count are not reliably reset when starting or discarding another story. A second creation session in the same process can inherit data from the first. This should become an explicit per-story document with a lifecycle state machine and durable autosave.

## Desktop provider integration and failure behavior

`APICalls` calls OpenAI's `/v1/chat/completions` endpoint directly with hand-built JSON and uses an unofficial Discord protocol to invoke Midjourney. The application submits raw `/imagine` interactions, reads the newest channel message, constructs upscale interactions, and polls until a response appears. Command IDs, version strings, a channel ID, and Cloudflare-related cookie material are hard-coded. Bot and user authorizations come from local configuration.

This boundary is brittle for several reasons:

- it depends on Discord and Midjourney internals rather than a supported image API contract;
- channel “latest message” polling can confuse simultaneous jobs or other channel activity;
- the polling loop has no trustworthy global deadline or job correlation model;
- fixed command IDs, cookies, component structures, and API version paths can change;
- raw user-account automation may violate provider terms or trigger account controls;
- temporary Discord CDN URLs are not an owned, durable publication store; and
- provider credentials are stored locally as plaintext and entered in ordinary visible text fields.

All of this work occurs synchronously from JavaFX actions. Sixty-second HTTP timeouts and sleep-based polling block the application event thread, causing the UI to freeze. Some polling can continue indefinitely. Empty responses, timeouts, or malformed provider JSON often cascade into null dereferences or parser failures instead of producing an actionable retry screen.

The local configuration loader expects a resource named `com/fullstackfox/config.json`, absent from the repository, containing an ordered array of values for Discord application, channel, guild, session, bot and user authorization, OpenAI, and administrator credentials. The application constructs API-dependent state at startup and indexes the array directly; missing configuration can terminate startup. Settings later attempt to write secrets back into a classpath resource, which is not a reliable writable location once packaged into a JAR. Configuration should be named, validated, supplied through environment/secret storage, and kept outside artifacts.

## Spring Boot backend

### Domain model

The backend uses JPA entities for:

- `User`: Firebase UID, custom API token, and relationships to progress and likes;
- `Story`: title, trailer URL, pages, progress, and likes;
- `Page`: image URL, text, and parent story;
- `Progress`: user, story, and a page number; and
- `Liked`: user and story.

An SQL script creates a `user_story_info` view by crossing every user with every story and decorating the result with liked/progress/page-count information. This can simplify library queries at small scale but grows as users multiplied by stories, even when most pairs have no activity.

There are no strong unique constraints documented for one like or one progress row per user/story. Concurrent requests can create duplicates. Page queries have no explicit ordering guarantee, which is serious for a sequential book: database return order is not a story order. Page numbers need to be modeled and constrained, not inferred from insertion.

At startup, the application creates a synthetic `admin` user with a random API token if one does not exist. That token is the publication credential. There is no role model, rotation UI, audit log, scoped permission, or multiple-editor workflow.

### API surface

The API exposes:

- `POST /authenticate` to exchange a raw Firebase ID token for a numeric user ID and newly rotated custom API token;
- `POST /logout` to null a token using only a numeric ID;
- `GET /library/{userId}` for a user's library/progress view;
- `GET /userStoryInfo/liked/{userId}` for liked stories;
- `GET /userStoryInfo/random/{userId}` for a personalized/random selection;
- `GET /story/{id}` and `GET /pages/{storyId}` for story content;
- `POST` and `DELETE /liked/stories` for likes;
- `POST /progress` and `DELETE /deleteProgress` for progress; and
- `POST /story` for administrator publication.

The authentication controller verifies Firebase's ID token, finds or creates the user, rotates the user's custom API token on every login, and returns it. The remaining authenticated operations manually compare IDs and token strings. There is no Spring Security filter, request principal, reusable authorization policy, token expiry, refresh/revocation model, hashed token storage, or device/session record.

Manual authentication creates inconsistent holes. Library, liked, and random endpoints accept a numeric user ID without a token, exposing reading history and preferences through guessable identifiers. Logout needs no token, so one user can invalidate another. After logout, code that calls `user.getApiToken().equals(apiToken)` can dereference `null`. Missing users and other invalid inputs often become server errors instead of controlled 4xx responses.

Progress accepts a caller-provided page number without verifying that the page belongs to the story or is in range. Likes and progress lack robust transactional/uniqueness behavior. There is no pagination, rate limiting, validation layer, central exception mapping, health/readiness endpoint, API version, or generated schema.

### Transport, logging, and token handling

The desktop and Flutter code hard-code `http://api.fullstackfox.co.za`, not HTTPS. Consequently, administrator credentials, custom API tokens, Firebase identity tokens, user IDs, likes, and reading progress can be intercepted or modified in transit on an untrusted network. Some token-bearing operations use request parameters/form fields, which are readily captured by access logs and monitoring systems.

Authentication code prints the raw Firebase ID token and verified UID. Tokens are stored as plaintext database values. A bearer-equivalent credential should never be written to application logs, should be transmitted only over TLS, and ideally should be hashed at rest if server-side lookup/verification permits it. Firebase authentication should produce a server-side principal on each request or be exchanged for a properly managed short-lived session.

## Critical credential exposure in tracked JARs

The repository tracks `backend-1.0-SNAPSHOT_create.jar` and `backend-1.0-SNAPSHOT_update.jar`, each approximately 84.3 MB. Archive inspection confirmed both include:

- `BOOT-INF/classes/firebase-config.json`, containing service-account fields including `private_key`, `private_key_id`, `client_email`, and `project_id`; and
- `BOOT-INF/classes/application.properties`, containing nonempty database URL/username/password and Google OAuth client ID/client secret configuration.

No credential values are reproduced in this report. Their presence in public, downloadable binaries is sufficient to classify the incident as critical. Even if a service now rejects the values, the safe response is to verify revocation rather than assume expiry.

Recommended incident sequence:

1. Revoke or rotate the Firebase service account key, database user/password, and OAuth client secret immediately.
2. Review cloud audit logs, database connections, OAuth activity, billing, and administrative events for misuse from the first possible exposure date.
3. Remove binary releases from the branch and purge the sensitive blobs and configurations from all reachable Git history and hosted releases.
4. Invalidate cached artifacts and review forks; history rewriting does not recall already cloned material.
5. Add automated secret scanning and artifact-content scanning to pull requests and release builds.
6. Build deployable JARs in CI while injecting secrets at runtime from a managed secret store; never commit environment-specific release binaries.

Because this review used a shallow checkout, it cannot establish when the files first appeared or whether other credentials exist only in older commits. A full incident investigation must inspect upstream history with an appropriate large-repository transfer strategy.

## Flutter reader experience

### Authentication and navigation

The app initializes Firebase, supports Google Sign-In, obtains a Firebase ID token, exchanges it through `/authenticate`, and stores the returned numeric ID and API token in `flutter_secure_storage`. It treats the mere presence of these values on startup as a valid session; it does not validate them with the server. The server rotates the token on each authentication, so sessions on another device can be invalidated unexpectedly.

Logout removes `id` and the key `apiKey`, but login stored the token under `api_token`. The sensitive token therefore remains in secure storage after logout, even though the ID is removed. This naming mismatch should be corrected and covered by a test.

The library offers current and available stories, liked stories, profile/legal screens, trailer/cover views, and a random selection. The code reads the stored API token for some library requests but does not send it because the corresponding backend GET endpoints require only a user ID. That mirrors rather than fixes the backend authorization flaw.

### Reader and text-to-speech

The reader shows one illustrated page at a time in portrait orientation. Device text-to-speech can read the page while the currently spoken word is highlighted in orange. This is an effective multimodal reading pattern: children can connect heard and written words without sending audio to a server. Local TTS also reduces cost and privacy exposure relative to remote narration.

Implementation details weaken the experience:

- pausing and resuming calls `speak` on the full text again while manually offsetting character positions, so a provider that restarts speech can produce incorrect or out-of-range highlighting;
- `dispose` calls `super.dispose()` before a reset method that performs `setState`, risking “setState after dispose” failures;
- the in-reader progress fraction uses page index divided by page count, so the final page remains below 100% until a separate completion screen;
- an odd number of pages can miss the midpoint encouragement condition;
- random encouragement uses `nextInt(length - 1)`, making the last message unreachable;
- a failed/empty page fetch can still leave navigation that indexes an empty list;
- remote images have no meaningful retry/error state or durable ownership; and
- page order relies on an unordered backend result.

The reader has no font-size, contrast, dyslexia-friendly font, narration-speed, voice, language, reduced-motion, screen-reader, or offline controls. A portrait lock may focus the experience but should be validated against accessibility and device-use needs.

### Android release networking defect

The debug and profile Android manifests declare `android.permission.INTERNET`; the main release manifest does not. Permissions in debug/profile overlays do not automatically make the production main manifest correct. The release Android build is therefore likely unable to reach Firebase, Google, the backend, or images. This is exactly the kind of issue a release-mode integration smoke test should catch.

## Child safety, privacy, and educational value

### Editorial safety is a strength, but not a complete system

The offline creator/child-reader split is safer than direct live generation. Administrators can edit or reject each page. However, the product has no formal review checklist, double approval, moderation service, age-band rubric, prohibited-content taxonomy, provenance record, reporting button, or recall/version mechanism. The prompt's instruction to be “age appropriate” is the only visible automated safety control.

Both text and images should be independently screened before an editor sees them and again before publication. Review should cover violence, sexual content, self-harm, hate, dangerous behavior, fear intensity, stereotypes, abusive-family contexts, PII, copyrighted characters, trademark/style imitation, and depictions of real children. High-risk content needs a defined escalation and permanent audit trail.

### Privacy-policy mismatch

The in-app privacy policy says the service is intended for children while also saying it does not knowingly collect personal information from children under 13. In practice, Google/Firebase authentication processes names, emails, and identifiers; the backend stores identity linkage, reading progress, and likes; and unauthenticated endpoints expose some of that behavioral history. A simple “ask a grown-up” sentence is not verified parental consent.

The policy refers to access/correction/deletion rights, but the application and backend expose no account-deletion workflow. Logout is not deletion. There is no retention schedule, export, consent record, caregiver dashboard, age gate, child/parent role, or provider-specific data map. Google, Firebase, hosting, database, Discord/Midjourney, and OpenAI responsibilities need accurate disclosure. The policy and terms also contain a broken internal route: a terms link points to `/privacyPolicy` while the registered route is `/privacy`.

### Educational claims

The repository's synopsis targets early/Foundation Phase literacy, but the implementation primarily delivers illustrated stories and read-aloud highlighting. It has no reading-level calculation, phonics sequence, vocabulary scaffold, comprehension questions, pronunciation feedback, skill progression, educator controls, curriculum mapping, or learning-outcome telemetry. Arbitrary age text affects only a model prompt and is not verified against vocabulary, syntax, length, fear, or developmental standards.

That does not make the reader valueless: shared reading, highlighting, narration, and motivation can support engagement. It does mean the project should be described as a story-reading experience until educational efficacy is designed and evaluated with educators, caregivers, accessibility specialists, and children.

## Reproducibility and verification

The following checks were performed on the reviewed checkout:

| Check | Result | Interpretation |
|---|---|---|
| Repository checkout | Current `main` tree cloned successfully at the recorded SHA using depth 1 | Source review is exact for the current tree; historical claims are intentionally limited |
| License search | No repository-level license found | Code and assets should not be assumed reusable merely because the repository is public |
| Secret/artifact inspection | Both tracked backend JARs contain private service/database/OAuth configuration fields | Critical credential incident; values were not reproduced |
| Desktop Maven test/package | Main Java sources compiled under Java 11; test compilation failed because dynamic JUnit `RELEASE` resolved JUnit 6.1.2 bytecode requiring Java 17 | Dependency resolution is non-reproducible and inconsistent with the declared desktop compiler level |
| Backend Maven test | Dependencies resolved, then compilation failed with `release version 17 not supported` under the available Corretto 11 runtime | Backend correctly declares Java 17; Java 17 is not installed in this review environment, so tests could not run |
| Flutter analysis/tests | Not run because Flutter and Dart are not installed | Static review still found missing generated config and likely release-network defects |
| Flutter configuration | `lib/firebase_options.dart`, Android `google-services.json`, and `pubspec.lock` absent | A clean checkout cannot resolve the committed code into the documented Firebase application without external reconstruction |
| Backend configuration | Source database and Firebase service configuration absent | Appropriate not to commit secrets, but no safe template/provisioning guide is provided |
| Docker | Docker daemon unavailable in the review environment | Container behavior was not claimed as verified |
| Working tree after review | Generated Maven targets removed; tracked checkout clean | Research did not alter upstream source |

The desktop POM uses JavaFX 19 for some modules but also explicitly includes JavaFX 17 early-access platform-specific artifacts, OkHttp 5 alpha, a dynamic JUnit version of `RELEASE`, both JUnit 4 and 5 annotations, and an unversioned shade plugin. `StoryTest` mixes JUnit 4 setup with JUnit 5 tests, while no Vintage engine is clearly configured for JUnit 4 execution. The CI runs desktop packaging with JDK 17, despite the desktop compiler declaring release 11, and never builds or tests the Spring backend. The Flutter CI runs `flutter pub get` and `flutter test` but its step name says “analyze” without actually running `flutter analyze`.

The test suite itself is minimal: desktop tests largely verify model getters/static state; backend testing is only a Spring context load that depends on real configuration; Flutter has one small model-oriented test. There are no tests for story orchestration, malformed AI output, image-job correlation, API authorization, IDORs, token lifecycle, page ordering, progress validation, TTS lifecycle, release networking, or privacy deletion.

## Maintainability and operational risks

The repository's conceptual separation is clear, but responsibilities inside each app are tightly coupled. JavaFX controllers trigger providers, parse model output, mutate global story state, and navigate screens. Backend controllers manually authenticate and manipulate persistence. Flutter widgets combine network, secure storage, global state, navigation, and UI lifecycle. Provider and API clients lack interfaces that would allow deterministic fakes.

Operationally, there is no observability design, structured error contract, job queue, durable authoring draft, asset storage, CDN lifecycle, migration strategy, backup/restore documentation, environment matrix, or deployment guide. The two binary JARs are snapshots rather than trustworthy releases, and their build date may not match the reviewed October source. External HTTP hosts and Discord resources may no longer exist.

The repository also lacks a root architectural README detailed enough to reproduce all services. The Flutter README is largely default framework boilerplate. A maintainer must infer environment variables, Firebase applications, database schema, OAuth settings, administrative bootstrap, provider accounts, and release sequence from code.

## What CreativeOS should retain

1. **Separate production and consumption.** Build an authenticated editorial studio that publishes immutable, reviewed versions to a child-safe library.
2. **Decompose the book pipeline.** Treat brief, manuscript, character sheet, visual plan, cover, page copy, page art, metadata, and publication as distinct artifacts.
3. **Place approval gates before expensive or public transitions.** Manuscript approval before images and per-page approval before publication are sensible controls.
4. **Show planned prompts and associations.** Let editors see exactly which visual specification belongs to which page.
5. **Use multimodal reading support.** Device narration with word highlighting is an accessible, privacy-conscious starting point.
6. **Make progress and likes secondary to reading.** The mobile navigation stays focused on choosing and completing stories.

## What CreativeOS should replace

1. **Replace unofficial Discord automation with a supported, versioned image API** and a queued job model with idempotency, correlation IDs, bounded retries, cancellation, and budgets.
2. **Replace model-formatted numbered text with typed structured outputs** validated against page IDs and schemas.
3. **Replace static process state with durable versioned project documents** and autosaved state-machine transitions.
4. **Ingest every accepted asset into owned storage** with immutable provenance, checksums, moderation results, lifecycle rules, and access control.
5. **Use TLS everywhere and centralize authentication/authorization.** Derive user identity from verified tokens, never caller-supplied numeric IDs.
6. **Adopt managed secret storage and automated scanning.** No credentials or environment-specific binaries belong in Git.
7. **Create a real child-privacy model** with verified caregiver consent, data minimization, retention, export, deletion, provider disclosures, and jurisdiction-specific review.
8. **Make safety a publish requirement** through independent text/image classifiers, human rubrics, audit logs, escalation, and post-publication reporting/recall.
9. **Define educational bands and evaluation.** Reading level, vocabulary, phonics, comprehension, localization, cultural review, and accessibility should be explicit metadata and testable constraints.
10. **Test real release paths.** CI should pin toolchains, lock dependencies, build every application, run static analysis and security scanning, exercise API authorization, and smoke-test Android/iOS release configurations.

## Recommended remediation order for this repository

### Immediate incident response

- revoke/rotate every credential embedded in both JARs;
- audit cloud, database, OAuth, and billing activity;
- remove and purge sensitive binaries/history/releases;
- place the backend and any reachable database behind TLS and restrict access; and
- disable or repair endpoints that expose user-specific data or unauthenticated logout.

### Before any further child use

- implement verified authentication for every user-specific operation;
- correct logout/token deletion and stop logging identity tokens;
- deliver account deletion, retention, and caregiver consent flows;
- introduce independent content moderation and a formal editorial checklist;
- migrate accepted images away from Discord URLs into controlled storage; and
- fix Android release Internet permission and page-order/progress validation.

### Before continued development

- publish non-secret configuration templates and setup/deployment documentation;
- pin JDK, JavaFX, Maven plugins, JUnit, Flutter, and Dart dependencies;
- commit an appropriate Flutter lockfile for the application;
- move network operations off the JavaFX event thread;
- replace global story state and brittle AI parsers;
- add deterministic provider fakes and API integration/security tests; and
- add a repository license only after the maintainers determine rights to all code, fonts, images, and generated assets.

## Bottom line

AI-Generated Children's Stories demonstrates a genuinely useful product architecture: AI assists an adult editorial workflow, while children receive only reviewed books in a purpose-built reader. Its staged authoring pipeline and read-aloud highlighting are stronger ideas than its age suggests.

The current repository must nevertheless be treated as a learning prototype, not deployable reference code. Critical credentials are embedded in public binaries; sensitive API traffic uses HTTP; user-specific endpoints lack authorization; required configuration is absent; provider integration is unofficial and brittle; tests are negligible; and the privacy and educational claims exceed the implemented controls. CreativeOS should borrow the editorial separation and artifact workflow, then rebuild the surrounding security, provider, storage, safety, privacy, and reproducibility foundations.
