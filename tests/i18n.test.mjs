// Headless: the in-page i18n runtime + the three message tables + the content-
// tree category-name duplicate + _locales, all kept consistent. Guards: key
// parity across en/uk/ru, the t() fallback chain, formatDuration, the content
// CAT_NAMES <-> shared/messages equality, the manifest content-script ORDER, the
// "no chrome.i18n.getMessage" decommission, _locales schema + brand invariant,
// onLanguageChange dedup, getLanguage, and the required DOM hooks.
//
// ASCII-only: every Cyrillic expectation is BUILT from the imported tables, never
// typed as a literal. Run: node tests/i18n.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import en from "../shared/messages/en.js";
import uk from "../shared/messages/uk.js";
import ru from "../shared/messages/ru.js";
import { t, formatDuration, onLanguageChange, getLanguage, LANGUAGES } from "../shared/i18n.js";
import { CATEGORIES } from "../shared/categories.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const U = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(U(p), "utf8");

const TABLES = { en, uk, ru };

// --- key parity across all shipped locales ---
const enKeys = Object.keys(en).sort();
for (const lang of ["uk", "ru"]) {
  const ks = Object.keys(TABLES[lang]).sort();
  ok(ks.length === enKeys.length && ks.every((k, i) => k === enKeys[i]),
     "key parity: " + lang + " matches en exactly");
}

// --- no empty / non-string values in any table ---
for (const lang of ["en", "uk", "ru"]) {
  const empty = Object.entries(TABLES[lang]).filter(([, v]) => typeof v !== "string" || v.trim() === "");
  ok(empty.length === 0, lang + ": no empty/non-string values (" + empty.map(([k]) => k).join(",") + ")");
}

// --- LANGUAGES codes map to real tables ---
ok(LANGUAGES.length === 3 && LANGUAGES.every((l) => TABLES[l.code]), "LANGUAGES codes all have a table");

// --- every category has a message key ---
for (const cat of CATEGORIES) {
  ok(typeof en[cat.i18nKey] === "string", "en has a message for category " + cat.id + " (" + cat.i18nKey + ")");
}

// --- t(): fallback chain selected -> en -> key ---
ok(t("ru", "cat_sponsor") === ru.cat_sponsor, "t: returns the selected-language value");
ok(t("zz", "cat_sponsor") === en.cat_sponsor, "t: unknown language falls back to en");
ok(t("uk", "__missing__") === "__missing__", "t: missing key returns the key itself");

// --- formatDuration: compact two-unit, localized units (expected built from tables) ---
ok(formatDuration(4980, "ru") === "1 " + ru.duration_hour_short + " 23 " + ru.duration_minute_short,
   "formatDuration ru: 4980s -> 1h 23m compact");
ok(formatDuration(4980, "en") === "1 " + en.duration_hour_short + " 23 " + en.duration_minute_short,
   "formatDuration en: 4980s -> 1h 23m compact");
ok(formatDuration(125, "uk") === "2 " + uk.duration_minute_short + " 5 " + uk.duration_second_short,
   "formatDuration uk: 125s -> 2m 5s");
ok(formatDuration(45, "en") === "45 " + en.duration_second_short, "formatDuration: sub-minute -> Ns only");
ok(formatDuration(0, "en") === "0 " + en.duration_second_short, "formatDuration: 0 -> 0s");
ok(formatDuration(-5, "en") === "0 " + en.duration_second_short, "formatDuration: negative clamps to 0s");

// --- content-tree CAT_NAMES == shared/messages cat_* (deliberate duplicate) ---
const cself = { __SBSKIP__: {} };
const cload = (f) => new Function("self", read("../content/" + f))(cself);
cload("config.js");       // NS.DEFAULTS, NS.CATEGORY_COLORS
cload("i18nStrings.js");  // NS.CAT_NAMES, NS.i18n
const CAT_NAMES = cself.__SBSKIP__.CAT_NAMES;
const catIds = CATEGORIES.map((c) => c.id).sort();
for (const lang of ["en", "uk", "ru"]) {
  const nameKeys = Object.keys(CAT_NAMES[lang]).sort();
  ok(nameKeys.length === catIds.length && nameKeys.every((k, i) => k === catIds[i]),
     "CAT_NAMES " + lang + ": exactly the " + catIds.length + " category ids");
  const mism = CATEGORIES.filter((c) => CAT_NAMES[lang][c.id] !== TABLES[lang]["cat_" + c.id]).map((c) => c.id);
  ok(mism.length === 0, "CAT_NAMES " + lang + " == shared/messages cat_* (" + mism.join(",") + ")");
}
// catName reads the language at call time (no NS.settings yet -> en default) and
// falls back to the raw id for an unknown category.
ok(cself.__SBSKIP__.i18n.catName("sponsor") === en.cat_sponsor, "catName: no settings yet -> en default name");
ok(cself.__SBSKIP__.i18n.catName("__nope__") === "__nope__", "catName: unknown category -> raw id");
cself.__SBSKIP__.settings = { get: () => ({ language: "ru" }) };
ok(cself.__SBSKIP__.i18n.catName("sponsor") === ru.cat_sponsor, "catName: reads the language at call time (ru)");

// --- manifest content-script ORDER (a wrong slot passes node --check but breaks at runtime) ---
const manifest = JSON.parse(read("../manifest.json"));
const js = manifest.content_scripts[0].js;
const idx = (f) => js.indexOf("content/" + f);
ok(idx("i18nStrings.js") !== -1, "manifest: i18nStrings.js present in content_scripts");
ok(idx("i18nStrings.js") > idx("settingsClient.js"), "manifest: i18nStrings after settingsClient");
ok(idx("i18nStrings.js") < idx("timelineMarkers.js"), "manifest: i18nStrings before timelineMarkers (its consumer)");
ok(idx("i18nStrings.js") < idx("channel.js"), "manifest: i18nStrings before channel");

// --- manifest __MSG_*__ references only the trimmed _locales keys ---
const manifestText = read("../manifest.json");
const msgRefs = [...new Set([...manifestText.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)].map((m) => m[1]))].sort();
ok(msgRefs.length === 2 && msgRefs[0] === "extDescription" && msgRefs[1] === "extName",
   "manifest __MSG_ refs are exactly extName/extDescription (" + msgRefs.join(",") + ")");

// --- decommission gate: no chrome.i18n.getMessage( call remains in any JS ---
const jsFiles = [];
const walk = (dirUrl) => {
  for (const ent of readdirSync(dirUrl, { withFileTypes: true })) {
    if (ent.isDirectory()) walk(new URL(ent.name + "/", dirUrl));
    else if (ent.name.endsWith(".js")) jsFiles.push(new URL(ent.name, dirUrl));
  }
};
for (const d of ["../background/", "../content/", "../popup/", "../settings/", "../shared/"]) walk(U(d));
const offenders = jsFiles.filter((f) => /chrome\.i18n\.getMessage\s*\(/.test(readFileSync(f, "utf8")));
ok(offenders.length === 0, "no chrome.i18n.getMessage( calls remain (" + offenders.map((f) => fileURLToPath(f)).join(",") + ")");

// --- _locales schema + brand invariant ---
for (const lang of ["en", "uk", "ru"]) {
  const loc = JSON.parse(read("../_locales/" + lang + "/messages.json"));
  const badShape = Object.entries(loc).filter(([, v]) => !v || typeof v.message !== "string" || v.message.trim() === "");
  ok(badShape.length === 0, "_locales/" + lang + ": every key has a non-empty message");
  ok(loc.extName && loc.extName.message === "Auto Sponsor Skipper", "_locales/" + lang + ": extName brand invariant");
  ok(loc.extDescription && typeof loc.extDescription.message === "string", "_locales/" + lang + ": has extDescription");
}
const enLocKeys = Object.keys(JSON.parse(read("../_locales/en/messages.json"))).sort();
ok(enLocKeys.length === 2 && enLocKeys[0] === "extDescription" && enLocKeys[1] === "extName",
   "_locales/en trimmed to extName+extDescription (" + enLocKeys.join(",") + ")");

// --- onLanguageChange dedup + getLanguage (fake chrome) ---
let listener = null;
let removed = false;
const syncStore = {};
globalThis.chrome = {
  storage: {
    sync: { async get(k) { return (k in syncStore) ? { [k]: syncStore[k] } : {}; } },
    onChanged: {
      addListener: (fn) => { listener = fn; },
      removeListener: (fn) => { if (listener === fn) { removed = true; listener = null; } }
    }
  }
};

const calls = [];
const unsub = onLanguageChange("en", (l) => calls.push(l));
ok(typeof listener === "function", "onLanguageChange registered a storage listener");
listener({ settings: { oldValue: { language: "en", enabled: true }, newValue: { language: "en", enabled: false } } }, "sync");
ok(calls.length === 0, "onLanguageChange: unrelated settings write does not fire");
listener({ settings: { oldValue: { language: "en" }, newValue: { language: "ru" } } }, "sync");
ok(calls.length === 1 && calls[0] === "ru", "onLanguageChange: real change fires once with the new language");
listener({ settings: { oldValue: { language: "ru" }, newValue: { language: "ru", enabled: true } } }, "sync");
ok(calls.length === 1, "onLanguageChange: no re-fire on an unrelated write after the switch");
listener({ settings: { oldValue: { language: "ru" }, newValue: { language: "uk" } } }, "local");
ok(calls.length === 1, "onLanguageChange: a non-sync area is ignored");
unsub();
ok(removed === true, "onLanguageChange: unsubscribe removes the listener");

syncStore["settings"] = { language: "ru" };
ok((await getLanguage()) === "ru", "getLanguage: returns the stored language");
delete syncStore["settings"];
ok((await getLanguage()) === "en", "getLanguage: defaults to en when unset");

// --- required DOM hooks (guards the two popup tiles + the language select) ---
const popupHtml = read("../popup/popup.html");
ok(popupHtml.includes('id="skipped-count"'), "popup.html: skipped-count tile id present");
ok(popupHtml.includes('id="saved-time"'), "popup.html: saved-time tile id present");
ok(popupHtml.includes('data-i18n="popup_skipped"'), "popup.html: popup_skipped label present");
ok(popupHtml.includes('data-i18n="popup_time_saved"'), "popup.html: popup_time_saved label present");
const settingsHtml = read("../settings/settings.html");
ok(settingsHtml.includes('id="ui-language"'), "settings.html: ui-language select id present");
ok(settingsHtml.includes('data-i18n="settings_language"'), "settings.html: settings_language label present");
ok(settingsHtml.includes('data-i18n="tab_settings"'), "settings.html: tab_settings label present");
ok(settingsHtml.includes('data-i18n="tab_statistics"'), "settings.html: tab_statistics label present");
ok(settingsHtml.includes('data-panel="settings"') && settingsHtml.includes('data-panel="statistics"'),
   "settings.html: both tab panels present");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
