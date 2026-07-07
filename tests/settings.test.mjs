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

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
