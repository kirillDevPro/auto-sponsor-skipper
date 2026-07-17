// Headless: background/firstRunLanguage.js — seeding settings.language from the
// browser UI locale on first run. The tests that matter are the ones proving it
// NEVER overwrites a language the user (or Chrome Sync) already put there, and
// never breaks install when detection fails.
//
// The UI locales driven here are derived from the CATALOG, not hardcoded: this
// file tests the seeding rules, and must not start failing the day a particular
// language does or does not ship. background/uiLanguage.js owns the mapping
// itself, and tests/uiLanguage.test.mjs pins it against the full 27-code set.
//
// Run: node tests/firstRunLanguage.test.mjs
import { SETTINGS_KEY } from "../shared/categories.js";
import { LANGUAGE_CODES, FALLBACK } from "../shared/languages.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// A fake chrome: records every sync write and lets each test pick the stored
// value and the reported UI locale.
let store, writes, listener, uiLanguage, getUILanguageThrows, getThrows;
function installFakeChrome() {
  store = {};
  writes = [];
  listener = null;
  uiLanguage = "en-US";
  getUILanguageThrows = false;
  getThrows = false;
  globalThis.chrome = {
    runtime: { onInstalled: { addListener: (fn) => { listener = fn; } } },
    i18n: { getUILanguage: () => { if (getUILanguageThrows) throw new Error("boom"); return uiLanguage; } },
    storage: {
      sync: {
        async get(k) { if (getThrows) throw new Error("storage down"); return (k in store) ? { [k]: store[k] } : {}; },
        async set(obj) { writes.push(JSON.parse(JSON.stringify(obj))); Object.assign(store, obj); }
      }
    }
  };
}

installFakeChrome();
const { registerFirstRunLanguage } = await import("../background/firstRunLanguage.js");

// The listener is registered at import/registration time, synchronously — an MV3
// listener added later than the first tick can miss the event that woke the worker.
registerFirstRunLanguage();
ok(typeof listener === "function", "registers an onInstalled listener synchronously");

/**
 * Drive one onInstalled event to completion.
 * @param {object} details - the onInstalled details ({reason}).
 * @returns {Promise<void>}
 */
async function fire(details) {
  listener(details);
  await new Promise((r) => setTimeout(r, 0)); // let the async continuation settle
}

const langOf = () => (store[SETTINGS_KEY] || {}).language;

// Two shipped non-fallback languages to drive detection with, whatever ships.
const [SEED_A, SEED_B] = LANGUAGE_CODES.filter((c) => c !== FALLBACK);
ok(typeof SEED_A === "string" && typeof SEED_B === "string",
   "fixture: the catalog ships at least two non-fallback languages");

// --- fresh install, nothing stored: detect and write ---
installFakeChrome();
registerFirstRunLanguage();
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(langOf() === SEED_A, "install + empty storage: writes the detected language (" + SEED_A + ")");
ok(writes.length === 1, "install: writes exactly once");

// --- fresh install, Chrome Sync already restored an explicit choice: DO NOT touch ---
// The clobber guard. A second machine can have settings synced in before
// onInstalled runs; overwriting there would silently undo the user's choice.
installFakeChrome();
registerFirstRunLanguage();
store[SETTINGS_KEY] = { language: "fr", enabled: true };
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(langOf() === "fr", "install + synced language: leaves the stored choice alone");
ok(writes.length === 0, "install + synced language: writes nothing");

// --- an explicitly chosen fallback must survive a non-English browser ---
// The value it would be detected AS is indistinguishable from a real choice, so
// the guard is what protects it.
installFakeChrome();
registerFirstRunLanguage();
store[SETTINGS_KEY] = { language: FALLBACK };
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(langOf() === FALLBACK, "install + explicit " + FALLBACK + ": not re-detected to " + SEED_A);
ok(writes.length === 0, "install + explicit " + FALLBACK + ": writes nothing");

// --- stored settings WITHOUT a language: fill it in, keep the other fields ---
installFakeChrome();
registerFirstRunLanguage();
store[SETTINGS_KEY] = { enabled: false, minSegmentLength: 12 };
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(langOf() === SEED_A, "install + settings without language: writes the detected language");
ok(store[SETTINGS_KEY].enabled === false && store[SETTINGS_KEY].minSegmentLength === 12,
   "install: preserves the other stored fields (raw merge, not a settings rebuild)");

// --- update, user predates the language selector (no language stored): seed it ---
installFakeChrome();
registerFirstRunLanguage();
store[SETTINGS_KEY] = { enabled: true };
uiLanguage = SEED_B;
await fire({ reason: "update" });
ok(langOf() === SEED_B, "update + no language stored: seeds the detected language");

// --- update with a language already stored: never touched ---
installFakeChrome();
registerFirstRunLanguage();
store[SETTINGS_KEY] = { language: SEED_B };
uiLanguage = SEED_A;
await fire({ reason: "update" });
ok(langOf() === SEED_B, "update + stored language: left alone");
ok(writes.length === 0, "update + stored language: writes nothing");

// --- reasons that are not ours ---
for (const reason of ["chrome_update", "shared_module_update"]) {
  installFakeChrome();
  registerFirstRunLanguage();
  uiLanguage = SEED_A;
  await fire({ reason });
  ok(writes.length === 0, "reason " + reason + ": writes nothing");
}

// --- unsupported UI locale -> the fallback, still a shipped code ---
installFakeChrome();
registerFirstRunLanguage();
uiLanguage = "vi-VN";
await fire({ reason: "install" });
ok(langOf() === FALLBACK, "install + unsupported UI locale: falls back to " + FALLBACK);
ok(LANGUAGE_CODES.includes(langOf()), "install: the seeded language is always a shipped code");

// --- detection failure must never escape into the install path ---
installFakeChrome();
registerFirstRunLanguage();
getUILanguageThrows = true;
let threw = false;
try { await fire({ reason: "install" }); } catch { threw = true; }
ok(!threw, "getUILanguage throwing does not reject into the install path");
ok(writes.length === 0, "getUILanguage throwing: writes nothing");

installFakeChrome();
registerFirstRunLanguage();
getThrows = true;
threw = false;
try { await fire({ reason: "install" }); } catch { threw = true; }
ok(!threw, "a storage read failure does not reject into the install path");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
