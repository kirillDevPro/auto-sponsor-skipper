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

// --- shared: the language field survives the same read-fresh merge paths ---
ok(DEFAULT_SETTINGS.language === "en", "DEFAULT_SETTINGS.language default is en");
ok(mergeSettings({}).language === "en", "shared: absent language -> default en");
ok(mergeSettings({ language: "ru" }).language === "ru", "shared: language preserved");
ok(mergeSettings({ enabled: false }).language === "en", "shared: other-field write keeps default language");
ok(mergeSettings(mergeSettings({ language: "uk" })).language === "uk", "shared: language survives a read-fresh re-merge");

// --- shared: minSegmentLength default is 3 (segments shorter are ignored); 0 still means skip-all ---
ok(DEFAULT_SETTINGS.minSegmentLength === 3, "DEFAULT_SETTINGS.minSegmentLength default is 3");
ok(mergeSettings({}).minSegmentLength === 3, "shared: absent minSegmentLength -> default 3");
ok(mergeSettings({ minSegmentLength: 0 }).minSegmentLength === 0, "shared: explicit 0 (skip all) preserved");
ok(mergeSettings({ minSegmentLength: 10 }).minSegmentLength === 10, "shared: explicit minSegmentLength preserved");

// --- content/settingsClient merge (content read path) ---
const self = { __SBSKIP__: {} };
const syncStore = {};
const chrome = {
  storage: {
    sync: { async get(k) { return k in syncStore ? { [k]: syncStore[k] } : {}; } },
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

// content: the language field, same merge path
syncStore["settings"] = { language: "ru" };
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "ru", "content: stored language preserved");

syncStore["settings"] = { enabled: false }; // partial object, no language
await self.__SBSKIP__.settings.load();
ok(self.__SBSKIP__.settings.get().language === "en", "content: partial settings -> default language en");

// --- content: a language-ONLY change must NOT trigger onSettingsChanged (which
//     resets the skip cooldown); a skip/marker-relevant change must ---
{
  const self2 = { __SBSKIP__: {} };
  let captured = null;
  const store2 = {};
  const chrome2 = {
    storage: {
      sync: { async get(k) { return k in store2 ? { [k]: store2[k] } : {}; } },
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
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
