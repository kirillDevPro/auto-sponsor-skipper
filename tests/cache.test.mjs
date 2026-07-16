// Headless: cache TTL per status, stale miss, and oldest-first per-prefix prune
// (segment cache AND the sbwl_ whitelist-decision records). Mocks chrome.storage.local
// in memory, with getKeys() so the real (getKeys) prune path is exercised — one case
// deletes it to cover the get(null) fallback too. Run: node tests/cache.test.mjs
const store = {};
globalThis.chrome = {
  storage: {
    local: {
      async get(k) {
        if (k === null || k === undefined) return { ...store };
        if (Array.isArray(k)) { const o = {}; for (const key of k) if (key in store) o[key] = store[key]; return o; }
        return k in store ? { [k]: store[k] } : {};
      },
      async getKeys() { return Object.keys(store); },
      async set(obj) { Object.assign(store, obj); },
      async remove(keys) { (Array.isArray(keys) ? keys : [keys]).forEach((x) => delete store[x]); }
    }
  }
};

const { getCached, setCached } = await import("../background/cache.js");
const { CACHE_MAX_ENTRIES } = await import("../background/constants.js");
const { CACHE_PREFIX, WL_PREFIX } = await import("../shared/videoCache.js");

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const T0 = 1_000_000_000_000;
const H = 3600 * 1000, D = 24 * H;

await setCached("vid1", "found", [{ start: 1, end: 2, category: "sponsor" }], T0);
ok((await getCached("vid1", T0 + 1000))?.status === "found", "found: fresh hit");
ok((await getCached("vid1", T0 + 8 * D)) === null, "found: expires after 7d");

await setCached("vid2", "empty", [], T0);
ok((await getCached("vid2", T0 + 60 * 1000))?.status === "empty", "empty: fresh within 90s");
ok((await getCached("vid2", T0 + 120 * 1000)) === null, "empty: expires after 90s");

await setCached("vid3", "error", [], T0);
ok((await getCached("vid3", T0 + 20 * 1000))?.status === "error", "error: fresh within 30s");
ok((await getCached("vid3", T0 + 45 * 1000)) === null, "error: expires after 30s");

ok((await getCached("missing", T0)) === null, "missing key -> null");

// --- prune: seed over the cap in isolation, then one more write triggers prune ---
for (const k of Object.keys(store)) delete store[k];
for (let i = 0; i < CACHE_MAX_ENTRIES + 1; i++) {
  store[CACHE_PREFIX + "s" + i] = { videoId: "s" + i, fetchedAt: T0 + i, status: "found", segments: [] };
}
await setCached("newest", "found", [], T0 + 9_000_000); // -> over cap by 2, prune 2 oldest
const after = await chrome.storage.local.get(null);
const cnt = Object.keys(after).filter((k) => k.startsWith(CACHE_PREFIX)).length;
ok(cnt === CACHE_MAX_ENTRIES, "prune caps at CACHE_MAX_ENTRIES (" + cnt + ")");
ok(!(CACHE_PREFIX + "s0" in after), "oldest entry pruned");
ok(CACHE_PREFIX + "newest" in after, "newest entry kept");

// --- per-prefix prune: sbwl_ is capped independently of sbseg_, in REAL write order
// (content writes sbwl_; a later segment fetch's setCached runs the shared prune) ---
for (const k of Object.keys(store)) delete store[k];
// A few segment entries, well under cap, must be untouched by the sbwl_ prune.
store[CACHE_PREFIX + "keepA"] = { videoId: "keepA", fetchedAt: T0 + 5, status: "found", segments: [] };
store[CACHE_PREFIX + "keepB"] = { videoId: "keepB", fetchedAt: T0 + 6, status: "found", segments: [] };
// One malformed record with a MISSING fetchedAt (must sort as oldest) + a full cap of valid ones.
store[WL_PREFIX + "nofetch"] = { videoId: "nofetch", whitelisted: false };
for (let i = 0; i < CACHE_MAX_ENTRIES; i++) {
  store[WL_PREFIX + "w" + i] = { videoId: "w" + i, whitelisted: false, fetchedAt: T0 + 100 + i };
}
await setCached("trigger", "found", [], T0 + 9_000_000); // a segment write triggers the shared prune
const after2 = await chrome.storage.local.get(null);
const wlCount = Object.keys(after2).filter((k) => k.startsWith(WL_PREFIX)).length;
ok(wlCount === CACHE_MAX_ENTRIES, "sbwl_ capped at CACHE_MAX_ENTRIES (" + wlCount + ")");
ok(!(WL_PREFIX + "nofetch" in after2), "sbwl_ missing-fetchedAt record pruned first (treated as oldest)");
ok(WL_PREFIX + "w" + (CACHE_MAX_ENTRIES - 1) in after2, "sbwl_ newest record kept");
ok(CACHE_PREFIX + "keepA" in after2 && CACHE_PREFIX + "keepB" in after2, "sbseg_ under cap untouched by sbwl_ prune");

// --- fallback path: with no local.getKeys, prune still caps via get(null) ---
delete chrome.storage.local.getKeys;
for (const k of Object.keys(store)) delete store[k];
for (let i = 0; i < CACHE_MAX_ENTRIES + 2; i++) {
  store[CACHE_PREFIX + "f" + i] = { videoId: "f" + i, fetchedAt: T0 + i, status: "found", segments: [] };
}
await setCached("ftrigger", "found", [], T0 + 9_000_000);
const after3 = await chrome.storage.local.get(null);
const segCount3 = Object.keys(after3).filter((k) => k.startsWith(CACHE_PREFIX)).length;
ok(segCount3 === CACHE_MAX_ENTRIES, "fallback (no getKeys) path still caps sbseg_ (" + segCount3 + ")");
ok(!(CACHE_PREFIX + "f0" in after3), "fallback path prunes the oldest");

// --- a prune failure must NOT fail the segment write (best-effort maintenance) ---
for (const k of Object.keys(store)) delete store[k];
for (let i = 0; i < CACHE_MAX_ENTRIES + 1; i++) {
  store[CACHE_PREFIX + "p" + i] = { videoId: "p" + i, fetchedAt: T0 + i, status: "found", segments: [] };
}
const realRemove = chrome.storage.local.remove;
chrome.storage.local.remove = async () => { throw new Error("remove boom"); };
let setThrew = false;
let result = null;
try {
  result = await setCached("survivor", "found", [{ start: 1, end: 9, category: "sponsor" }], T0 + 9_000_000);
} catch { setThrew = true; }
chrome.storage.local.remove = realRemove;
ok(!setThrew, "setCached resolves even when pruning throws");
ok(result && result.status === "found", "setCached returns the written entry despite a prune failure");
ok(CACHE_PREFIX + "survivor" in store, "the segment write persisted despite the prune failure");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
