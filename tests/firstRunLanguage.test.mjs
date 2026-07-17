// Headless: background/firstRunLanguage.js records the browser UI locale as a
// language HINT at install/update. The tests that matter prove it can never
// affect the user's settings: it must write only its own local key, never the
// synced settings item (a read-modify-write there would race Chrome Sync's
// restore on a fresh install and could wipe the user's other settings), and an
// explicit choice must outrank the hint.
//
// The UI locales driven here come from the CATALOG, not hardcoded: this file
// tests the recording rules; background/uiLanguage.js owns the mapping, pinned
// against all 27 codes in tests/uiLanguage.test.mjs.
//
// Run: node tests/firstRunLanguage.test.mjs
import { LANG_HINT_KEY, SETTINGS_KEY } from "../shared/categories.js";
import { mergeSettings } from "../shared/settingsStore.js";
import { LANGUAGE_CODES, FALLBACK } from "../shared/languages.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// A fake chrome recording every write, per area, so a write to the WRONG area is
// visible rather than merely absent.
let local, sync, localWrites, syncWrites, listener, uiLanguage, getUILanguageThrows, setThrows;
function installFakeChrome() {
  local = {}; sync = {};
  localWrites = []; syncWrites = [];
  listener = null;
  uiLanguage = "en-US";
  getUILanguageThrows = false;
  setThrows = false;
  globalThis.chrome = {
    runtime: { onInstalled: { addListener: (fn) => { listener = fn; } } },
    i18n: { getUILanguage: () => { if (getUILanguageThrows) throw new Error("boom"); return uiLanguage; } },
    storage: {
      sync: {
        async get(k) { return (k in sync) ? { [k]: sync[k] } : {}; },
        async set(obj) { syncWrites.push(obj); Object.assign(sync, obj); }
      },
      local: {
        async get(k) { return (k in local) ? { [k]: local[k] } : {}; },
        async set(obj) { if (setThrows) throw new Error("quota"); localWrites.push(obj); Object.assign(local, obj); }
      }
    }
  };
}

installFakeChrome();
const { registerFirstRunLanguage } = await import("../background/firstRunLanguage.js");

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

const hint = () => local[LANG_HINT_KEY];
const [SEED_A, SEED_B] = LANGUAGE_CODES.filter((c) => c !== FALLBACK);

// --- install: record the detected hint, in LOCAL, and touch nothing else ---
installFakeChrome();
registerFirstRunLanguage();
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(hint() === SEED_A, "install: records the detected language as the local hint (" + SEED_A + ")");
ok(localWrites.length === 1, "install: exactly one local write");

// THE regression this design exists for: the synced settings item is never
// written, so first-run detection cannot lose a Chrome Sync restore.
ok(syncWrites.length === 0, "install: NEVER writes chrome.storage.sync");
ok(!(SETTINGS_KEY in sync), "install: the settings item is untouched");

// --- it does not even READ the settings item (nothing to race) ---
installFakeChrome();
registerFirstRunLanguage();
let syncReads = 0;
const realSyncGet = chrome.storage.sync.get;
chrome.storage.sync.get = async (k) => { syncReads++; return realSyncGet(k); };
uiLanguage = SEED_A;
await fire({ reason: "install" });
ok(syncReads === 0, "install: never reads the synced settings item either");

// --- update: refreshes the hint (harmless: an explicit choice outranks it) ---
installFakeChrome();
registerFirstRunLanguage();
uiLanguage = SEED_B;
await fire({ reason: "update" });
ok(hint() === SEED_B, "update: records the detected language as the hint");
ok(syncWrites.length === 0, "update: still never writes sync");

// --- reasons that are not ours ---
for (const reason of ["chrome_update", "shared_module_update"]) {
  installFakeChrome();
  registerFirstRunLanguage();
  uiLanguage = SEED_A;
  await fire({ reason });
  ok(localWrites.length === 0 && syncWrites.length === 0, "reason " + reason + ": writes nothing");
}

// --- unsupported UI locale -> the fallback, still a shipped code ---
installFakeChrome();
registerFirstRunLanguage();
uiLanguage = "vi-VN";
await fire({ reason: "install" });
ok(hint() === FALLBACK, "install + unsupported UI locale: hint falls back to " + FALLBACK);
ok(LANGUAGE_CODES.includes(hint()), "install: the hint is always a shipped code");

// --- failures must never escape into the install path ---
installFakeChrome();
registerFirstRunLanguage();
getUILanguageThrows = true;
let threw = false;
try { await fire({ reason: "install" }); } catch { threw = true; }
ok(!threw, "getUILanguage throwing does not reject into the install path");
ok(localWrites.length === 0, "getUILanguage throwing: writes nothing");

installFakeChrome();
registerFirstRunLanguage();
setThrows = true;
threw = false;
try { await fire({ reason: "install" }); } catch { threw = true; }
ok(!threw, "a storage write failure does not reject into the install path");

// --- the design contract this file exists to protect ---
// Writing a separate key only works because every reader ranks an explicit
// choice above the hint; that is what replaced the old read-then-write guard.
// tests/settings.test.mjs owns the full mergeSettings precedence matrix — this
// is the one cross-check that the two halves of the design still meet.
// A settings object restored by Chrome Sync survives intact next to a hint:
// there is no longer anything for first-run detection to overwrite.
const restored = { enabled: false, minSegmentLength: 42, language: SEED_B, categories: { sponsor: false } };
const merged = mergeSettings(restored, SEED_A);
ok(merged.language === SEED_B && merged.enabled === false && merged.minSegmentLength === 42 &&
   merged.categories.sponsor === false,
   "merge: a Chrome-Sync-restored settings object survives intact, and its language outranks the hint");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
