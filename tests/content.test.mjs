// Headless: content/content.js orchestrator — specifically that onVideo records the
// enforced whitelist decision into sbwl_<videoId> for the popup, with the fail-open
// equivalence (unreadable channel == not whitelisted) the skip path uses, and that a
// rejected storage write can't break the flow. Stubs every NS collaborator + a fake
// chrome.storage; loads the REAL config.js (NS.STORAGE/contextAlive) and content.js.
// ASCII-only. Run: node tests/content.test.mjs
import { readFileSync } from "node:fs";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const tick = () => new Promise((r) => setTimeout(r, 0)); // let the load-time .then() run

// Build a content orchestrator with stubbed collaborators and a fake storage.
function makeContent({ channel = "UCabc", whitelist = [], rejectSet = false, videoNull = false, seed = {} } = {}) {
  const store = { ...seed };
  const setCalls = [];
  const removeCalls = [];
  globalThis.chrome = {
    runtime: { id: "test" }, // NS.contextAlive() -> true
    storage: {
      local: {
        async set(obj) {
          setCalls.push(obj);
          if (rejectSet) return Promise.reject(new Error("quota"));
          Object.assign(store, obj);
        },
        async remove(key) {
          removeCalls.push(key);
          delete store[key];
        }
      }
    }
  };

  const self = { __SBSKIP__: {} };
  const NS = self.__SBSKIP__;
  // Real config for NS.STORAGE.WL_PREFIX + NS.contextAlive + NS.log.
  new Function("self", readFileSync(new URL("../content/config.js", import.meta.url), "utf8"))(self);
  NS.log = () => {};

  NS.getSegments = async () => ({ ok: true, status: "found", segments: [{ start: 1, end: 2, category: "sponsor" }] });
  NS.videoTarget = { waitFor: async () => (videoNull ? null : {}) }; // fake <video>; null = no player
  NS.settings = { load: async () => {}, whitelist: async () => whitelist, get: () => ({}) };
  NS.channel = { current: () => channel };
  NS.skipEngine = { apply() {}, clear() {}, reapply() {} };
  NS.timelineMarkers = { render() {}, clear() {}, reapply() {} };
  NS.skipNotice = { clear() {} };
  let onVideo = null;
  NS.navigation = { start: (cb) => { onVideo = cb; }, currentVideoId: () => null };

  new Function("self", readFileSync(new URL("../content/content.js", import.meta.url), "utf8"))(self);
  return {
    store, setCalls, removeCalls,
    run: (id) => onVideo(id),
    ready: tick,
    setRejectSet: (v) => { rejectSet = v; } // toggle set-rejection between runs
  };
}

// 1. whitelisted channel -> record whitelisted:true
{
  const c = makeContent({ channel: "UCabc", whitelist: ["UCabc"] });
  await c.ready();
  await c.run("VIDEOaaaaaa");
  const rec = c.store["sbwl_VIDEOaaaaaa"];
  ok(rec && rec.videoId === "VIDEOaaaaaa" && rec.whitelisted === true && typeof rec.fetchedAt === "number",
     "records whitelisted:true for a whitelisted channel");
}

// 2. non-whitelisted channel -> record whitelisted:false
{
  const c = makeContent({ channel: "UCabc", whitelist: ["UCother"] });
  await c.ready();
  await c.run("VIDEObbbbbb");
  ok(c.store["sbwl_VIDEObbbbbb"].whitelisted === false, "records whitelisted:false for a non-whitelisted channel");
}

// 3. unreadable channel (null) -> fail-open equivalence: recorded false, same as the skip path
{
  const c = makeContent({ channel: null, whitelist: ["UCabc"] });
  await c.ready();
  await c.run("VIDEOcccccc");
  ok(c.store["sbwl_VIDEOcccccc"].whitelisted === false, "unreadable channel records false (fail-open)");
}

// 4. a rejected storage write must not break onVideo (fire-and-forget with .catch)
{
  const c = makeContent({ channel: "UCabc", whitelist: [], rejectSet: true });
  await c.ready();
  let threw = false;
  try { await c.run("VIDEOdddddd"); } catch { threw = true; }
  await tick(); // allow the rejected promise's .catch to settle
  ok(!threw, "a rejected storage write does not throw out of onVideo");
  ok(c.setCalls.length === 1, "the stamp write was attempted once");
}

// 5. a real navigation invalidates a stale whitelist record from a prior visit
// (videoNull so nothing is re-stamped, making the removal observable)
{
  const c = makeContent({ channel: "UCabc", whitelist: ["UCabc"], videoNull: true,
    seed: { "sbwl_VIDEOeeeeee": { videoId: "VIDEOeeeeee", whitelisted: false, fetchedAt: 1 } } });
  await c.ready();
  await c.run("VIDEOeeeeee");
  ok(!("sbwl_VIDEOeeeeee" in c.store), "a real navigation clears the stale whitelist record (popup -> checking)");
}

// 6. no <video> bound -> the decision is NOT published (enforcement is inert; popup stays checking)
{
  const c = makeContent({ channel: "UCabc", whitelist: ["UCabc"], videoNull: true });
  await c.ready();
  await c.run("VIDEOffffff");
  ok(!("sbwl_VIDEOffffff" in c.store), "no video target -> no whitelist record stamped");
}

// 7. a failed re-stamp leaves NO stale record: the nav invalidate removed it first,
// so a rejected set can't leave the previous (now-wrong) decision authoritative
{
  const c = makeContent({ channel: "UCabc", whitelist: [], rejectSet: true,
    seed: { "sbwl_VIDEOgggggg": { videoId: "VIDEOgggggg", whitelisted: true, fetchedAt: 1 } } });
  await c.ready();
  await c.run("VIDEOgggggg");
  await tick();
  ok(!("sbwl_VIDEOgggggg" in c.store), "a failed re-stamp does not leave the stale decision behind");
}

// 8. same-video whitelist re-eval (videoId === lastVideoId, invalidation SKIPPED) with a rejected
// re-stamp still drops the record — the set-failure fallback, not the nav invalidate, protects here
{
  const c = makeContent({ channel: "UCabc", whitelist: ["UCabc"] });
  await c.ready();
  await c.run("VIDEOhhhhhh"); // real nav -> stamps whitelisted:true
  ok(c.store["sbwl_VIDEOhhhhhh"] && c.store["sbwl_VIDEOhhhhhh"].whitelisted === true, "initial same-video stamp present");
  c.setRejectSet(true);
  await c.run("VIDEOhhhhhh"); // same-video re-eval: clear block skipped; the re-stamp rejects
  await tick();
  ok(!("sbwl_VIDEOhhhhhh" in c.store), "a failed same-video re-stamp drops the record (popup -> checking)");
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
