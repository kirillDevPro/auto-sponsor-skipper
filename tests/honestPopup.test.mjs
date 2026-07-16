// Headless: the release invariant for the "honest popup" — what the popup status
// line SAYS must match what enforcement DOES. The oracle is the CLASSIC content
// filter (content/segmentFilter.js), the code the skip engine actually runs, loaded
// independently of popupStatus.js (which runs the shared copy) — so this is not a
// self-comparison. For every fixture: if the popup says "will skip N", enforcement
// skips exactly N; if the popup gives any not-skipping reason, enforcement skips 0.
// Covers hook (off -> category_off, on -> will_skip) and whitelisted. ASCII-only.
// Run: node tests/honestPopup.test.mjs
import { readFileSync } from "node:fs";
import { statusView } from "../popup/popupStatus.js";

// The enforcement oracle: the real classic skip filter, loaded on its own.
const cself = { __SBSKIP__: {} };
new Function("self", readFileSync(new URL("../content/segmentFilter.js", import.meta.url), "utf8"))(cself);
const enforce = cself.__SBSKIP__.segmentFilter.filterActive;

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", JSON.stringify(got), "want", JSON.stringify(want)); fails++; }
  else console.log("[PASS]", msg);
};
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

const SKIP = "popup_status_will_skip";
const NOT_SKIPPING = new Set([
  "popup_status_off", "popup_status_whitelisted",
  "popup_status_too_short", "popup_status_category_off", "popup_status_none"
]);

// Check one fixture: the popup's verdict must agree with what enforcement does.
function check(raw, settings, whitelisted, wantKey, msg) {
  const entry = { status: raw.length ? "found" : "empty", segments: raw };
  const view = statusView(entry, settings, whitelisted);
  const enforced = enforce(raw, settings, whitelisted).length;
  eq(view.key, wantKey, msg + " (reason)");
  if (view.key === SKIP) {
    eq(view.count, enforced, msg + ": popup count == enforced count");
    ok(enforced > 0, msg + ": will_skip implies enforcement > 0");
  } else if (NOT_SKIPPING.has(view.key)) {
    eq(enforced, 0, msg + ": a not-skipping reason implies enforcement == 0");
  }
}

const ON = { enabled: true, categories: { sponsor: true, intro: false, hook: false }, minSegmentLength: 5 };
const oneSponsor = [{ start: 10, end: 40, category: "sponsor" }];              // 30s
const twoSponsors = [
  { start: 10, end: 40, category: "sponsor" },
  { start: 60, end: 90, category: "sponsor" }
];

check(oneSponsor, ON, false, SKIP, "one long sponsor -> will skip, count matches enforcement");
check(twoSponsors, ON, false, SKIP, "two long sponsors -> will skip 2, count matches enforcement");
check(oneSponsor, ON, true, "popup_status_whitelisted", "whitelisted -> not skipping, enforcement 0");
check(oneSponsor, { ...ON, enabled: false }, false, "popup_status_off", "master off -> not skipping, enforcement 0");
check([{ start: 0, end: 2, category: "sponsor" }], ON, false, "popup_status_too_short", "short sponsor -> too short, enforcement 0");
check([{ start: 0, end: 50, category: "intro" }], ON, false, "popup_status_category_off", "intro off -> category off, enforcement 0");
check([], ON, false, "popup_status_none", "no segments -> none, enforcement 0");

// hook: off by default -> category_off + enforcement 0; enabled -> will_skip + count matches.
check([{ start: 0, end: 50, category: "hook" }], ON, false, "popup_status_category_off", "hook off -> category off");
check([{ start: 0, end: 50, category: "hook" }],
      { enabled: true, categories: { sponsor: true, hook: true }, minSegmentLength: 5 }, false,
      SKIP, "hook enabled -> will skip, count matches enforcement");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
