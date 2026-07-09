// Headless: popup/popupStatus.js — watch-URL videoId parsing + cache-entry ->
// status mapping + the GET_SEGMENTS message-type and cache-key cross-tree guards.
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
const view = (entry, wantKey, wantCount, msg) => {
  const v = statusView(entry);
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

// --- statusView ---
view(null, "popup_status_checking", null, "missing entry -> checking");
view(undefined, "popup_status_checking", null, "undefined entry -> checking");
view({ status: "found", segments: [{}, {}, {}] }, "popup_status_marked", 3, "found -> marked with count");
view({ status: "found", segments: [{}] }, "popup_status_marked", 1, "found single -> marked 1");
view({ status: "empty", segments: [] }, "popup_status_none", null, "empty -> none");
view({ status: "error" }, "popup_status_error", null, "error -> error");
view({ status: "found", segments: [] }, "popup_status_none", null, "found w/ 0 segments -> none (defensive)");
view({ status: "weird" }, "popup_status_error", null, "unknown status -> error (defensive)");

// --- cross-tree drift guards ---
eq(cacheKey("abc123"), CACHE_PREFIX + "abc123", "cacheKey composes CACHE_PREFIX");

// The classic content tree can't import shared/messaging.js, so it keeps its own
// NS.MSG copy in content/config.js — guard it against the shared source of truth.
const cself = { __SBSKIP__: {} };
new Function("self", readFileSync(new URL("../content/config.js", import.meta.url), "utf8"))(cself);
eq(cself.__SBSKIP__.MSG.GET_SEGMENTS, MSG_GET_SEGMENTS, "content/config.js NS.MSG matches shared/messaging.js");

// --- every key statusView can return exists in the shared en message table
// (uk/ru parity is guarded by tests/i18n.test.mjs; this ties the consumer to it) ---
const statusKeys = [
  statusView(null).key,
  statusView({ status: "found", segments: [{}] }).key,
  statusView({ status: "empty" }).key,
  statusView({ status: "error" }).key
];
for (const k of statusKeys) eq(typeof en[k], "string", "en table has statusView key " + k);

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
