// Headless: the new showTimelineMarkers setting survives EVERY read-fresh merge
// path — the shared store (popup + options) and the content-side client — so a
// write from one surface can't silently drop the flag. Run: node tests/settings.test.mjs
import { readFileSync } from "node:fs";
import { mergeSettings } from "../shared/settingsStore.js";
import { DEFAULT_SETTINGS } from "../shared/categories.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// --- shared/settingsStore.mergeSettings (popup + options read path) ---
ok(DEFAULT_SETTINGS.showTimelineMarkers === true, "DEFAULT_SETTINGS default is true");
ok(mergeSettings({}).showTimelineMarkers === true, "shared: absent -> default true");
ok(mergeSettings({ showTimelineMarkers: false }).showTimelineMarkers === false, "shared: false preserved");
ok(mergeSettings({ enabled: false }).showTimelineMarkers === true, "shared: other-field write keeps default");
ok(
  mergeSettings(mergeSettings({ showTimelineMarkers: false })).showTimelineMarkers === false,
  "shared: survives a read-fresh re-merge (write-back round-trip)"
);

// --- shared: showSkipNotice survives the same read-fresh merge paths ---
ok(DEFAULT_SETTINGS.showSkipNotice === true, "DEFAULT_SETTINGS.showSkipNotice default is true");
ok(mergeSettings({}).showSkipNotice === true, "shared: absent showSkipNotice -> default true");
ok(mergeSettings({ showSkipNotice: false }).showSkipNotice === false, "shared: showSkipNotice false preserved");
ok(mergeSettings({ enabled: false }).showSkipNotice === true, "shared: other-field write keeps showSkipNotice default");
ok(mergeSettings(mergeSettings({ showSkipNotice: false })).showSkipNotice === false, "shared: showSkipNotice survives a read-fresh re-merge");

// --- shared: the language field survives the same read-fresh merge paths ---
ok(DEFAULT_SETTINGS.language === "en", "DEFAULT_SETTINGS.language default is en");
ok(mergeSettings({}).language === "en", "shared: absent language -> default en");
ok(mergeSettings({ language: "ru" }).language === "ru", "shared: language preserved");
ok(mergeSettings({ enabled: false }).language === "en", "shared: other-field write keeps default language");
ok(mergeSettings(mergeSettings({ language: "uk" })).language === "uk", "shared: language survives a read-fresh re-merge");

// --- shared: the browser-locale hint fills the gap, an explicit choice outranks it ---
ok(mergeSettings({}, "uk").language === "uk", "shared: no choice -> the hint applies");
ok(mergeSettings({ language: "ru" }, "uk").language === "ru", "shared: an explicit choice beats the hint");
ok(mergeSettings({ language: "en" }, "uk").language === "en", "shared: an explicit en beats the hint (not re-detected)");
ok(mergeSettings({}, undefined).language === "en", "shared: no choice, no hint -> en");
// The hint must not leak into any other field, and a re-merge of a merged object
// (the write-back round trip) must not treat the resolved language as a hint.
ok(mergeSettings({ enabled: false }, "uk").enabled === false, "shared: the hint does not disturb other fields");

// --- shared: minSegmentLength default is 3 (segments shorter are ignored); 0 still means skip-all ---
ok(DEFAULT_SETTINGS.minSegmentLength === 3, "DEFAULT_SETTINGS.minSegmentLength default is 3");
ok(mergeSettings({}).minSegmentLength === 3, "shared: absent minSegmentLength -> default 3");
ok(mergeSettings({ minSegmentLength: 0 }).minSegmentLength === 0, "shared: explicit 0 (skip all) preserved");
ok(mergeSettings({ minSegmentLength: 10 }).minSegmentLength === 10, "shared: explicit minSegmentLength preserved");

// --- the hint must never be PERSISTED into synced settings ---
// mergeSettings resolves the hint so the UI shows the right language, and
// updateSettings writes its merged result back — so without care, toggling any
// unrelated checkbox would bake this machine's browser locale into sync and push
// it onto the user's other machines. Only an explicit choice may be stored.
{
  const sync = {};
  const local = { languageHint: "uk" };
  globalThis.chrome = {
    storage: {
      sync: {
        async get(k) { return k in sync ? { [k]: sync[k] } : {}; },
        async set(o) { Object.assign(sync, o); }
      },
      local: { async get(k) { return k in local ? { [k]: local[k] } : {}; } }
    }
  };
  const { updateSettings, chooseLanguage } = await import("../shared/settingsStore.js");

  const view = await updateSettings((s) => { s.categories.intro = false; });
  ok(sync.settings.language === undefined,
     "store: an unrelated write does NOT persist the hint (it stays machine-local)");
  ok(sync.settings.categories.intro === false, "store: the unrelated write itself persisted");
  ok(view.language === "uk", "store: the caller still sees the hint-resolved language");

  const chosen = await chooseLanguage("ru");
  ok(sync.settings.language === "ru", "store: chooseLanguage persists an explicit choice");
  ok(chosen.language === "ru", "store: chooseLanguage returns the new language");

  await updateSettings((s) => { s.enabled = false; });
  ok(sync.settings.language === "ru", "store: a later unrelated write keeps the explicit choice");

  // Explicitly picking the language that merely matched the hint must still
  // record a choice, or a later browser-locale change would silently move them.
  const sync2 = {};
  const local2 = { languageHint: "uk" };
  globalThis.chrome.storage.sync = {
    async get(k) { return k in sync2 ? { [k]: sync2[k] } : {}; },
    async set(o) { Object.assign(sync2, o); }
  };
  globalThis.chrome.storage.local = { async get(k) { return k in local2 ? { [k]: local2[k] } : {}; } };
  await chooseLanguage("uk");
  ok(sync2.settings.language === "uk", "store: choosing the same language as the hint still records a choice");
  delete globalThis.chrome;
}

// --- content/settingsClient merge (content read path) ---
const self = { __SBSKIP__: {} };
const syncStore = {};
const localStore = {};
const chrome = {
  storage: {
    sync: { async get(k) { return k in syncStore ? { [k]: syncStore[k] } : {}; } },
    // The content client also reads the install-time browser-locale language hint.
    local: { async get(k) { return k in localStore ? { [k]: localStore[k] } : {}; } },
    onChanged: { addListener() {} }
  }
};
const load = (f) =>
  new Function("self", "chrome", readFileSync(new URL("../content/" + f, import.meta.url), "utf8"))(self, chrome);
load("config.js");         // NS.DEFAULTS (default true), NS.STORAGE
load("settingsClient.js"); // NS.settings.load/get with the merge()

await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().showTimelineMarkers === true, "content: nothing stored -> default true");

syncStore["settings"] = { showTimelineMarkers: false };
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().showTimelineMarkers === false, "content: stored false preserved");

syncStore["settings"] = { enabled: false }; // partial object missing the flag
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().showTimelineMarkers === true, "content: partial settings -> default true");

syncStore["settings"] = { showSkipNotice: false };
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().showSkipNotice === false, "content: stored showSkipNotice false preserved");

syncStore["settings"] = { enabled: false }; // partial object, missing showSkipNotice
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().showSkipNotice === true, "content: partial settings -> showSkipNotice default true");

// content: the language field, same merge path
syncStore["settings"] = { language: "ru" };
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "ru", "content: stored language preserved");

syncStore["settings"] = { enabled: false }; // partial object, no language
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "en", "content: partial settings -> default language en");

// content: the browser-locale hint applies until an explicit choice exists, so
// the tooltip/skip-notice follow the same precedence as the popup and options.
localStore["languageHint"] = "uk";
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "uk", "content: no choice -> the hint applies");

syncStore["settings"] = { language: "ru" };
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "ru", "content: an explicit choice beats the hint");

// A sync change record re-merges against the cached hint rather than dropping it.
delete syncStore["settings"];
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "uk", "content: hint still applies after a reload with no choice");
delete localStore["languageHint"];

// --- content: a language-ONLY change must NOT trigger onSettingsChanged (which
//     resets the skip cooldown); a skip/marker-relevant change must ---
{
  const self2 = { __SBSKIP__: {} };
  let captured = null;
  const store2 = {};
  const chrome2 = {
    storage: {
      sync: { async get(k) { return k in store2 ? { [k]: store2[k] } : {}; } },
      local: { async get() { return {}; } },
      onChanged: { addListener(fn) { captured = fn; } }
    }
  };
  const load2 = (f) =>
    new Function("self", "chrome", readFileSync(new URL("../content/" + f, import.meta.url), "utf8"))(self2, chrome2);
  load2("config.js");
  load2("settingsClient.js");

  const base = { ...DEFAULT_SETTINGS, categories: { ...DEFAULT_SETTINGS.categories }, language: "en" };
  store2["settings"] = base;
  await self2.__SBSKIP__.settings.load(); // seed cache = base

  let fired = 0;
  self2.__SBSKIP__.onSettingsChanged = () => { fired++; };
  const fire = (newValue) => captured({ settings: { newValue } }, "sync");

  fire({ ...base, language: "ru" });
  ok(fired === 0, "content: language-only change does NOT reapply (no onSettingsChanged)");
  ok(self2.__SBSKIP__.settings.get().language === "ru", "content: cache still updates to the new language");

  fire({ ...base, language: "ru", enabled: false });
  ok(fired === 1, "content: enabled change reapplies");

  fire({ ...base, language: "ru", enabled: false, categories: { ...base.categories, sponsor: false } });
  ok(fired === 2, "content: category change reapplies");

  fire({ ...base, language: "ru", enabled: false, categories: { ...base.categories, sponsor: false }, showTimelineMarkers: false });
  ok(fired === 3, "content: showTimelineMarkers change reapplies");

  // showSkipNotice is read live at skip time, NOT via affectsContent — a change to
  // it must update the cache but NOT reapply (which would reset the skip cooldown).
  // Turning it OFF while a notice is on screen hides that notice via a direct
  // skipNotice.clear() (no reapply); turning it ON clears nothing.
  let noticeCleared = 0;
  self2.__SBSKIP__.skipNotice = { clear: () => { noticeCleared++; } };
  fire({ ...base, language: "ru", enabled: false, categories: { ...base.categories, sponsor: false }, showTimelineMarkers: false, showSkipNotice: false });
  ok(fired === 3, "content: showSkipNotice change does NOT reapply (not in affectsContent)");
  ok(self2.__SBSKIP__.settings.get().showSkipNotice === false, "content: cache still updates showSkipNotice");
  ok(noticeCleared === 1, "content: turning showSkipNotice OFF clears the on-screen notice");

  fire({ ...base, language: "ru", enabled: false, categories: { ...base.categories, sponsor: false }, showTimelineMarkers: false, showSkipNotice: true });
  ok(noticeCleared === 1, "content: turning showSkipNotice ON does not call clear()");
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
