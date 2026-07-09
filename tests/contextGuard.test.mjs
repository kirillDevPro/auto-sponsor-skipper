// Headless: the "Extension context invalidated" guard. Loads the classic content
// modules (config/swClient/settingsClient) with a mocked chrome, flips the
// context to invalid (chrome.runtime.id undefined) and asserts the storage /
// messaging callers degrade silently instead of throwing. skipCounter's flush
// uses the same NS.contextAlive() primitive exercised here (it is timer-internal,
// so not driven directly). ASCII-only. Run: node tests/contextGuard.test.mjs
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// --- mocked chrome; sendCount tracks whether messaging was even attempted ---
let ctxValid = true;
let sendCount = 0;
const store = { channelWhitelist: ["UCabc"] };
globalThis.chrome = {
  runtime: {
    get id() { return ctxValid ? "test-extension-id" : undefined; },
    sendMessage(_msg, cb) { sendCount++; if (cb) cb({ ok: true, status: "empty", segments: [] }); }
  },
  storage: {
    local: { async get(k) { return k in store ? { [k]: store[k] } : {}; }, async set() {} },
    sync: { async get() { return {}; } },
    onChanged: { addListener() {} }
  }
};

// --- load the classic content tree (IIFEs attaching to self.__SBSKIP__) ---
const self = { __SBSKIP__: {} };
const load = (f) => new Function("self", read("../content/" + f))(self);
load("config.js");         // NS.contextAlive, NS.MSG, NS.STORAGE
load("swClient.js");       // NS.getSegments
load("settingsClient.js"); // NS.settings
const NS = self.__SBSKIP__;

// --- context alive: normal behavior ---
ok(NS.contextAlive() === true, "contextAlive true when chrome.runtime.id is set");
ok((await NS.settings.whitelist()).length === 1, "whitelist reads storage when context alive");
const alive = await NS.getSegments("videoid123");
ok(alive.ok === true && sendCount === 1, "getSegments sends a message when context alive");

// --- context invalidated: degrade silently, no throw, no futile messaging ---
ctxValid = false;
sendCount = 0;
ok(NS.contextAlive() === false, "contextAlive false when chrome.runtime.id is undefined");

let threw = false;
let wl;
try { wl = await NS.settings.whitelist(); } catch { threw = true; }
ok(!threw && Array.isArray(wl) && wl.length === 0, "whitelist returns [] on dead context, no throw");

threw = false;
let resp;
try { resp = await NS.getSegments("videoid123"); } catch { threw = true; }
ok(!threw && resp.ok === false && sendCount === 0, "getSegments short-circuits on dead context (no sendMessage)");

// --- genuine storage failure on a LIVE context must NOT fail open: rethrow so
// the orchestrator bails before applying skips on a whitelisted channel ---
ctxValid = true;
chrome.storage.local = { async get() { throw new Error("disk I/O error"); }, async set() {} };
threw = false;
try { await NS.settings.whitelist(); } catch { threw = true; }
ok(threw, "whitelist rethrows a genuine storage failure on a live context (fails closed)");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
