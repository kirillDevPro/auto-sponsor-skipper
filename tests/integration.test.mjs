// Headless integration: the service-worker round-trip a content script drives.
// message {GET_SEGMENTS, videoId} -> messageHandler -> segmentService -> cache/api.
// Mocks chrome.runtime + chrome.storage.local + fetch; real crypto.subtle.
// Run: node tests/integration.test.mjs
const store = {};
let listener = null;
let fetchCount = 0;

globalThis.chrome = {
  runtime: {
    onMessage: { addListener(fn) { listener = fn; } }
  },
  storage: {
    local: {
      async get(k) {
        if (k === null || k === undefined) return { ...store };
        if (Array.isArray(k)) { const o = {}; for (const key of k) if (key in store) o[key] = store[key]; return o; }
        return k in store ? { [k]: store[k] } : {};
      },
      async set(obj) { Object.assign(store, obj); },
      async remove(keys) { (Array.isArray(keys) ? keys : [keys]).forEach((x) => delete store[x]); }
    }
  }
};

const fixtureBody = [
  { videoID: "OTHERvideo1", segments: [{ segment: [1, 2], category: "sponsor" }] },
  { videoID: "5GKIUKsrnKo", segments: [{ segment: [80.93964, 145.15292], UUID: "a", category: "sponsor" }] }
];
globalThis.fetch = async (_url) => {
  fetchCount++;
  return { status: 200, ok: true, json: async () => fixtureBody };
};

const { registerMessageHandler } = await import("../background/messageHandler.js");
registerMessageHandler();

/** Simulate chrome.runtime.sendMessage against the registered listener. */
function sendMessage(msg) {
  return new Promise((resolve) => {
    listener(msg, {}, resolve); // handler calls resolve as sendResponse
  });
}

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

const r1 = await sendMessage({ type: "GET_SEGMENTS", videoId: "5GKIUKsrnKo" });
ok(r1 && r1.ok && r1.status === "found", "round-trip returns found");
ok(r1.segments.length === 1 && r1.segments[0].category === "sponsor", "correct segment for our videoID");
ok(fetchCount === 1, "API fetched exactly once");

const r2 = await sendMessage({ type: "GET_SEGMENTS", videoId: "5GKIUKsrnKo" });
ok(r2.status === "found", "second call still found");
ok(fetchCount === 1, "second call served from cache (no refetch)");

const rb = await sendMessage({ type: "GET_SEGMENTS", videoId: "x" });
ok(rb && rb.ok === false && rb.error === "bad videoId", "bad videoId rejected synchronously");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
