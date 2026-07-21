# Wonderloom

## Product Experience, UI/UX, and Multimodal System Specification

**Working tagline:** *Your ideas, woven into worlds.*  
**Document status:** Product and implementation brief  
**Primary platform:** Responsive web application  
**Initial use case:** Child-led, voice-first creation of a short illustrated and narrated story  
**Long-term direction:** A multimodal creative operating system for children

---

## 1. Executive Summary

Wonderloom is not an AI story generator.

It is a child-led creative environment in which artificial intelligence helps children discover, shape, express, and revise their own ideas without taking authorship away from them.

The core experience is a calm, magical, voice-first creative session. A child speaks naturally to a patient creative guide. The guide asks one focused question at a time, listens carefully, reflects the child's contribution, and turns that contribution into an immediate change on a living visual canvas. Characters appear. Settings acquire detail. Objects can be changed. Scenes unfold. A story gradually becomes readable, visible, and audible.

The child is not asked to write a sophisticated prompt. The child is not given a completed story after one sentence. The child is not placed in front of an open-ended chatbot and expected to know how to direct it.

Instead, Wonderloom provides a carefully scaffolded creative rhythm:

1. **Invite an idea.**
2. **Listen to the child.**
3. **Make the contribution visible.**
4. **Ask the next useful creative question.**
5. **Reveal, transform, or advance the world.**
6. **Let the child revise anything.**
7. **Complete a small artifact the child can genuinely call their own.**

The defining interaction principle is:

> **The AI asks, listens, organizes, writes, illustrates, and narrates—but the child decides.**

The first version of Wonderloom will be a responsive web application built with OpenAI's TypeScript SDKs and APIs:

- **OpenAI Agents SDK for TypeScript** (`@openai/agents` and `@openai/agents/realtime`)
- architectural and interface patterns derived from the **OpenAI Realtime Agents demo**
- **WebRTC** for low-latency browser audio
- **`gpt-realtime-2.1-mini`** as the live voice model
- **`gpt-5.6-luna`** as the structured story, state, and prose model
- **`gpt-image-2`** as the image generation and editing model

The application should feel like one coherent creative material rather than three disconnected AI features. Voice is the conductor. Structured story state is the shared memory. Text generation is the story craft layer. Image generation is the living visual material. The interface binds all four together.

---

## 2. Product Thesis

### 2.1 The problem with most AI storytelling products

Many AI storytelling experiences follow a simple pattern:

1. Ask the user for a premise.
2. Generate a complete story.
3. Generate one or more illustrations.
4. Present the result for passive consumption.

This can produce attractive output, but it often removes the creative work that makes storytelling valuable. The child supplies a seed; the model supplies the substance. The child becomes a requester, reviewer, or audience member rather than an author.

For adults, this can already feel creatively hollow. For children, it risks teaching the wrong mental model: that imagination means asking a machine to make something finished.

Wonderloom takes the opposite position.

The product is designed around the belief that the valuable outcome is not merely a story. The valuable outcome is the child's experience of imagining, choosing, connecting, revising, and seeing their decisions become real.

### 2.2 What Wonderloom is optimizing for

Wonderloom should optimize for:

- **agency**, not maximum automation;
- **authorship**, not output volume;
- **creative confidence**, not prompt sophistication;
- **reflection**, not endless stimulation;
- **completion**, not infinite engagement;
- **visible cause and effect**, not invisible model magic;
- **parental trust**, not parasocial attachment;
- **meaningful return**, not compulsive retention.

### 2.3 The desired final feeling

At the end of a session, the child should not primarily say:

> “The computer made me a story.”

They should say:

> “I made this story.”

The parent should be able to look at the finished book and identify where the child's imagination shaped it: the moon dragon, the yellow boots, the underwater castle, the frightened cloud, the unusual ending.

This visible authorship is the product's emotional and ethical center.

---

## 3. Vision and Scope

### 3.1 Storytelling is the wedge

The initial product is a short illustrated story creator because storytelling naturally combines:

- voice;
- imagination;
- characters;
- emotion;
- narrative structure;
- written language;
- illustration;
- narration;
- revision.

This makes storytelling an ideal first expression of a larger thesis.

### 3.2 Long-term vision

Wonderloom can eventually become a remarkably simple multimodal canvas through which children create:

- illustrated stories;
- comics;
- character worlds;
- animations;
- songs and soundscapes;
- interactive adventures;
- small games;
- puppet scenes;
- invented creatures;
- visual explanations;
- new formats that do not map neatly to adult creative software.

The long-term question is:

> **How might children use AI creatively in ways adults would never think of?**

Wonderloom should therefore be architected as a creative canvas with storytelling behavior, not as a rigid story-generation form that would need to be replaced later.

### 3.3 Build Week scope

The Build Week version should demonstrate one excellent five-minute creative loop:

- one child-led character creation;
- one visible character reveal;
- one direct visual edit;
- one completed story scene;
- one dramatic scene transformation;
- one short narrated storybook of approximately three pages;
- one clear summary of the child's contributions.

It should not attempt to prove every future modality.

---

## 4. Audience

### 4.1 Primary user

The primary user is a child creating a story through speech and direct manipulation.

For the first prototype, a practical target range is approximately **ages 6–10**, while avoiding hard claims that the experience is developmentally validated until it has been tested with children, parents, and relevant experts.

This range is useful because many children can:

- speak fluently enough to express imaginative ideas;
- understand a basic story sequence;
- read short passages with varying levels of support;
- use simple touch or pointer interactions;
- benefit from narration and visual scaffolding;
- enjoy making creative choices without needing a professional tool.

### 4.2 Secondary user

The secondary user is a parent, guardian, teacher, facilitator, or demo observer.

The secondary user needs to understand:

- what the product does;
- how the child remains the author;
- what information is stored;
- how voice and images are handled;
- what safety boundaries exist;
- when the experience ends;
- what the child created and contributed.

### 4.3 Parent-child co-use

Wonderloom should support three modes conceptually:

1. **Child-led:** the child creates while a parent is nearby.
2. **Co-creative:** parent and child make choices together.
3. **Facilitated:** a teacher, researcher, or guardian helps the child use the experience.

The Build Week implementation can focus on child-led interaction while making the interface legible to an accompanying adult.

---

## 5. Experience Principles

Every feature and interaction should be evaluated against the following principles.

### 5.1 The child supplies the meaning

The model may help with wording, pacing, and structure, but major creative facts should originate from or be confirmed by the child.

Major creative facts include:

- the protagonist;
- the protagonist's desire;
- the central problem;
- important relationships;
- the world or setting;
- meaningful visual traits;
- major actions;
- the ending.

### 5.2 One meaningful question at a time

The guide should not ask compound questions such as:

> “Who is the hero, where do they live, what do they want, and who is their friend?”

That creates cognitive load and makes the interaction feel like a form.

Instead:

> “Who should our hero be?”

Then:

> “What is one thing that makes them unlike anyone else?”

Then:

> “What do they want more than anything?”

### 5.3 Every contribution should matter

When a child says something meaningful, the product should acknowledge it through at least one of these channels:

- the guide reflects it aloud;
- a visual token appears;
- the canvas changes;
- the story state updates;
- the prose later includes it;
- the contribution is shown in the authorship summary.

A child should not repeatedly contribute ideas that disappear into an invisible context window.

### 5.4 Suggestions are invitations, not answers

When the child is unsure, the guide can offer two or three possibilities. Every suggestion set must preserve an open path:

- “A hidden door”
- “A lost friend”
- “A strange sound”
- **“Something else I imagine”**

The open path is not a small secondary link. It is a core expression of agency.

### 5.5 Revision is part of creativity

A child must be able to say:

- “No, make her brave.”
- “I changed my mind.”
- “The castle should be underwater.”
- “Take away the crown.”
- “Go back.”

Wonderloom should treat revision as healthy creative authorship, not as an error or inconvenient interruption.

### 5.6 The interface should reward attention, not capture it

The product should avoid:

- streaks;
- infinite feeds;
- manipulative urgency;
- loud reward explosions;
- randomized rewards;
- constant motion;
- unsolicited character chatter;
- prompts designed only to prolong the session.

Wonderloom should help the child complete something and then allow the session to end naturally.

### 5.7 AI should remain a tool, not a pretend friend

The guide can be warm, playful, and attentive, but should not imply emotional dependence or exclusivity.

Avoid language such as:

- “I'm your best friend.”
- “I missed you.”
- “Don't leave me.”
- “Only I understand your stories.”

Prefer a role-based identity:

- creative guide;
- story helper;
- idea weaver;
- narrator;
- studio companion in the ordinary, non-parasocial sense of a tool alongside the user.

### 5.8 Calm is a feature

The experience should feel magical without becoming overstimulating.

Magic comes from responsiveness, transformation, anticipation, and craft—not from filling every surface with particles and sound.

---

## 6. Emotional and Sensory Direction

### 6.1 Desired emotional character

Wonderloom should feel:

- magical;
- calm;
- warm;
- curious;
- handcrafted;
- patient;
- expressive;
- safe;
- spacious;
- alive, but not hyperactive.

### 6.2 What it should not feel like

It should not feel like:

- a conventional chatbot;
- a productivity dashboard;
- a loud children's game;
- a video feed;
- a slot machine;
- a worksheet;
- a form with decorative illustrations;
- a fully automated content factory;
- a synthetic television show that happens to include the child.

### 6.3 Visual metaphor: weaving

The name Wonderloom provides a useful visual and conceptual metaphor.

The child contributes threads:

- a character;
- a color;
- a wish;
- a place;
- a fear;
- an object;
- a surprising rule.

Wonderloom weaves those threads into a coherent world.

This can appear subtly in the interface through:

- thread-like connectors between idea tokens;
- a soft woven or paper texture;
- ideas settling onto the canvas as colored strands;
- a “story thread” representing progress;
- a gentle weaving animation while a scene is composed.

The metaphor should not become literal enough to constrain the interface. Wonderloom does not need to resemble a loom.

### 6.4 Motion language

Motion should communicate state and causality.

Examples:

- A child's new idea enters as a small thread or card and travels toward the canvas.
- A visual edit creates a localized shimmer around the changed object.
- A new scene unfolds like a page or a piece of paper being placed down.
- Listening is indicated by a slow, organic audio shape—not a frantic equalizer.
- Generating an image is represented by sketch marks and gradual visual formation.

Motion should be interruptible and respect reduced-motion preferences.

### 6.5 Sound language

Sound effects should be sparse and functional:

- a soft acknowledgement when an idea is captured;
- a page-settle sound when a scene completes;
- a subtle tonal cue when the microphone begins listening;
- no casino-like reward sounds;
- no constant ambient soundtrack by default.

The child's voice and the guide's voice are the primary audio experience.

---

## 7. The Core Creative Loop

The product should repeatedly move through the following loop.

### 7.1 Invite

The guide asks a focused question with enough specificity to spark imagination but enough openness to permit surprise.

Example:

> “Who should our hero be?”

### 7.2 Listen

The interface visibly enters a listening state. The child can speak naturally, pause, self-correct, or restart.

### 7.3 Reflect

The guide briefly reflects the meaningful part of the answer:

> “A tiny moon dragon.”

Reflection confirms that the system heard the child and gives the child a chance to correct it.

### 7.4 Capture

The application writes the contribution into canonical structured state and adds a visible idea object to the interface.

Examples:

- **Hero:** tiny moon dragon
- **Special detail:** enormous yellow boots
- **Home:** the quiet side of the moon

### 7.5 Respond visually

The UI responds at the appropriate level:

- a token appears immediately;
- a placeholder silhouette gains a feature;
- an existing image is edited;
- a scene is rendered;
- the next page is prepared.

Not every contribution triggers a full image generation call.

### 7.6 Continue

The guide chooses the next question based on what the story needs—not from a fixed questionnaire.

### 7.7 Compose

At a semantic checkpoint, the structured text model converts the child's accumulated choices into:

- a clean story beat;
- short polished prose;
- a narration script;
- an image render specification;
- the next unresolved creative question.

### 7.8 Revise

The child can revise any visible or narrative decision. The system updates the state, preserves unaffected details, and records a new revision.

### 7.9 Complete

After approximately three story pages, the guide helps the child choose or confirm an ending. The application presents the finished artifact and makes authorship visible.

---

## 8. Narrative Scaffolding Model

Wonderloom should support creativity without silently writing the entire plot.

### 8.1 Story phases

The initial experience can use a simple internal sequence:

1. **Meet the hero**
2. **Discover what the hero wants**
3. **Introduce a problem or surprise**
4. **Let the child choose an action**
5. **Show a consequence**
6. **Let the child choose or invent the ending**

The child should never see this as a rigid template.

### 8.2 Question types

The Creative Guide can choose among several scaffolding moves.

#### Identity questions

- “Who should our hero be?”
- “What should we call them?”
- “What is one thing that makes them unusual?”

#### Desire questions

- “What do they want more than anything?”
- “What are they trying to find?”

#### World questions

- “Where does this happen?”
- “What is strange about this place?”
- “What can happen here that cannot happen anywhere else?”

#### Emotion questions

- “How does the hero feel when they see it?”
- “What are they afraid might happen?”

#### Causal questions

- “What happens because they open the door?”
- “Who notices what they did?”

#### Choice questions

- “Should they hide, ask for help, or try something you invent?”

#### Reflection questions

- “Does that feel right, or should we change something?”

### 8.3 The guide must not over-interrogate

The purpose of questions is to create momentum, not to extract every possible attribute.

After two or three distinctive details, the system should show something. The child needs a visible reward for imagination before the interaction begins to resemble an interview.

### 8.4 Recovery when the child says “I don't know”

The guide should not respond with a large menu or repeat the same question.

A preferred recovery pattern:

1. Reduce the decision.
2. Offer two evocative options.
3. Preserve an open answer.

Example:

> “That's okay. Does the dragon want to find something, help someone, or do something completely different?”

### 8.5 Recovery when the child gives a very long answer

The guide should identify and reflect the core creative facts without flattening the child's excitement.

Example:

> “I heard three wonderful things: she lives inside a clock, she can taste music, and she's searching for her brother. Which one should we see first?”

The state layer can store all three facts while the guide focuses the next step.

---

## 9. Information Architecture and Primary Screens

### 9.1 Screen 1: Welcome

The welcome screen should be extremely simple.

Primary elements:

- Wonderloom wordmark
- tagline: *Your ideas, woven into worlds.*
- primary button: **Create a story**
- secondary parent link: **For grown-ups**
- optional small privacy statement

The page should communicate imagination and calm, not feature density.

### 9.2 Screen 2: Parent setup / session setup

For the prototype, this can be a lightweight gate rather than a full account system.

Possible controls:

- approximate age or reading level;
- narration on/off;
- child reads / Wonderloom reads / read together;
- session length: short story;
- microphone permission explanation;
- a concise disclosure that AI helps create the story;
- an explanation that the child remains in control.

Avoid collecting a child's legal name. A story character name is sufficient.

### 9.3 Screen 3: The studio

The studio is the heart of Wonderloom.

It should not look like a chat app with an image panel attached. The visual canvas is primary; conversation controls surround it.

A responsive desktop/tablet layout can contain:

#### Center: Living canvas

- current character or scene;
- progressive image generation states;
- direct-selectable objects;
- localized edit indicators;
- page navigation once multiple scenes exist.

#### Bottom: Voice dock

- large microphone/listening control;
- current status: “Listening,” “Wonderloom is thinking,” “Weaving the scene”;
- interrupt/stop control;
- text input fallback;
- replay guide speech;
- accessible captions toggle.

#### Side or collapsible rail: Idea shelf

A small set of visible child contributions:

- hero;
- special detail;
- desire;
- place;
- important object;
- current problem.

This is not a dense inspector. It is a simple visual memory board.

#### Side or overlay: Story thread

A child-readable transcript or sequence of story beats. It can remain collapsed by default on smaller screens.

### 9.4 Screen 4: Finished storybook

The completed view contains:

- a cover;
- approximately three illustrated pages;
- readable story text;
- narration playback;
- page-by-page navigation;
- a “Made from your ideas” section;
- options to revise, replay, or begin another story;
- no public social feed.

### 9.5 Screen 5: Parent summary

A parent-facing summary may show:

- story title;
- session duration;
- child's creative contributions;
- revisions the child made;
- reading/narration mode;
- data handling note;
- save or delete controls if persistence is implemented.

For Build Week, this can be a modal rather than a separate product surface.

---

## 10. The Living Canvas

### 10.1 The central interaction concept

The illustration is not a decorative output shown after the creative work. It is a responsive material inside the creative process.

The child speaks to the world and watches it change.

This is the defining multimodal experience.

### 10.2 Three visual actions

Wonderloom should give image generation a simple narrative grammar.

#### Reveal

A first meaningful visual appearance.

Used when:

- a character has enough distinctive details;
- a setting has been meaningfully defined;
- the guide explicitly invites a reveal.

Example:

> “Then we have to meet her.”

The application generates the initial character or scene.

#### Transform

An edit to something visible that already exists.

Used when the child says:

- “Make her wings purple.”
- “Put the castle underwater.”
- “Remove the crown.”
- “Make the cloud happy.”

The system edits the current image while preserving everything the child did not ask to change.

#### Advance

A new story scene or page.

Used when:

- the story crosses a meaningful narrative boundary;
- the character enters a new place;
- an action creates a new situation;
- the current beat has resolved enough to become a page.

The system generates a new composition using the established visual bible and character references.

### 10.3 Semantic checkpoints

The application should not call `gpt-image-2` after every utterance.

A visual generation or edit should occur when one or more of the following are true:

- the character has two or three distinctive visual attributes;
- the setting has been confirmed;
- the child explicitly requests a visible change;
- a story beat is complete;
- the guide has verbally invited the child to see the result;
- multiple pending visual changes can be coalesced into one useful render.

The application should wait when:

- the child is still thinking;
- the utterance only affects hidden motivation;
- the child is likely to add another visual detail immediately;
- the guide is merely reflecting or clarifying;
- an image request is already running and the new information can be merged safely.

### 10.4 Progressive image formation

A blank spinner breaks the illusion of a living creative medium.

During generation:

1. The current canvas remains visible.
2. The affected area enters a soft “weaving” state.
3. A sketch or luminous placeholder appears.
4. Partial image updates replace the placeholder as available.
5. The final image settles with a restrained transition.

The guide may say one short line:

> “I can already see those yellow boots appearing.”

The guide should not narrate continuously during image latency. Watching the world form is itself the experience.

### 10.5 Direct manipulation

The long-term interface should let a child select an object and speak about it.

Example:

1. Child taps the dragon.
2. A soft selection halo appears.
3. The voice dock says: **What should change about the dragon?**
4. Child says: “Make him purple and give him a tiny umbrella.”
5. The edit applies to the selected object.

For the MVP, direct manipulation can be limited to selecting the main character or the whole scene.

### 10.6 Versioning and undo

Each completed image update should create a scene revision.

The child should have:

- one-tap undo;
- “go back to this version” in a simple visual history;
- no fear that experimentation will permanently destroy the scene.

The UI can represent the previous version as a small folded-page thumbnail rather than a technical revision list.

### 10.7 Handling edits during generation

Children will change their minds before a render finishes.

The system should use a revision token:

1. An image job begins for scene revision 4.
2. The child requests another change, creating revision 5.
3. Revision 4 may finish, but it is marked stale.
4. The UI does not replace revision 5 state with revision 4 output.
5. The new change is either queued or coalesced into a new render.

This is essential for preventing the canvas from visually moving backward.

---

## 11. Voice Experience

### 11.1 Voice as the primary control surface

Voice is not only input. It establishes the pace, emotional quality, and accessibility of the product.

The experience should support:

- natural child speech;
- pauses and hesitations;
- self-corrections;
- interruptions;
- mixed speech and text;
- simple commands such as “go back” or “show me”;
- direct visual instructions;
- replay when the child did not hear the guide.

### 11.2 Model and transport

The live voice layer uses:

- `gpt-realtime-2.1-mini`;
- `RealtimeAgent` and `RealtimeSession` from the OpenAI Agents SDK;
- browser-first WebRTC;
- ephemeral client credentials issued by the server;
- tool calls for state updates and visual operations.

### 11.3 The Creative Guide's speaking style

The guide should be:

- warm but not overexcited;
- concise;
- curious;
- patient;
- easy to interrupt;
- developmentally simple without sounding condescending;
- responsive to the child's vocabulary;
- specific about what it heard;
- restrained in praise.

Prefer:

> “A dragon who tastes music. What happens when she hears a trumpet?”

Avoid:

> “Wow! That is the most amazing, incredible, fantastically creative idea ever!”

Constant exaggerated praise feels synthetic and can shift attention from creating to pleasing the system.

### 11.4 Turn length

Most spoken turns should be one or two short sentences.

A typical turn should:

1. acknowledge one contribution;
2. ask one question.

Long explanations should be rare.

### 11.5 Interruptions

The child must be able to interrupt narration and guide speech.

Examples:

- “Wait, no.”
- “Make it blue.”
- “I have another idea.”
- “Stop reading.”

When interrupted:

- speech stops quickly;
- the interface returns to listening;
- the guide does not chastise or insist on finishing;
- the interrupted context remains available;
- a direct visual command can become a tool call immediately.

### 11.6 Voice states in the UI

The voice dock should visibly distinguish:

- **Ready**
- **Listening**
- **Understanding**
- **Speaking**
- **Calling a tool**
- **Weaving an image**
- **Disconnected**
- **Microphone unavailable**

These labels can be child-friendly, but the underlying state must be technically unambiguous.

### 11.7 Text fallback

A chat or typing interface should be available without dominating the screen.

Text fallback is useful for:

- noisy environments;
- children who prefer typing;
- accessibility;
- correcting names or invented words;
- demo reliability;
- parent assistance.

Text messages should enter the same canonical creative loop as speech.

---

## 12. Text and Story Generation

### 12.1 Role of `gpt-5.6-luna`

`gpt-5.6-luna` is the structured story and composition layer.

It should be used for tasks that benefit from stronger reasoning, reliable schemas, and polished language:

- normalize child contributions into canonical state;
- identify contradictions or unresolved facts;
- decide what the story needs next;
- propose a small set of scaffolded choices;
- produce short page prose;
- produce a narration-friendly version;
- build an image render specification;
- maintain the visual bible;
- generate a title;
- prepare the authorship summary;
- run post-generation consistency checks.

### 12.2 The Realtime model should not write the whole story

The Realtime model is optimized for live interaction and tool use. It should remain the conversational conductor.

When a polished page is needed, it calls a server tool such as:

```ts
compose_story_page({
  sceneId,
  childIntent,
  targetReadingLevel,
});
```

The server invokes `gpt-5.6-luna` with structured output.

### 12.3 Page composition constraints

For the first version, each page should be:

- approximately 30–70 words, depending on reading level;
- built primarily from facts confirmed by the child;
- clear enough to narrate aloud;
- free of unnecessary new characters or plot turns;
- concrete and visual;
- emotionally legible;
- open enough for the child to determine what follows.

### 12.4 Child contribution preservation

The story composer should receive an explicit list of protected child contributions.

Example:

```json
{
  "protected_contributions": [
    "The hero is a tiny moon dragon.",
    "She wears enormous yellow boots.",
    "She wants to hear what stars sound like.",
    "The castle is underwater."
  ]
}
```

The model may improve grammar or connect ideas, but should not silently replace these decisions.

### 12.5 New model-authored details

Some connective details will be necessary. These should be low-stakes and consistent.

The model may add:

- a sensory transition;
- a simple physical action;
- a sentence connecting two child decisions;
- descriptive language that does not alter the story's meaning.

The model should not add without confirmation:

- a new villain;
- a major character relationship;
- a moral lesson;
- a central magical rule;
- the resolution;
- a major emotional interpretation.

### 12.6 Story quality checks

Before committing a page, the system should check:

- Does it contradict established facts?
- Does it preserve the child's chosen traits?
- Does it introduce an unapproved major decision?
- Is it age-appropriate?
- Is it short enough?
- Does it create a clear next creative opening?
- Can the illustration depict the scene coherently?

---

## 13. Image Generation Architecture

### 13.1 Conceptual model

The image system is not an independent illustrator making its own creative decisions.

It is a rendering layer controlled by:

1. canonical story state;
2. the child's latest visual intent;
3. a structured visual bible;
4. a scene-specific render specification;
5. explicit preservation constraints.

### 13.2 Model

All production image generation and edits use:

- `gpt-image-2`

### 13.3 The Image Director

The Image Director is a server-side orchestration module, not a separate conversational persona.

Its responsibilities are:

- decide whether the visual action is `wait`, `reveal`, `transform`, or `advance`;
- combine pending visual changes;
- request a structured render specification from `gpt-5.6-luna` when needed;
- select the correct source image and reference assets;
- invoke `gpt-image-2`;
- stream or relay partial image events;
- validate scene revision before committing output;
- store the final image reference;
- report success or failure to the Realtime session.

### 13.4 Render specification

The image model should receive a structured, deterministic brief rather than the raw conversation transcript.

```ts
type VisualRenderSpec = {
  sceneId: string;
  action: "reveal" | "transform" | "advance";
  composition: string;
  characters: Array<{
    id: string;
    requiredAppearance: string[];
    pose?: string;
    expression?: string;
    position?: string;
  }>;
  setting: string[];
  importantObjects: string[];
  mood: string;
  palette: string[];
  medium: string;
  preserve: string[];
  changeOnly?: string[];
  negativeConstraints: string[];
};
```

### 13.5 Visual bible

The visual bible remains separate from story prose.

```json
{
  "style": {
    "medium": "soft cut-paper picture-book illustration",
    "texture": "handmade paper with subtle fibers",
    "palette": ["moonlit blue", "warm yellow", "violet"],
    "mood": "gentle, curious, magical",
    "composition": "clear focal subject, spacious background"
  },
  "characters": {
    "luma": {
      "species": "tiny moon dragon",
      "body": "pale silver scales",
      "wings": "purple",
      "clothing": ["oversized yellow rain boots"],
      "eyes": "large dark-blue eyes",
      "proportions": "large head and small body"
    }
  },
  "constraints": [
    "Keep character appearance consistent across pages",
    "No written words inside the illustration",
    "Avoid crowded compositions",
    "Maintain a calm children's picture-book tone"
  ]
}
```

### 13.6 Generating the first visual

The first reveal should occur only after enough distinctiveness exists.

Minimum useful information might include:

- character type;
- one unusual trait;
- one color, object, or emotional quality.

The system should not render a generic dragon immediately after hearing “a dragon.” Waiting for one more child contribution improves both agency and visual memorability.

### 13.7 Editing an existing visual

For transforms, the server supplies the existing image as a high-fidelity input and describes:

- the requested change;
- the target object;
- what must remain unchanged;
- whether composition may change;
- whether the edit is local or scene-wide.

Example edit instruction:

> Preserve the dragon's body, face, yellow boots, proportions, pose, paper-cut style, moonlit palette, and background composition. Change only the wings from pale silver to rich violet-purple. Do not add or remove objects.

### 13.8 Creating a new scene

For `advance`, the system uses:

- the visual bible;
- the latest canonical character reference image;
- the current story beat;
- the requested action;
- the established style;
- a new composition specification.

New scenes should not be produced by repeatedly editing one giant master image. Each page has its own image thread and revision history.

### 13.9 Image quality and latency modes

The prototype may use two quality policies:

- **Exploration render:** faster, used for early reveal and live edits.
- **Storybook render:** higher quality, used when a page is finalized.

If time and cost make two passes impractical, use one consistent quality mode and prioritize responsiveness.

### 13.10 Failure behavior

If an image request fails:

- do not pretend it succeeded;
- keep the current image visible;
- preserve the story state;
- let the guide say something brief and honest;
- offer retry without asking the child to repeat the idea;
- never lose the child's contribution.

Example:

> “The picture didn't finish, but I kept your idea. Let's try weaving it again.”

---

## 14. Unified System Architecture

### 14.1 High-level architecture

```text
Child speaks or types
        │
        ▼
Browser UI
- React / Next.js
- Living canvas
- Voice dock
- Idea shelf
- Story thread
        │
        ├──────── WebRTC audio ────────► OpenAI Realtime API
        │                                 gpt-realtime-2.1-mini
        │                                 RealtimeAgent / RealtimeSession
        │                                          │
        │                                          │ tool calls
        │                                          ▼
        └──────── HTTPS / server actions ─► Wonderloom Application Server
                                           - canonical StoryState
                                           - tool handlers
                                           - revision control
                                           - safety gates
                                           - Image Director
                                           - persistence adapter
                                                     │
                         ┌───────────────────────────┴──────────────────────────┐
                         ▼                                                      ▼
                gpt-5.6-luna                                            gpt-image-2
                - structured state                                      - reveal
                - story planning                                        - transform
                - page prose                                            - advance
                - narration text                                        - image references
                - render specs                                          - partial images
```

### 14.2 Why this is one system rather than three features

All modalities share the same canonical state.

- Voice does not keep a private version of the story.
- Text composition does not invent from an isolated prompt.
- Image generation does not read the full raw transcript and guess what matters.
- The UI does not maintain a separate unsynchronized representation.

The `StoryState` is the source of truth.

### 14.3 Technology roles

#### `@openai/agents`

Used for:

- server-side structured agents or model calls;
- tools;
- guardrails;
- traces;
- stateful orchestration where appropriate.

#### `@openai/agents/realtime`

Used for:

- `RealtimeAgent`;
- `RealtimeSession`;
- browser WebRTC transport;
- tool invocation;
- interruptions;
- session events;
- live transcript updates.

#### OpenAI Realtime Agents demo

Used as a reference for:

- Next.js project organization;
- ephemeral session creation;
- WebRTC handshake patterns;
- event handling;
- realtime-to-server tool patterns;
- supervisor-style separation between a low-latency live model and a stronger structured model.

It should be treated as a reference implementation and pattern library, not as a reason to create unnecessary agent handoffs.

### 14.4 One conversational agent

The MVP should use one main `RealtimeAgent`: **Wonderloom Creative Guide**.

Do not create separate realtime personas for:

- interviewer;
- writer;
- illustrator;
- narrator;
- safety agent;
- memory manager.

Those are system responsibilities, tools, or server modules. Multiple live agents would add behavioral inconsistency and implementation risk without improving the child experience.

---

## 15. Canonical State Model

### 15.1 Session state

```ts
type WonderloomSession = {
  id: string;
  status:
    | "setup"
    | "creating"
    | "composing"
    | "complete"
    | "paused"
    | "error";

  audience: {
    approximateAgeBand?: "6-7" | "8-10" | "unspecified";
    readingMode: "wonderloom_reads" | "read_together" | "child_reads";
    language: string;
  };

  realtime: {
    sessionId?: string;
    connectionState:
      | "idle"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "disconnected";
  };

  story: StoryState;
  scenes: SceneState[];
  activeSceneId: string;
  contributions: ChildContribution[];
  createdAt: string;
  updatedAt: string;
};
```

### 15.2 Story state

```ts
type StoryState = {
  title?: string;
  phase:
    | "discovering_hero"
    | "discovering_desire"
    | "introducing_problem"
    | "choosing_action"
    | "showing_consequence"
    | "choosing_ending"
    | "complete";

  premise?: string;
  protagonist?: CharacterState;
  supportingCharacters: CharacterState[];
  setting?: SettingState;
  desire?: string;
  centralProblem?: string;
  establishedRules: string[];
  importantObjects: StoryObject[];
  unresolvedQuestions: string[];
  protectedFacts: string[];
  visualBible: VisualBible;
};
```

### 15.3 Child contribution

```ts
type ChildContribution = {
  id: string;
  timestamp: string;
  source: "voice" | "text" | "direct_manipulation" | "choice_chip";
  rawText: string;
  normalizedMeaning: string;
  category:
    | "character"
    | "setting"
    | "desire"
    | "emotion"
    | "action"
    | "object"
    | "visual_detail"
    | "story_rule"
    | "ending"
    | "revision";
  affectedEntityIds: string[];
  sceneId?: string;
  visible: boolean;
};
```

### 15.4 Scene state

```ts
type SceneState = {
  id: string;
  order: number;
  status: "draft" | "rendering" | "ready" | "final" | "error";
  storyBeat: string;
  pageText?: string;
  narrationText?: string;
  visualSpec?: VisualRenderSpec;
  image?: {
    fileId?: string;
    url?: string;
    revision: number;
    status: "empty" | "queued" | "generating" | "ready" | "error";
    sourceRevisionIds: string[];
  };
  revisions: SceneRevision[];
};
```

### 15.5 State patching

The Realtime model should not replace full state objects. It should call narrowly scoped tools with typed patches.

This limits accidental deletion and makes state changes auditable.

---

## 16. Tool Design

### 16.1 Core realtime tools

The Creative Guide should have a small, comprehensible tool set.

#### `record_child_contribution`

Records the child's idea before any generation occurs.

```ts
record_child_contribution({
  rawText,
  normalizedMeaning,
  category,
  affectedEntityIds,
});
```

#### `update_story_state`

Applies a validated patch to canonical state.

```ts
update_story_state({
  patch,
  contributionId,
  visualSignificance: "none" | "minor" | "major",
});
```

#### `request_visual_update`

Asks the Image Director to evaluate or perform a visual operation.

```ts
request_visual_update({
  sceneId,
  requestedChange,
  targetEntityId,
  urgency: "immediate" | "checkpoint",
});
```

#### `compose_story_page`

Invokes `gpt-5.6-luna` to write a structured page.

```ts
compose_story_page({
  sceneId,
  targetReadingLevel,
});
```

#### `finalize_story`

Runs consistency checks and prepares the storybook view.

```ts
finalize_story({
  childConfirmedEnding: true,
});
```

#### `undo_last_change`

Restores the previous canonical revision.

### 16.2 Tool result discipline

The guide must never claim a tool action completed before receiving success.

It may say:

> “Let's make her wings purple.”

It should not say:

> “Her wings are purple now.”

until the relevant tool returns success and the UI has committed the change.

### 16.3 Background versus blocking operations

Some tool calls should not freeze conversation.

#### Blocking

- state validation needed before the next question;
- undo;
- finalization;
- safety escalation.

#### Background

- image rendering;
- high-quality page re-render;
- optional save/export.

The guide can continue with a short related question while a background visual is forming, but should avoid advancing so far that the image becomes obsolete.

---

## 17. Realtime Creative Guide Prompt Specification

The production prompt should be modular, but its behavioral core should resemble the following.

```text
You are Wonderloom's Creative Guide, a patient voice-first creative tool
for children. You help a child develop and express their own story.

The child is the author. You are not the author.

PRIMARY BEHAVIOR
- Ask one short, meaningful creative question at a time.
- Listen for the child's actual idea rather than steering toward your own.
- Briefly reflect what you heard.
- Record every meaningful child contribution with a tool.
- Make suggestions only when the child is stuck.
- When suggesting, provide no more than three options and always leave room
  for “something else.”
- Never make a major plot, character, world, or ending decision without the
  child's input or confirmation.
- Keep most spoken responses to one or two short sentences.
- Allow interruptions and revisions immediately.
- Treat “no,” “wait,” and “I changed my mind” as normal creative behavior.

VISUAL BEHAVIOR
- Request a visual update when the child makes a meaningful visual decision.
- Do not render after every sentence.
- Request a reveal after two or three distinctive visual details exist.
- Request an edit when the child changes something visible.
- Preserve everything the child did not ask to change.
- Never say a visible change is complete before the tool reports success.

STORY BEHAVIOR
- Use the structured story state as the source of truth.
- Do not generate a finished story from the first prompt.
- Let the child choose the protagonist, desire, major action, and ending.
- Ask questions that help connect causes and consequences.
- Use compose_story_page only at a meaningful scene checkpoint.

RELATIONSHIP AND SAFETY
- Be warm but do not claim to be the child's friend or imply emotional need.
- Do not encourage secrecy from parents or guardians.
- Do not ask for personal identifying information.
- Do not create an endless engagement loop.
- Help the child finish a small artifact.

VOICE STYLE
- Calm, curious, clear, and lightly playful.
- Never use exaggerated praise repeatedly.
- Match the child's vocabulary without talking down to them.
```

---

## 18. UI State Machine

### 18.1 Studio states

```text
IDLE
  └─ child starts session → CONNECTING
CONNECTING
  ├─ success → READY
  └─ failure → CONNECTION_ERROR
READY
  ├─ guide speaks → SPEAKING
  └─ child begins → LISTENING
LISTENING
  ├─ utterance ends → UNDERSTANDING
  └─ cancel → READY
UNDERSTANDING
  ├─ state-only update → READY or SPEAKING
  ├─ image request → VISUAL_QUEUED
  ├─ page composition → COMPOSING_PAGE
  └─ error → RECOVERABLE_ERROR
VISUAL_QUEUED
  └─ job begins → WEAVING_VISUAL
WEAVING_VISUAL
  ├─ partial update → WEAVING_VISUAL
  ├─ final → VISUAL_READY
  ├─ stale revision → discard and remain on latest state
  └─ failure → VISUAL_ERROR
VISUAL_READY
  └─ continue conversation → READY / SPEAKING / LISTENING
COMPOSING_PAGE
  ├─ success → PAGE_READY
  └─ failure → RECOVERABLE_ERROR
PAGE_READY
  └─ continue → READY
```

### 18.2 Why explicit states matter

Voice, tool calls, image generation, and UI animation occur concurrently. Without an explicit state model, the interface will:

- show the wrong status;
- allow duplicate microphone actions;
- overwrite newer images with stale results;
- claim edits before they appear;
- trap the child behind loading screens;
- become difficult to debug during a live demo.

---

## 19. Detailed End-to-End Session

### 19.1 Beginning

The studio opens on an empty, softly textured canvas.

A quiet prompt appears:

> **Let's make something that has never existed before.**

The guide says:

> “Who should our hero be?”

The microphone enters listening mode.

### 19.2 First contribution

Child:

> “A tiny dragon who lives on the moon.”

Immediate UI response:

- a small idea card appears: **tiny moon dragon**;
- a thread travels from the card to a faint character silhouette;
- no image generation yet.

Guide:

> “A tiny moon dragon. What is one thing that makes her different from every other dragon?”

### 19.3 Distinctive detail

Child:

> “She has giant yellow boots.”

Immediate UI response:

- a yellow boot token appears;
- the Image Director decides that the reveal checkpoint is satisfied;
- the canvas enters a weaving state.

Guide:

> “Then we absolutely have to meet her.”

A partial image forms, followed by the final character reveal.

### 19.4 Direct edit

Child:

> “Her wings should be purple.”

The application:

1. records the contribution;
2. patches the visual bible;
3. selects the dragon image as the edit source;
4. asks `gpt-5.6-luna` for a preservation-aware edit spec if needed;
5. invokes `gpt-image-2`;
6. marks the previous render as revision 1;
7. commits the new render as revision 2.

Guide:

> “Purple wings. Let's change just those.”

The wings transform while the boots, face, pose, body, and background remain stable.

### 19.5 Story desire

Guide:

> “What does she want more than anything?”

Child:

> “She wants to hear what stars sound like.”

The idea shelf adds:

- **Wants:** to hear the stars

No image generation is needed yet because this is primarily narrative state.

### 19.6 Setting and first page

Guide:

> “Where does she go to listen?”

Child:

> “An underwater castle.”

Guide:

> “Is it dark and mysterious, or bright and full of coral—or something else?”

Child:

> “Bright coral, with fish wearing hats.”

The system now has enough material for `advance`.

`gpt-5.6-luna` returns:

- page prose;
- narration text;
- a new scene beat;
- an illustration spec;
- the next unresolved question.

`gpt-image-2` generates the scene using the character reference and visual bible.

The guide narrates the completed page only when it is ready.

### 19.7 Child interrupts

During narration, the child says:

> “Wait! The fish shouldn't wear hats. They should carry tiny lamps.”

Narration stops.

The system:

- records a revision;
- updates the scene state;
- edits the image;
- revises the page prose only if the hats were mentioned;
- preserves all other details.

This moment demonstrates that the child is not merely approving model output. The world remains editable.

### 19.8 Ending

After one more action and consequence, the guide asks:

> “How should Luma finally hear the stars?”

The child invents the resolution.

The final storybook is assembled.

### 19.9 Authorship summary

The finished view shows:

> **You imagined:**
>
> - Luma, a tiny moon dragon
> - enormous yellow boots
> - purple wings
> - stars that can be heard
> - an underwater coral castle
> - fish carrying tiny lamps
> - the way the story ends

This summary is one of the strongest ways to communicate Wonderloom's philosophy to parents and judges.

---

## 20. Parent Trust, Privacy, and Safety

### 20.1 Product posture

Safety should be visible in the design, not hidden in legal text.

Parents should understand:

- that the experience uses AI;
- that the AI is a creative tool;
- that the child directs the story;
- what voice data is processed;
- whether any recording is stored;
- how to delete the session;
- that the experience has a natural endpoint.

### 20.2 Data minimization

For the Build Week prototype:

- do not require accounts;
- do not request a child's full name;
- do not retain raw voice recordings by default;
- avoid persistent behavioral profiles;
- store only what is necessary for the active story session;
- provide an obvious reset/delete action;
- use ephemeral Realtime client credentials;
- keep the permanent OpenAI API key server-side.

### 20.3 Content safety

The application should use multiple layers:

- carefully scoped Creative Guide instructions;
- input and output guardrails;
- OpenAI moderation where appropriate;
- server-side validation before story or visual commits;
- refusal and redirection behavior appropriate for children;
- logging suitable for debugging without collecting unnecessary child data.

### 20.4 Sensitive content handling

If a child introduces frightening, violent, sexual, self-harm, or otherwise sensitive material, the product should:

- avoid shaming the child;
- avoid escalating or elaborating harmful content;
- gently redirect toward a safe creative alternative;
- surface a parent-facing path when appropriate;
- preserve a calm tone.

### 20.5 No secrecy behavior

The guide must never encourage the child to hide the interaction from a parent, teacher, or guardian.

### 20.6 Session ending

Wonderloom should help the child finish.

After the story is complete:

> “Your story is ready. Would you like to read it, change one page, or finish for today?”

This creates closure rather than immediately generating a new hook.

---

## 21. Accessibility and Inclusive Interaction

Wonderloom should support:

- captions for all guide speech;
- text input as an alternative to voice;
- keyboard navigation;
- large touch targets;
- visible focus states;
- replaying spoken lines;
- adjustable narration speed where practical;
- reduced motion;
- sufficient contrast;
- avoidance of color as the only status signal;
- simple language;
- support for invented words and names;
- graceful behavior in noisy environments.

The interface should not assume every child communicates in the same way or at the same pace.

Longer-term possibilities include:

- multilingual creation;
- symbol-supported communication;
- drawing as input;
- switch-accessible controls;
- parent-configurable narration and reading support.

---

## 22. Responsive Web Design

### 22.1 Desktop and large tablet

Recommended composition:

- center canvas occupying most of the viewport;
- idea shelf on the left;
- story thread on the right or in a collapsible drawer;
- voice dock fixed at the bottom;
- minimal top navigation.

### 22.2 Small tablet and mobile

Recommended composition:

- full-width canvas;
- voice dock fixed at bottom;
- idea shelf becomes a horizontal tray;
- story thread becomes a swipe-up sheet;
- direct manipulation remains available;
- avoid shrinking desktop panels into tiny columns.

### 22.3 Orientation

The application should work in landscape and portrait, but the Build Week demo can be optimized for a laptop or landscape tablet to maximize visual clarity.

---

## 23. Error and Recovery Design

### 23.1 Microphone permission denied

Show:

- a simple explanation;
- one clear action to retry;
- text input immediately available;
- no dead-end screen.

### 23.2 Realtime connection loss

The UI should:

- preserve all current story state;
- show “Reconnecting…”;
- prevent duplicate session creation;
- fall back to text if reconnection fails;
- restore the current question after reconnection.

### 23.3 Tool failure

The guide should not expose technical jargon.

Prefer:

> “That change didn't finish, but your idea is safe. Shall we try it again?”

### 23.4 Story composition failure

Keep the existing story beat and retry server-side. Do not ask the child to reconstruct their choices.

### 23.5 Image moderation or refusal

The guide should redirect neutrally and offer a safe adjacent option without reading policy text aloud.

### 23.6 Conflicting child requests

If the child says both “the dragon has no wings” and later “make the wings purple,” the system should ask a brief clarification:

> “Should Luma have purple wings now, or stay wingless?”

Do not silently choose.

---

## 24. Observability and Evaluation

### 24.1 What to trace

Use Agents SDK tracing and application-level events for:

- Realtime session lifecycle;
- tool calls;
- state patches;
- story composition calls;
- image generation and edit requests;
- render latency;
- stale revision discards;
- interruptions;
- errors and retries;
- safety guardrail triggers.

### 24.2 Product quality metrics

For early testing, useful measures include:

- percentage of major story facts supplied by the child;
- number of meaningful child revisions;
- time to first visible creative result;
- number of model-introduced major facts requiring correction;
- story completion rate;
- child speaking time versus guide speaking time;
- parent-reported sense of child authorship;
- child's ability to identify their own contributions;
- visual consistency across pages;
- median interruption response time.

### 24.3 Avoid optimizing the wrong metrics

Do not make “minutes spent” the primary success metric.

A successful eight-minute session ending in a story the child owns may be better than a forty-minute session sustained by endless prompts.

### 24.4 Suggested eval cases

Create scripted evaluations for:

- child gives a very short answer;
- child gives a long, rambling answer;
- child changes their mind repeatedly;
- child interrupts narration;
- child requests a local visual edit;
- child requests a scene-wide transformation;
- child says “I don't know” three times;
- child invents an unusual word;
- child contradicts an established fact;
- image generation finishes out of order;
- voice disconnects mid-session;
- unsafe content appears;
- child asks whether the AI is their friend;
- child tries to share personal identifying information.

---

## 25. Build Week MVP Definition

### 25.1 Required experience

The MVP is complete when a user can:

1. open the web application;
2. grant microphone access;
3. begin a WebRTC Realtime session;
4. invent a protagonist through voice;
5. add at least one distinctive visual trait;
6. see a generated character reveal;
7. verbally edit that character;
8. define a desire and setting;
9. create a first illustrated scene;
10. interrupt and transform that scene;
11. complete a three-page story;
12. hear the story narrated;
13. see a summary of their contributions.

### 25.2 Required technical integration

- Next.js TypeScript web application
- `@openai/agents`
- `@openai/agents/realtime`
- WebRTC browser connection
- ephemeral token endpoint
- `gpt-realtime-2.1-mini`
- `gpt-5.6-luna` via the Responses API
- Structured Outputs for story and render state
- `gpt-image-2` generation and editing
- partial image updates where practical
- typed tool schemas
- canonical StoryState
- scene revision control
- basic safety guardrails
- tracing or useful structured logs

### 25.3 Four visual proof moments

The demo should deliberately show:

1. **Reveal:** the hero first appears.
2. **Transform:** one character detail changes while the rest remains stable.
3. **Advance:** a new full story scene appears.
4. **Dramatic transformation:** the child changes the world, such as moving the castle underwater.

These four moments communicate the product thesis more clearly than a large feature list.

### 25.4 Non-goals for the MVP

Do not build:

- authentication;
- social profiles;
- a public story feed;
- parent analytics dashboards;
- subscriptions;
- a marketplace;
- long-term memory across children;
- ten visual styles;
- collaborative multiplayer;
- full drawing tools;
- native mobile apps;
- more than one realtime agent;
- a complex database architecture;
- a ten-page book;
- an autonomous “story team” of agents.

---

## 26. Suggested Implementation Structure

```text
src/
  app/
    page.tsx
    studio/page.tsx
    story/[id]/page.tsx
    api/
      realtime/session/route.ts
      story/compose/route.ts
      image/generate/route.ts
      image/edit/route.ts
      session/finalize/route.ts

  components/
    studio/
      LivingCanvas.tsx
      VoiceDock.tsx
      IdeaShelf.tsx
      StoryThread.tsx
      ScenePager.tsx
      VisualGenerationOverlay.tsx
      ContributionCard.tsx
    storybook/
      Storybook.tsx
      StoryPage.tsx
      AuthorshipSummary.tsx
    parent/
      ParentSetup.tsx
      PrivacySummary.tsx

  agents/
    creativeGuide.ts
    creativeGuidePrompt.ts
    storyComposer.ts
    storySchemas.ts

  tools/
    recordChildContribution.ts
    updateStoryState.ts
    requestVisualUpdate.ts
    composeStoryPage.ts
    finalizeStory.ts
    undoLastChange.ts

  server/
    imageDirector.ts
    imagePromptBuilder.ts
    revisionManager.ts
    safety.ts
    openai.ts

  state/
    wonderloomStore.ts
    types.ts
    reducers.ts

  lib/
    realtimeEvents.ts
    audio.ts
    validation.ts
    ids.ts
```

---

## 27. Suggested API Responsibilities

### 27.1 `POST /api/realtime/session`

- authenticates the application session if needed;
- creates an ephemeral Realtime client credential;
- returns safe client configuration;
- never exposes the permanent API key.

### 27.2 `POST /api/story/compose`

- validates scene and story state;
- calls `gpt-5.6-luna`;
- requires structured output;
- returns page prose, narration, image brief, and next-question recommendation;
- does not directly mutate state without validation.

### 27.3 `POST /api/image/generate`

- accepts a validated `VisualRenderSpec`;
- calls `gpt-image-2`;
- emits partial results if implemented;
- commits only if the revision is still current.

### 27.4 `POST /api/image/edit`

- accepts scene ID, source image, requested change, and preservation list;
- calls `gpt-image-2` with the existing image;
- creates a new revision;
- returns the committed visual only when it matches the latest state revision.

### 27.5 `POST /api/session/finalize`

- runs story consistency checks;
- confirms each page has text and image;
- creates the title and authorship summary;
- returns the completed storybook state.

---

## 28. Latency Strategy

### 28.1 Perceived latency matters more than hidden latency

The child should receive immediate acknowledgement even when a high-quality image takes time.

Use a layered response:

- under 200 ms: microphone and listening feedback;
- immediate after utterance: transcript and idea token;
- shortly after: guide reflection;
- during model work: meaningful canvas animation;
- as available: partial image formation;
- final: image commit and brief sound cue.

### 28.2 Parallel work

At a scene checkpoint, the server can often run in parallel:

- page prose composition;
- image render specification;
- UI transition preparation.

Narration begins only after final page text exists. Image rendering can continue, but the product should avoid narrating a scene that is about to change materially.

### 28.3 Coalescing changes

If a child says:

> “Purple wings—and yellow boots—and make her tiny.”

combine these into one render rather than three sequential image calls.

### 28.4 Cache stable assets

Reuse:

- character reference images;
- visual bible;
- style instructions;
- finalized prior scenes;
- generated audio where appropriate and permitted.

---

## 29. Design Language Recommendations

### 29.1 Typography

Use:

- a friendly display typeface for titles;
- a highly legible sans-serif for controls;
- a readable book face or warm sans-serif for story text;
- large default text;
- generous line height.

Avoid novelty fonts for long passages.

### 29.2 Color

Use a restrained palette with:

- a warm neutral canvas;
- one distinctive Wonderloom accent;
- softer supporting colors attached to idea categories;
- clear contrast for controls;
- no dependence on saturated rainbow UI.

### 29.3 Shape

Prefer:

- soft but not excessively bubbly geometry;
- tactile cards;
- generous spacing;
- clear object boundaries;
- large buttons;
- restrained shadows and texture.

### 29.4 Illustration direction

The initial default style should be consistent and ownable.

A suitable direction:

- handmade cut-paper or softly painted picture-book art;
- clear silhouettes;
- limited palette;
- expressive faces;
- calm compositions;
- enough negative space for accompanying text;
- no text rendered inside illustrations.

The MVP should use one excellent visual style rather than a style picker.

---

## 30. Product Copy Examples

### Welcome

> **Your ideas, woven into worlds.**
>
> Tell Wonderloom what you imagine. Change anything. Make the story yours.

### Microphone permission

> **Wonderloom listens while you create.**
>
> Your voice helps shape the story. You can also type at any time.

### Empty canvas

> **Let's make something that has never existed before.**

### Image generation

> **Weaving your idea…**

### Image edit

> **Changing just the wings…**

### Recoverable failure

> **That picture didn't finish, but your idea is safe.**

### Completion

> **You made a world.**

### Authorship section

> **Made from your ideas**

---

## 31. Demo Narrative for Judges or Parents

The product can be introduced in one sentence:

> Wonderloom is a voice-first creative studio where children make illustrated stories with AI while remaining the author.

The demo should emphasize:

- the child does not write prompts;
- the guide asks one question at a time;
- every answer becomes visible;
- the image can be changed through natural speech;
- major story decisions remain with the child;
- the finished book shows the child's contributions.

The strongest demonstration is not the quality of the first generated image. It is the moment the child interrupts, changes the world, and sees the system preserve everything else.

---

## 32. Future Expansion

After validating the story loop, Wonderloom can expand carefully.

### 32.1 Drawing input

A child draws a creature or object, and Wonderloom helps animate or place it in the world while preserving its recognizable form.

### 32.2 Comics

Children arrange panels, choose speech, and directly manipulate sequence and framing.

### 32.3 Animation

A child directs motion through voice:

> “Make the dragon tiptoe, then sneeze glitter.”

### 32.4 Music and sound

Children invent a world sound, character theme, or story atmosphere.

### 32.5 Interactive stories and games

Children define rules and consequences, not merely branching dialogue.

### 32.6 Collaborative creation

Siblings, classmates, or families contribute distinct threads to one world.

### 32.7 Cultural and linguistic expression

Stories can eventually be created in a child's home language, local storytelling traditions, and family context—with careful product and safety research rather than superficial translation.

---

## 33. Final Product Definition

Wonderloom is a voice-first multimodal creative canvas for children.

It listens before it generates. It asks before it decides. It makes ideas visible. It lets children revise the world. It turns their choices into polished stories, images, and narration without hiding who supplied the imagination.

The product succeeds when the modalities disappear into one creative loop:

- the child speaks;
- the system understands;
- the idea becomes visible;
- the world responds;
- the child changes it;
- the story grows;
- the child completes something meaningful.

The foundational promise is simple:

> **Wonderloom will help children express more of their imagination—not replace the act of imagining.**

---

## 34. Official OpenAI Technical References

- OpenAI Agents SDK for TypeScript: https://openai.github.io/openai-agents-js/
- Voice Agents guide: https://openai.github.io/openai-agents-js/guides/voice-agents/
- OpenAI Realtime Agents demo: https://github.com/openai/openai-realtime-agents
- Realtime API with WebRTC: https://developers.openai.com/api/docs/guides/realtime-webrtc
- Realtime tools and sessions: https://developers.openai.com/api/docs/guides/realtime
- `gpt-realtime-2.1-mini`: https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini
- `gpt-5.6-luna`: https://developers.openai.com/api/docs/models/gpt-5.6-luna
- Image generation guide: https://developers.openai.com/api/docs/guides/image-generation
- `gpt-image-2`: https://developers.openai.com/api/docs/models/gpt-image-2
- Under-18 API guidance: https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance

