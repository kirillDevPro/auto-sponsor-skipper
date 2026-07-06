// Headless: cache TTL per status, stale miss, and oldest-first prune.
// Mocks chrome.storage.local in memory. Run: node tests/cache.test.mjs
const store = {};
globalThis.chrome = {
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

const { getCached, setCached } = await import("../background/cache.js");
const { CACHE_PREFIX, CACHE_MAX_ENTRIES } = await import("../background/constants.js");

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const T0 = 1_000_000_000_000;
const H = 3600 * 1000, D = 24 * H;

await setCached("vid1", "found", [{ start: 1, end: 2, category: "sponsor" }], T0);
ok((await getCached("vid1", T0 + 1000))?.status === "found", "found: fresh hit");
ok((await getCached("vid1", T0 + 8 * D)) === null, "found: expires after 7d");

await setCached("vid2", "empty", [], T0);
ok((await getCached("vid2", T0 + 11 * H))?.status === "empty", "empty: fresh within 12h");
ok((await getCached("vid2", T0 + 13 * H)) === null, "empty: expires after 12h");

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

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
