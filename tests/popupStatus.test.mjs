// Headless: popup/popupStatus.js — watch-URL videoId parsing + the honest-status
// decision (entry + settings + tri-state whitelist -> reason key/count, over all 8
// precedence branches incl. the too-short vs category-off relaxation and hook) +
// the GET_SEGMENTS message-type and cache-key cross-tree guards.
// ASCII-only (asserts i18n KEYS, never localized text). Run: node tests/popupStatus.test.mjs
import { readFileSync } from "node:fs";
import { watchVideoIdFromUrl, statusView } from "../popup/popupStatus.js";
import { MSG_GET_SEGMENTS } from "../shared/messaging.js";
import { cacheKey, CACHE_PREFIX } from "../shared/videoCache.js";
import en from "../shared/messages/en.js";

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", JSON.stringify(got), "want", JSON.stringify(want)); fails++; }
  else console.log("[PASS]", msg);
};
const view = (entry, settings, whitelisted, wantKey, wantCount, msg) => {
  const v = statusView(entry, settings, whitelisted);
  eq(v.key, wantKey, msg + " (key)");
  eq(v.count, wantCount, msg + " (count)");
};

// --- watchVideoIdFromUrl ---
eq(watchVideoIdFromUrl("https://www.youtube.com/watch?v=5GKIUKsrnKo"), "5GKIUKsrnKo", "watch URL -> videoId");
eq(watchVideoIdFromUrl("https://www.youtube.com/watch?v=5GKIUKsrnKo&t=80s"), "5GKIUKsrnKo", "watch URL + extra params -> videoId");
eq(watchVideoIdFromUrl("https://www.youtube.com/watch?list=PL123&v=5GKIUKsrnKo"), "5GKIUKsrnKo", "v not first param -> videoId");
eq(watchVideoIdFromUrl("https://www.youtube.com/watch?v=abc"), null, "short v -> null");
eq(watchVideoIdFromUrl("https://www.youtube.com/watch"), null, "no v param -> null");
eq(watchVideoIdFromUrl("https://www.youtube.com/"), null, "home page -> null");
eq(watchVideoIdFromUrl("https://www.youtube.com/shorts/5GKIUKsrnKo"), null, "shorts -> null");
eq(watchVideoIdFromUrl("https://music.youtube.com/watch?v=5GKIUKsrnKo"), null, "music subdomain -> null");
eq(watchVideoIdFromUrl("https://m.youtube.com/watch?v=5GKIUKsrnKo"), null, "m subdomain -> null");
eq(watchVideoIdFromUrl("https://example.com/watch?v=5GKIUKsrnKo"), null, "other host -> null");
eq(watchVideoIdFromUrl("chrome://extensions"), null, "chrome page -> null");
eq(watchVideoIdFromUrl(undefined), null, "undefined -> null");
eq(watchVideoIdFromUrl(null), null, "null -> null");
eq(watchVideoIdFromUrl(""), null, "empty string -> null");
eq(watchVideoIdFromUrl("not a url"), null, "garbage -> null");

// --- statusView: reason precedence over the 8 branches ---
const ON = { enabled: true, categories: { sponsor: true, intro: false }, minSegmentLength: 5 };
const foundLong = { status: "found", segments: [{ start: 10, end: 40, category: "sponsor" }] }; // 30s sponsor

// 1. master off outranks everything (no data needed)
view(foundLong, { enabled: false, categories: { sponsor: true }, minSegmentLength: 0 }, false,
     "popup_status_off", null, "master off -> off");
view(foundLong, { enabled: false, categories: { sponsor: true } }, true,
     "popup_status_off", null, "master off outranks whitelisted");
// 2. whitelisted (recorded true) outranks all segment reasons
view(foundLong, ON, true, "popup_status_whitelisted", null, "whitelisted -> whitelisted");
// 3. channel decision not recorded yet (null/undefined) -> checking, never a guess
view(foundLong, ON, null, "popup_status_checking", null, "channel unknown (null) -> checking");
view(foundLong, ON, undefined, "popup_status_checking", null, "channel unknown (undefined) -> checking");
// 4. channel known-not-whitelisted but segments not loaded -> checking
view(null, ON, false, "popup_status_checking", null, "no entry -> checking");
view(undefined, ON, false, "popup_status_checking", null, "undefined entry -> checking");
// 5. load error / unknown status
view({ status: "error" }, ON, false, "popup_status_error", null, "error -> error");
view({ status: "weird" }, ON, false, "popup_status_error", null, "unknown status -> error (defensive)");
// 6. no segments
view({ status: "empty", segments: [] }, ON, false, "popup_status_none", null, "empty -> none");
view({ status: "found", segments: [] }, ON, false, "popup_status_none", null, "found w/ 0 segments -> none (defensive)");
// 7. will skip N (count == active length)
view(foundLong, ON, false, "popup_status_will_skip", 1, "one long sponsor -> will skip 1");
view({ status: "found", segments: [
        { start: 10, end: 40, category: "sponsor" },
        { start: 60, end: 90, category: "sponsor" }
     ] }, ON, false, "popup_status_will_skip", 2, "two long sponsors -> will skip 2");
// 8a. too short — an ENABLED segment eaten only by minSegmentLength
view({ status: "found", segments: [{ start: 0, end: 2, category: "sponsor" }] }, ON, false,
     "popup_status_too_short", null, "short enabled sponsor -> too short");
// 8a-mixed (Codex lens A): enabled-short + disabled-long must still read "too short", and the
// reworded copy ("Enabled segments are below...") stays truthful about the enabled one.
view({ status: "found", segments: [
        { start: 0, end: 1, category: "sponsor" }, // enabled, 1s < min 3
        { start: 5, end: 15, category: "intro" }   // disabled, 10s
     ] }, { enabled: true, categories: { sponsor: true, intro: false }, minSegmentLength: 3 }, false,
     "popup_status_too_short", null, "mixed enabled-short + disabled-long -> too short");
// 8b. category off — nothing passes even with the length filter relaxed
view({ status: "found", segments: [{ start: 0, end: 50, category: "intro" }] },
     { enabled: true, categories: { sponsor: true, intro: false }, minSegmentLength: 0 }, false,
     "popup_status_category_off", null, "only a disabled category -> category off");
view({ status: "found", segments: [{ start: 0, end: 50, category: "hook" }] },
     { enabled: true, categories: { sponsor: true, hook: false }, minSegmentLength: 0 }, false,
     "popup_status_category_off", null, "hook off -> category off");
// 5b. corruption guard: a "found" entry with non-array segments is an error, not benign "none"
view({ status: "found", segments: null }, ON, false, "popup_status_error", null, "found + null segments -> error");
view({ status: "found", segments: "oops" }, ON, false, "popup_status_error", null, "found + non-array segments -> error");

// --- cross-tree drift guards ---
eq(cacheKey("abc123"), CACHE_PREFIX + "abc123", "cacheKey composes CACHE_PREFIX");

// The classic content tree can't import shared/messaging.js, so it keeps its own
// NS.MSG copy in content/config.js — guard it against the shared source of truth.
const cself = { __SBSKIP__: {} };
new Function("self", readFileSync(new URL("../content/config.js", import.meta.url), "utf8"))(cself);
eq(cself.__SBSKIP__.MSG.GET_SEGMENTS, MSG_GET_SEGMENTS, "content/config.js NS.MSG matches shared/messaging.js");

// --- every key statusView can return exists in the shared en message table
// (uk/ru parity is guarded by tests/i18n.test.mjs; this ties the consumer to it).
// Keys are collected from REAL statusView returns, one per branch, so a renamed/
// missing key is caught here rather than drifting silently. ---
const enabled0 = { enabled: true, categories: { sponsor: true, intro: false }, minSegmentLength: 0 };
const producedKeys = new Set([
  statusView(foundLong, { enabled: false }, false).key,                                   // off
  statusView(foundLong, ON, true).key,                                                    // whitelisted
  statusView(foundLong, ON, null).key,                                                    // checking
  statusView({ status: "error" }, ON, false).key,                                         // error
  statusView({ status: "empty", segments: [] }, ON, false).key,                           // none
  statusView(foundLong, ON, false).key,                                                   // will_skip
  statusView({ status: "found", segments: [{ start: 0, end: 1, category: "sponsor" }] }, ON, false).key, // too_short
  statusView({ status: "found", segments: [{ start: 0, end: 9, category: "intro" }] }, enabled0, false).key // category_off
]);
eq(producedKeys.size, 8, "statusView produces 8 distinct reason keys");
for (const k of producedKeys) eq(typeof en[k], "string", "en table has statusView key " + k);
// The old raw-count key was retired by the honest-status rewrite.
eq(en.popup_status_marked, undefined, "popup_status_marked removed from the en table");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
