// Headless: content/segmentFilter.js filterActive — the SINGLE source of truth
// for which segments are skipped (and thus drawn). Loads the REAL classic content
// module into a synthetic namespace. Run: node tests/segmentFilter.test.mjs
import { readFileSync } from "node:fs";

const self = { __SBSKIP__: {} };
new Function(
  "self",
  readFileSync(new URL("../content/segmentFilter.js", import.meta.url), "utf8")
)(self);
const { filterActive } = self.__SBSKIP__.segmentFilter;

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", got, "want", want); fails++; }
  else console.log("[PASS]", msg);
};

const raw = [
  { start: 10, end: 20, category: "sponsor" },   // 10s
  { start: 30, end: 34, category: "selfpromo" }, // 4s
  { start: 50, end: 60, category: "intro" }      // 10s, off by default
];
const base = {
  enabled: true,
  categories: { sponsor: true, selfpromo: true, intro: false },
  minSegmentLength: 0
};

eq(filterActive(raw, base, false).length, 2, "enabled cats only (intro off) -> 2");
eq(filterActive(raw, base, true).length, 0, "whitelisted -> 0");
eq(filterActive(raw, { ...base, enabled: false }, false).length, 0, "master disabled -> 0");
eq(
  filterActive(raw, { ...base, categories: { sponsor: false, selfpromo: true, intro: false } }, false).length,
  1,
  "sponsor off -> 1 (selfpromo)"
);
eq(filterActive(raw, { ...base, minSegmentLength: 5 }, false).length, 1, "minLen 5 drops the 4s selfpromo -> 1");

// Documented live fixture: a 64.21s sponsor segment. It must be EXCLUDED at
// minSegmentLength 65 (proving marker set == skip set at the boundary) and
// INCLUDED at 64.
const fixture = [{ start: 80.94, end: 145.15, category: "sponsor" }]; // 64.21s
eq(
  filterActive(fixture, { enabled: true, categories: { sponsor: true }, minSegmentLength: 65 }, false).length,
  0,
  "fixture 64.21s vs minLen 65 -> excluded (matches non-skip)"
);
eq(
  filterActive(fixture, { enabled: true, categories: { sponsor: true }, minSegmentLength: 64 }, false).length,
  1,
  "fixture 64.21s vs minLen 64 -> included"
);
eq(filterActive([], base, false).length, 0, "empty raw -> 0");
eq(filterActive(raw, null, false).length, 0, "no settings -> 0");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
