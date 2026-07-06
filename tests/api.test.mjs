// Headless: URL building (encoded params, 4-char prefix) + multi-video filter
// + empty/error normalization. Uses a mock fetch; real crypto.subtle for hash.
// Run: node tests/api.test.mjs
import { fetchSegments } from "../background/sponsorBlockApi.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

function mockFetch(status, body) {
  const fn = async (url) => { fn.lastUrl = url; return { status, ok: status >= 200 && status < 300, json: async () => body }; };
  return fn;
}

// --- found (multi-video array; must pick our videoID + sort by start) ---
const body = [
  { videoID: "OTHERvideo1", segments: [{ segment: [1, 2], UUID: "x", category: "sponsor" }] },
  { videoID: "5GKIUKsrnKo", segments: [
    { segment: [145.15292, 150], UUID: "b", category: "selfpromo" },
    { segment: [80.93964, 145.15292], UUID: "a", category: "sponsor" }
  ] }
];
const f = mockFetch(200, body);
const r = await fetchSegments("5GKIUKsrnKo", f);
ok(r.status === "found", "status found");
ok(r.segments.length === 2, "two segments returned");
ok(r.segments[0].start === 80.93964, "segments sorted by start");
ok(r.segments[0].category === "sponsor" && r.segments[0].end === 145.15292, "minimal shape preserved");
ok(f.lastUrl.includes("/5f6b?"), "url uses 4-char hash prefix");
ok(f.lastUrl.includes("service=YouTube"), "service=YouTube present");
ok(f.lastUrl.includes("actionType=skip"), "actionType=skip present");
ok(/categories=%5B%22sponsor%22/.test(f.lastUrl), "categories JSON-array is URL-encoded");

// --- 404 -> empty ---
const r404 = await fetchSegments("5GKIUKsrnKo", mockFetch(404, null));
ok(r404.status === "empty" && r404.segments.length === 0, "404 normalizes to empty");

// --- 200 but no matching videoID -> empty ---
const rno = await fetchSegments("5GKIUKsrnKo", mockFetch(200, [{ videoID: "ZZZ", segments: [{ segment: [1, 2], category: "sponsor" }] }]));
ok(rno.status === "empty", "prefix hit with no matching videoID -> empty");

// --- non-404 error -> throw (caller caches "error") ---
let threw = false;
try { await fetchSegments("5GKIUKsrnKo", mockFetch(500, null)); } catch (_e) { threw = true; }
ok(threw, "HTTP 500 throws");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
