// Headless: content/timelineMarkers.js computeMarkers — the PURE core that turns
// raw segments + settings + duration into marker descriptors. Pins the core
// invariant: the drawn marker set equals the skipped set (same categories, same
// order). Loads the real classic modules (config for colors, segmentFilter,
// geometry, markers). Run: node tests/timelineMarkers.test.mjs
import { readFileSync } from "node:fs";

const self = { __SBSKIP__: {} };
const load = (f) =>
  new Function("self", readFileSync(new URL("../content/" + f, import.meta.url), "utf8"))(self);
load("config.js");           // NS.CATEGORY_COLORS, NS.DEFAULTS, NS.log
load("segmentFilter.js");    // NS.segmentFilter
load("timelineGeometry.js"); // NS.timelineGeometry
load("timelineMarkers.js");  // NS.timelineMarkers.compute
const { compute } = self.__SBSKIP__.timelineMarkers;
const { filterActive } = self.__SBSKIP__.segmentFilter;

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

const raw = [
  { start: 10, end: 20, category: "sponsor" },
  { start: 30, end: 40, category: "selfpromo" },
  { start: 50, end: 60, category: "intro" } // off by default
];
const settings = {
  enabled: true,
  showTimelineMarkers: true,
  categories: { sponsor: true, selfpromo: true, intro: false },
  minSegmentLength: 0
};
const dur = 100;

// --- invariant: marker set == skip set ---
const markers = compute(raw, settings, false, dur);
const active = filterActive(raw, settings, false);
ok(Array.isArray(markers), "markers is an array when drawable");
ok(markers.length === active.length, "marker count == active(skip) count");
ok(
  markers.map((m) => m.category).join(",") === active.map((s) => s.category).join(","),
  "same categories in the same (skip-engine) order"
);

// --- geometry + single-source color ---
ok(markers[0].startPct === 10 && markers[0].widthPct === 10, "sponsor spans 10%..20%");
ok(markers[1].startPct === 30 && markers[1].widthPct === 10, "selfpromo spans 30%..40%");
ok(markers[0].color === "#00d400", "sponsor color from the single source");
ok(markers[0].length === 10, "length carried for the tooltip");

// --- gates that must CLEAR (return []) ---
ok(compute(raw, { ...settings, showTimelineMarkers: false }, false, dur).length === 0, "markers off -> []");
ok(compute(raw, settings, true, dur).length === 0, "whitelisted -> []");
ok(compute(raw, { ...settings, enabled: false }, false, dur).length === 0, "master disabled -> []");
ok(
  compute(raw, { ...settings, categories: { sponsor: false, selfpromo: false, intro: false } }, false, dur).length === 0,
  "no category enabled -> []"
);

// --- duration not ready but segments exist -> null (defer), NOT [] ---
ok(compute(raw, settings, false, NaN) === null, "active + no duration -> null (defer to metadata)");
ok(compute(raw, settings, false, Infinity) === null, "active + live (Infinity) -> null (defer)");
// but with nothing to draw, clear regardless of duration
ok(
  compute(raw, { ...settings, showTimelineMarkers: false }, false, NaN).length === 0,
  "markers off + no duration -> [] (clear, no wait)"
);

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
