#!/usr/bin/env node

const baseUrl = (process.env.WONDERLOOM_BASE_URL ?? "").replace(/\/$/, "");
if (!baseUrl) throw new Error("Set WONDERLOOM_BASE_URL to the deployment to verify.");

const checks = [];
let sessionId = null;
const generatedMediaUrls = [];

function pass(name, detail = "ok") {
  checks.push({ name, detail });
  console.log(`✓ ${name}: ${detail}`);
}

async function request(path, options = {}, expected = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (response.status !== expected) {
    const body = (await response.text()).slice(0, 500);
    throw new Error(`${options.method ?? "GET"} ${path} returned ${response.status}; expected ${expected}. ${body}`);
  }
  return response;
}

async function json(path, options = {}, expected = 200) {
  return request(path, options, expected).then((response) => response.json());
}

async function verifyMedia(path, label) {
  const response = await request(path);
  const type = response.headers.get("content-type") ?? "";
  const bytes = (await response.arrayBuffer()).byteLength;
  if (!type.startsWith("image/") && !type.startsWith("audio/")) throw new Error(`${label} returned ${type || "no content type"}.`);
  if (bytes < 100) throw new Error(`${label} returned only ${bytes} bytes.`);
  pass(label, `${type}, ${bytes} bytes`);
}

async function consumeVisualStream(response) {
  if (!response.body) throw new Error("Visual response had no stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) events.push(JSON.parse(line));
    if (done) break;
  }
  if (buffer.trim()) events.push(JSON.parse(buffer));
  return events;
}

try {
  const home = await request("/");
  const homeHtml = await home.text();
  if (!homeHtml.includes("A Tiny Studio") || !homeHtml.includes("For Your Big")) throw new Error("Welcome page copy was missing.");
  pass("welcome page");

  const created = await json("/api/session", {
    method: "POST",
    body: JSON.stringify({ ageBand: "8-10", readingMode: "read-with-me", voiceEnabled: true, adultConfirmed: true }),
  }, 201);
  sessionId = created.session.id;
  if (!sessionId) throw new Error("Session creation returned no id.");
  pass("adult setup and session creation");

  const recovered = await Promise.all(Array.from({ length: 12 }, (_, index) => json(`/api/session/${sessionId}?probe=${index}`)));
  if (recovered.some((item) => item.session.id !== sessionId)) throw new Error("A concurrent session read returned the wrong session.");
  pass("serverless session recovery", "12 concurrent reads");

  const realtimeResponse = await request("/api/realtime/session", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
  const realtime = await realtimeResponse.json();
  if (typeof realtime.value !== "string" || realtime.value.length < 20) throw new Error("Realtime endpoint returned no ephemeral client secret.");
  if (realtimeResponse.headers.get("x-wonderloom-realtime-model") !== "gpt-realtime-2.1-mini") throw new Error("Realtime model header was incorrect.");
  if (realtimeResponse.headers.get("x-wonderloom-realtime-voice") !== "marin") throw new Error("Realtime voice header was incorrect.");
  pass("Realtime voice configuration", "gpt-realtime-2.1-mini · marin");

  await json(`/api/session/${sessionId}/contribution`, {
    method: "POST",
    body: JSON.stringify({ author: "child", kind: "idea", text: "A curious paper fox follows moonbeams through a garden." }),
  });
  pass("authored contribution");

  const patched = await json(`/api/session/${sessionId}/state`, {
    method: "PATCH",
    body: JSON.stringify({ field: "heroDetail", value: "The fox carries a tiny brass lantern.", author: "child" }),
  });
  if (patched.session.state.heroDetail !== "The fox carries a tiny brass lantern.") throw new Error("Narrow story edit was not applied.");
  pass("narrow story edit");

  const undone = await json(`/api/session/${sessionId}/undo`, { method: "POST" });
  if (undone.session.state.heroDetail === "The fox carries a tiny brass lantern.") throw new Error("Undo did not restore the prior state.");
  pass("undo");

  const turn = await json(`/api/session/${sessionId}/turn`, {
    method: "POST",
    body: JSON.stringify({ author: "child", text: "The fox wants to return a fallen star to the night sky." }),
  });
  if (!turn.session?.state || !turn.guide?.question) throw new Error("Creative Guide turn was incomplete.");
  pass("structured Creative Guide turn", "gpt-5.6-luna");

  const visualPrompt = turn.visual?.prompt || "A child-friendly layered paper-cut storybook illustration of a small orange paper fox carrying a glowing fallen star through a moonlit garden, warm expressive shapes, no text.";
  const visualIntent = turn.visual?.intent === "none" || !turn.visual?.intent ? "reveal" : turn.visual.intent;
  const visualResponse = await request(`/api/session/${sessionId}/visual`, {
    method: "POST",
    body: JSON.stringify({ intent: visualIntent, prompt: visualPrompt, expectedRevision: turn.session.state.revision }),
  });
  const visualEvents = await consumeVisualStream(visualResponse);
  const visualError = visualEvents.find((event) => event.type === "error");
  if (visualError) throw new Error(`Image stream failed: ${visualError.error}`);
  const partials = visualEvents.filter((event) => event.type === "partial");
  const complete = visualEvents.find((event) => event.type === "complete");
  if (!complete?.imageUrl) throw new Error("Image stream returned no completed illustration.");
  generatedMediaUrls.push(...partials.map((event) => event.imageUrl).filter(Boolean), complete.imageUrl);
  if (partials[0]?.imageUrl) await verifyMedia(partials[0].imageUrl, "progressive image preview");
  await verifyMedia(complete.imageUrl, "final generated illustration");
  pass("progressive image stream", `${partials.length} partial frame(s) plus final`);

  const composed = await json(`/api/session/${sessionId}/compose`, { method: "POST" });
  if (composed.session.state.pages.length !== 3) throw new Error("Composition did not return exactly three pages.");
  pass("three-page composition");

  const titled = await json(`/api/session/${sessionId}/state`, {
    method: "PATCH",
    body: JSON.stringify({ field: "title", value: "The Fox Who Carried Starlight", author: "child" }),
  });
  if (!titled.session.state.titleConfirmed) throw new Error("Title was not confirmed.");
  pass("editable title");

  const firstPage = titled.session.state.pages[0];
  const editedText = `${firstPage.text} The moonlit leaves seemed to cheer.`;
  const edited = await json(`/api/session/${sessionId}/page`, {
    method: "PATCH",
    body: JSON.stringify({ pageId: firstPage.id, text: editedText }),
  });
  if (edited.session.state.pages[0].text !== editedText) throw new Error("Page edit was not retained.");
  pass("editable story page");

  const finalized = await json(`/api/session/${sessionId}/finalize`, { method: "POST" });
  if (!finalized.session.completedAt || finalized.session.state.phase !== "finished") throw new Error("Finalization gate did not complete the story.");
  pass("finished-book gate");

  const library = await json("/api/library");
  if (!library.stories.some((story) => story.id === sessionId && story.title === "The Fox Who Carried Starlight")) throw new Error("Finished story was absent from the library.");
  pass("finished-story library");

  const storyPage = await request(`/story/${sessionId}`);
  if (!(await storyPage.text()).includes("Opening your book")) throw new Error("Saved-story route did not render its loading shell.");
  pass("saved story route");

  const narration = await json(`/api/session/${sessionId}/speech`, {
    method: "POST",
    body: JSON.stringify({ target: { kind: "cover" } }),
  });
  if (!narration.audioUrl || !narration.disclosure?.includes("Coral")) throw new Error("Narration response was incomplete.");
  generatedMediaUrls.push(narration.audioUrl);
  await verifyMedia(narration.audioUrl, "Coral narration audio");
  pass("storybook narration", "gpt-4o-mini-tts · Coral");

  const cachedNarration = await json(`/api/session/${sessionId}/speech`, {
    method: "POST",
    body: JSON.stringify({ target: { kind: "cover" } }),
  });
  if (!cachedNarration.cached || cachedNarration.audioUrl !== narration.audioUrl) throw new Error("Narration cache was not reused.");
  pass("narration cache");
} finally {
  if (sessionId) {
    await request(`/api/session/${sessionId}`, { method: "DELETE" }, 204);
    await request(`/api/session/${sessionId}`, {}, 404);
    await Promise.all(generatedMediaUrls.map((url) => request(url, {}, 404)));
    const library = await json("/api/library");
    if (library.stories.some((story) => story.id === sessionId)) throw new Error("Deleted story remained in the library.");
    pass("session and media deletion");
  }
}

console.log(`\n${checks.length} deployment checks passed.`);
