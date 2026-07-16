// Headless: content/skipEngine.js drives a real timeupdate through the skip path
// and pins the seams the view tests can't reach: that the engine forwards the
// skipped segment's LENGTH (and category) to skipNotice.show, records that length,
// and honors the showSkipNotice gate. Loads the REAL segmentFilter so the active
// set is computed for real, not stubbed. ASCII-only. Run: node tests/skipEngine.test.mjs
import { readFileSync } from "node:fs";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// Build an engine harness with spy collaborators and a fake <video>.
function makeEngine({ showSkipNotice = true } = {}) {
  const self = { __SBSKIP__: {} };
  const NS = self.__SBSKIP__;
  NS.log = () => {};
  // Real active-set filter (not a stub), so the engine's own computeActive runs.
  new Function("self", readFileSync(new URL("../content/segmentFilter.js", import.meta.url), "utf8"))(self);
  NS.settings = { get: () => ({ enabled: true, categories: { sponsor: true }, minSegmentLength: 0, showSkipNotice }) };

  const recorded = [];
  const unrecorded = [];
  NS.skipCounter = { record: (n) => recorded.push(n), unrecord: (n) => unrecorded.push(n) };

  let shown = null;
  let showCalls = 0;
  NS.skipNotice = { show: (opts) => { showCalls++; shown = opts; }, clear: () => {} };

  // No ad overlay in the fake page.
  const doc = { querySelector: () => null };

  new Function("self", "document", readFileSync(new URL("../content/skipEngine.js", import.meta.url), "utf8"))(self, doc);

  const handlers = {};
  const video = {
    currentTime: 0,
    duration: 100,
    isConnected: true,
    addEventListener: (type, fn) => { handlers[type] = fn; }
  };
  const fire = () => handlers.timeupdate && handlers.timeupdate({ target: video });
  return { NS, video, fire, get shown() { return shown; }, get showCalls() { return showCalls; }, recorded, unrecorded };
}

// A 64-second sponsor segment (10..74): the engine must forward length 64.
const raw = [{ start: 10, end: 74, category: "sponsor" }];

// 1. length + category forwarded to the notice, and the length recorded
{
  const eng = makeEngine();
  eng.NS.skipEngine.apply(eng.video, raw, { whitelisted: false });
  eng.video.currentTime = 20; // inside the segment
  eng.fire();
  ok(eng.video.currentTime === 74, "engine seeks to the segment end");
  ok(eng.shown && eng.shown.category === "sponsor", "notice receives the category");
  ok(eng.shown && eng.shown.length === 64, "notice receives the segment length (end - start)");
  ok(eng.recorded.length === 1 && eng.recorded[0] === 64, "the skipped length is recorded once");
  ok(typeof eng.shown.onUndo === "function", "notice receives an onUndo callback");
}

// 2. onUndo reverses the stat by the same length and seeks back to the segment start
{
  const eng = makeEngine();
  eng.NS.skipEngine.apply(eng.video, raw, { whitelisted: false });
  eng.video.currentTime = 20;
  eng.fire();
  eng.shown.onUndo();
  ok(eng.video.currentTime === 10, "onUndo seeks back to the segment start");
  ok(eng.unrecorded.length === 1 && eng.unrecorded[0] === 64, "onUndo reverses the same length");
}

// 3. showSkipNotice OFF: still skips + records, but shows no notice
{
  const eng = makeEngine({ showSkipNotice: false });
  eng.NS.skipEngine.apply(eng.video, raw, { whitelisted: false });
  eng.video.currentTime = 20;
  eng.fire();
  ok(eng.video.currentTime === 74, "notice off: still skips");
  ok(eng.recorded.length === 1 && eng.recorded[0] === 64, "notice off: still records the length");
  ok(eng.showCalls === 0, "notice off: no notice shown");
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
