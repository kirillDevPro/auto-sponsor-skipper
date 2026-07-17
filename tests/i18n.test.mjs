// Headless: the in-page i18n runtime + every shipped message table + the content-
// tree category-name duplicate + _locales, all kept consistent. Guards: the
// four-place code-set identity, key parity, the t() fallback chain + the TABLES
// wiring gate, formatDuration, the content CAT_NAMES/NOTICE_STRINGS <-> shared/
// messages equality, the manifest content-script ORDER, the "no chrome.i18n.
// getMessage" decommission, _locales schema + brand invariant, onLanguageChange
// dedup, getLanguage, and the required DOM hooks.
//
// Scales with the shipped set: EXPECTED_CODES below is the ONE hardcoded list --
// it IS the shipped contract, so adding a language is "edit that list, then let
// this file name whichever of the four places you forgot". Tables load
// dynamically, which also proves each file exists.
//
// ASCII-only: every non-Latin expectation is BUILT from the imported tables,
// never typed as a literal. Run: node tests/i18n.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { t, formatDuration, onLanguageChange, getLanguage, TABLES as WIRED_TABLES } from "../shared/i18n.js";
import { LANGUAGES, LANGUAGE_CODES, FALLBACK } from "../shared/languages.js";
import { CATEGORIES, CATEGORY_COLORS, DEFAULT_SETTINGS } from "../shared/categories.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const U = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(U(p), "utf8");
const sorted = (a) => a.slice().sort();
const sameSet = (a, b) => {
  const [x, y] = [sorted(a), sorted(b)];
  return x.length === y.length && x.every((v, i) => v === y[i]);
};

// The shipped contract. Adding a language = add it here + the four places below.
const EXPECTED_CODES = ["ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fa", "fi", "fr", "hi", "it",
                        "ja", "ko", "lt", "no", "pl", "pt_PT", "ro", "ru", "sk", "sv", "tr", "uk", "zh_CN"];

// --- the FOUR places a language code must appear, all identical ---
// A code present in one place and missing in another is the drift this whole
// file exists to catch: a missing table silently serves English, a missing
// _locales dir is a HARD install failure, a missing CAT_NAMES entry drops the
// tooltip name.
const messageFiles = readdirSync(U("../shared/messages/")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
const localeDirs = readdirSync(U("../_locales/"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
ok(sameSet(LANGUAGE_CODES, EXPECTED_CODES), "catalog: LANGUAGES == EXPECTED_CODES (" + LANGUAGE_CODES.join(",") + ")");
ok(sameSet(messageFiles, EXPECTED_CODES), "shared/messages/: one table per code (" + sorted(messageFiles).join(",") + ")");
ok(sameSet(localeDirs, EXPECTED_CODES), "_locales/: one dir per code (" + sorted(localeDirs).join(",") + ")");

// --- catalog shape: sorted by code, unique, non-empty endonyms ---
ok(LANGUAGE_CODES.join(",") === sorted(LANGUAGE_CODES).join(","), "catalog: LANGUAGES is ordered by code");
ok(new Set(LANGUAGE_CODES).size === LANGUAGE_CODES.length, "catalog: no duplicate codes");
ok(LANGUAGES.every((l) => typeof l.name === "string" && l.name.trim() !== ""), "catalog: every language has a non-empty endonym");
ok(new Set(LANGUAGES.map((l) => l.name)).size === LANGUAGES.length, "catalog: endonyms are unique");
ok(LANGUAGE_CODES.includes(FALLBACK), "catalog: FALLBACK is a shipped code");

// Tables are loaded dynamically so this file scales; a missing file throws here.
const TABLES = {};
for (const code of LANGUAGE_CODES) TABLES[code] = (await import("../shared/messages/" + code + ".js")).default;
const en = TABLES[FALLBACK];

// --- key parity across all shipped locales ---
const enKeys = Object.keys(en);
for (const code of LANGUAGE_CODES) {
  const ks = Object.keys(TABLES[code]);
  ok(ks.length === enKeys.length && ks.every((k, i) => k === enKeys[i]),
     "key parity: " + code + " matches en exactly (same keys, same order)");
}

// --- no empty / non-string values in any table ---
for (const code of LANGUAGE_CODES) {
  const empty = Object.entries(TABLES[code]).filter(([, v]) => typeof v !== "string" || v.trim() === "");
  ok(empty.length === 0, code + ": no empty/non-string values (" + empty.map(([k]) => k).join(",") + ")");
}

// --- TABLES wiring gate: a table file that exists but was never imported into
// shared/i18n.js makes t() serve the English value for that whole language --
// silently, because a translation is ALLOWED to equal its English source, so no
// output comparison can prove wiring. Compare the runtime map to the catalog
// instead: one assertion, and it covers en too.
ok(sameSet(Object.keys(WIRED_TABLES), EXPECTED_CODES),
   "shared/i18n.js TABLES == the catalog (" + sorted(Object.keys(WIRED_TABLES)).join(",") + ")");
for (const code of LANGUAGE_CODES) {
  ok(WIRED_TABLES[code] === TABLES[code], "shared/i18n.js wires the real " + code + " table (same module object)");
}

// --- every category has a message key ---
for (const cat of CATEGORIES) {
  ok(typeof en[cat.i18nKey] === "string", "en has a message for category " + cat.id + " (" + cat.i18nKey + ")");
}

// --- t(): fallback chain selected -> en -> key ---
ok(t("ru", "cat_sponsor") === TABLES.ru.cat_sponsor, "t: returns the selected-language value");
ok(t("zz", "cat_sponsor") === en.cat_sponsor, "t: unknown language falls back to en");
ok(t("uk", "__missing__") === "__missing__", "t: missing key returns the key itself");

// --- formatDuration: compact two-unit, localized units (expected built from tables) ---
for (const code of LANGUAGE_CODES) {
  const T = TABLES[code];
  ok(formatDuration(4980, code) === "1 " + T.duration_hour_short + " 23 " + T.duration_minute_short,
     "formatDuration " + code + ": 4980s -> 1h 23m compact");
  ok(formatDuration(125, code) === "2 " + T.duration_minute_short + " 5 " + T.duration_second_short,
     "formatDuration " + code + ": 125s -> 2m 5s");
  ok(formatDuration(45, code) === "45 " + T.duration_second_short, "formatDuration " + code + ": sub-minute -> Ns only");
}
ok(formatDuration(0, "en") === "0 " + en.duration_second_short, "formatDuration: 0 -> 0s");
ok(formatDuration(-5, "en") === "0 " + en.duration_second_short, "formatDuration: negative clamps to 0s");

// --- content-tree CAT_NAMES / NOTICE_STRINGS == shared/messages (deliberate duplicate) ---
const cself = { __SBSKIP__: {} };
const cload = (f) => new Function("self", read("../content/" + f))(cself);
cload("config.js");       // NS.DEFAULTS, NS.CATEGORY_COLORS
cload("i18nStrings.js");  // NS.CAT_NAMES, NS.NOTICE_STRINGS, NS.i18n
const CAT_NAMES = cself.__SBSKIP__.CAT_NAMES;
const NOTICE = cself.__SBSKIP__.NOTICE_STRINGS;
ok(sameSet(Object.keys(CAT_NAMES), EXPECTED_CODES), "CAT_NAMES: one block per code (" + sorted(Object.keys(CAT_NAMES)).join(",") + ")");
ok(sameSet(Object.keys(NOTICE), EXPECTED_CODES), "NOTICE_STRINGS: one block per code (" + sorted(Object.keys(NOTICE)).join(",") + ")");

const catIds = CATEGORIES.map((c) => c.id).sort();
const noticeParts = [["skipped", "notice_skipped"], ["undo", "notice_undo"], ["close", "notice_close"]];
for (const code of LANGUAGE_CODES) {
  const nameKeys = Object.keys(CAT_NAMES[code]).sort();
  ok(nameKeys.length === catIds.length && nameKeys.every((k, i) => k === catIds[i]),
     "CAT_NAMES " + code + ": exactly the " + catIds.length + " category ids");
  const mism = CATEGORIES.filter((c) => CAT_NAMES[code][c.id] !== TABLES[code]["cat_" + c.id]).map((c) => c.id);
  ok(mism.length === 0, "CAT_NAMES " + code + " == shared/messages cat_* (" + mism.join(",") + ")");
  const nmism = noticeParts.filter(([k, mk]) => NOTICE[code][k] !== TABLES[code][mk]).map(([k]) => k);
  ok(nmism.length === 0, "NOTICE_STRINGS " + code + " == shared/messages notice_* (" + nmism.join(",") + ")");
}
// catName reads the language at call time (no NS.settings yet -> en default) and
// falls back to the raw id for an unknown category.
ok(cself.__SBSKIP__.i18n.catName("sponsor") === en.cat_sponsor, "catName: no settings yet -> en default name");
ok(cself.__SBSKIP__.i18n.catName("__nope__") === "__nope__", "catName: unknown category -> raw id");
cself.__SBSKIP__.settings = { get: () => ({ language: "ru" }) };
ok(cself.__SBSKIP__.i18n.catName("sponsor") === TABLES.ru.cat_sponsor, "catName: reads the language at call time (ru)");
ok(cself.__SBSKIP__.i18n.notice("undo") === TABLES.ru.notice_undo, "notice(undo): reads the language at call time (ru)");
ok(cself.__SBSKIP__.i18n.notice("skipped") === TABLES.ru.notice_skipped, "notice(skipped): reads the language at call time (ru)");
// An unknown language must fail open to en, not to undefined (a content-path throw).
cself.__SBSKIP__.settings = { get: () => ({ language: "zz" }) };
ok(cself.__SBSKIP__.i18n.catName("sponsor") === en.cat_sponsor, "catName: unknown language falls back to en");
ok(cself.__SBSKIP__.i18n.notice("undo") === en.notice_undo, "notice: unknown language falls back to en");

// --- content-tree NS.CATEGORY_COLORS / NS.DEFAULTS == shared/categories.js (deliberate duplicate) ---
// Previously unguarded: a missing content-tree color silently drops that category's timeline marker
// (timelineMarkers.js `if (!color) continue;`), and a missing default would misseed a fresh install.
// An explicit hook check is required because the parity loops iterate CATEGORIES and would pass even
// if hook had been omitted from the catalog entirely.
ok(CATEGORIES.some((c) => c.id === "hook" && c.color === "#395699" && c.defaultOn === false),
   "catalog includes the hook category (off by default, canonical color)");
const CCOLORS = cself.__SBSKIP__.CATEGORY_COLORS;
const CDEFAULTS = cself.__SBSKIP__.DEFAULTS.categories;
for (const c of CATEGORIES) {
  ok(CCOLORS[c.id] === c.color && CCOLORS[c.id] === CATEGORY_COLORS[c.id],
     "CATEGORY_COLORS content-tree == shared for " + c.id);
  ok(CDEFAULTS[c.id] === DEFAULT_SETTINGS.categories[c.id],
     "NS.DEFAULTS.categories content-tree == shared for " + c.id);
}
const catIdSet = catIds.join(",");
ok(Object.keys(CCOLORS).sort().join(",") === catIdSet, "NS.CATEGORY_COLORS has exactly the catalog ids");
ok(Object.keys(CDEFAULTS).sort().join(",") === catIdSet, "NS.DEFAULTS.categories has exactly the catalog ids");
// The content tree's default language must be a shipped code (it is the fail-open
// value used before settings load).
ok(LANGUAGE_CODES.includes(cself.__SBSKIP__.DEFAULTS.language), "NS.DEFAULTS.language is a shipped code");
ok(LANGUAGE_CODES.includes(DEFAULT_SETTINGS.language), "DEFAULT_SETTINGS.language is a shipped code");

// --- manifest content-script ORDER (a wrong slot passes node --check but breaks at runtime) ---
const manifest = JSON.parse(read("../manifest.json"));
const js = manifest.content_scripts[0].js;
const idx = (f) => js.indexOf("content/" + f);
ok(idx("i18nStrings.js") !== -1, "manifest: i18nStrings.js present in content_scripts");
ok(idx("i18nStrings.js") > idx("settingsClient.js"), "manifest: i18nStrings after settingsClient");
ok(idx("i18nStrings.js") < idx("timelineMarkers.js"), "manifest: i18nStrings before timelineMarkers (its consumer)");
ok(idx("i18nStrings.js") < idx("channel.js"), "manifest: i18nStrings before channel");
ok(idx("skipNotice.js") !== -1, "manifest: skipNotice.js present in content_scripts");
ok(idx("skipNotice.js") > idx("i18nStrings.js"), "manifest: skipNotice after i18nStrings (uses NS.i18n)");
ok(idx("skipNotice.js") < idx("skipEngine.js"), "manifest: skipNotice before skipEngine (its caller)");
const cssArr = manifest.content_scripts[0].css || [];
ok(cssArr.includes("content/skipNotice.css"), "manifest: skipNotice.css injected via content_scripts css");

// --- manifest __MSG_*__ references only the trimmed _locales keys ---
const manifestText = read("../manifest.json");
const msgRefs = [...new Set([...manifestText.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)].map((m) => m[1]))].sort();
ok(msgRefs.length === 2 && msgRefs[0] === "extDescription" && msgRefs[1] === "extName",
   "manifest __MSG_ refs are exactly extName/extDescription (" + msgRefs.join(",") + ")");
ok(manifest.default_locale === FALLBACK, "manifest: default_locale is the fallback language");

// --- decommission gate: no chrome.i18n.getMessage( call remains in any JS ---
// The in-page UI is localized by shared/i18n.js from settings.language; a
// getMessage call would silently follow the BROWSER locale instead.
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
for (const code of LANGUAGE_CODES) {
  const loc = JSON.parse(read("../_locales/" + code + "/messages.json"));
  const badShape = Object.entries(loc).filter(([, v]) => !v || typeof v.message !== "string" || v.message.trim() === "");
  ok(badShape.length === 0, "_locales/" + code + ": every key has a non-empty message");
  ok(loc.extName && loc.extName.message === "Auto Sponsor Skipper", "_locales/" + code + ": extName brand invariant");
  ok(loc.extDescription && typeof loc.extDescription.message === "string", "_locales/" + code + ": has extDescription");
  const locKeys = Object.keys(loc).sort();
  ok(locKeys.length === 2 && locKeys[0] === "extDescription" && locKeys[1] === "extName",
     "_locales/" + code + " trimmed to extName+extDescription (" + locKeys.join(",") + ")");
}

// --- onLanguageChange dedup + getLanguage (fake chrome) ---
let listener = null;
let removed = false;
const syncStore = {};
const localStore = {};
globalThis.chrome = {
  storage: {
    sync: { async get(k) { return (k in syncStore) ? { [k]: syncStore[k] } : {}; } },
    // loadSettings also reads the browser-locale language hint from local.
    local: { async get(k) { return (k in localStore) ? { [k]: localStore[k] } : {}; } },
    onChanged: {
      addListener: (fn) => { listener = fn; },
      removeListener: (fn) => { if (listener === fn) { removed = true; listener = null; } }
    }
  }
};

// The listener re-reads storage, so each fire needs a turn to settle.
const settle = () => new Promise((r) => setTimeout(r, 0));
const calls = [];
syncStore["settings"] = { language: "en", enabled: true };
const unsub = onLanguageChange("en", (l) => calls.push(l));
ok(typeof listener === "function", "onLanguageChange registered a storage listener");

syncStore["settings"] = { language: "en", enabled: false };
listener({ settings: { oldValue: { language: "en", enabled: true }, newValue: { language: "en", enabled: false } } }, "sync");
await settle();
ok(calls.length === 0, "onLanguageChange: unrelated settings write does not fire");

syncStore["settings"] = { language: "ru" };
listener({ settings: { oldValue: { language: "en" }, newValue: { language: "ru" } } }, "sync");
await settle();
ok(calls.length === 1 && calls[0] === "ru", "onLanguageChange: real change fires once with the new language");

syncStore["settings"] = { language: "ru", enabled: true };
listener({ settings: { oldValue: { language: "ru" }, newValue: { language: "ru", enabled: true } } }, "sync");
await settle();
ok(calls.length === 1, "onLanguageChange: no re-fire on an unrelated write after the switch");

listener({ settings: { oldValue: { language: "ru" }, newValue: { language: "uk" } } }, "local");
await settle();
ok(calls.length === 1, "onLanguageChange: a non-sync area is ignored");

// REGRESSION: a user who never picked a language has NO language field stored --
// their language comes from the machine-local hint. An unrelated write stores an
// object without that field, and reading it literally used to mean "English",
// flipping the open popup/options to English while the setting still said uk.
{
  delete syncStore["settings"];
  localStore["languageHint"] = "uk";
  const hintCalls = [];
  const stop = onLanguageChange("uk", (l) => hintCalls.push(l));
  syncStore["settings"] = { enabled: false }; // written by an unrelated toggle: no language field
  listener({ settings: { oldValue: undefined, newValue: { enabled: false } } }, "sync");
  await settle();
  ok(hintCalls.length === 0, "onLanguageChange: a hint-language user is NOT flipped to en by an unrelated write");
  // ...and picking a real language from that state still fires.
  syncStore["settings"] = { enabled: false, language: "ru" };
  listener({ settings: { newValue: { enabled: false, language: "ru" } } }, "sync");
  await settle();
  ok(hintCalls.length === 1 && hintCalls[0] === "ru", "onLanguageChange: an explicit choice still fires from a hint state");
  stop();
  delete localStore["languageHint"];
  delete syncStore["settings"];
}

unsub();
ok(removed === true, "onLanguageChange: unsubscribe removes the listener");

syncStore["settings"] = { language: "ru" };
ok((await getLanguage()) === "ru", "getLanguage: returns the stored language");
delete syncStore["settings"];
ok((await getLanguage()) === "en", "getLanguage: defaults to en when unset");
// The install-time browser-locale hint fills the gap until a choice is made,
// and never overrides one.
localStore["languageHint"] = "uk";
ok((await getLanguage()) === "uk", "getLanguage: uses the browser-locale hint when no choice is stored");
syncStore["settings"] = { language: "ru" };
ok((await getLanguage()) === "ru", "getLanguage: an explicit choice outranks the hint");
delete syncStore["settings"];
delete localStore["languageHint"];

// --- localizePage sets <html lang> (screen readers / hyphenation) ---
// Minimal DOM stand-in: localizePage only needs querySelectorAll + documentElement.
{
  const el = { lang: "" };
  globalThis.document = { documentElement: el, querySelectorAll: () => [] };
  globalThis.document.querySelectorAll = () => [];
  const { localizePage } = await import("../shared/i18n.js");
  localizePage(globalThis.document, "ru");
  ok(el.lang === "ru", "localizePage: sets <html lang> to the selected language");
  localizePage(globalThis.document, "pt_PT");
  ok(el.lang === "pt-PT", "localizePage: <html lang> uses BCP-47 hyphens, not the _locales underscore");
  delete globalThis.document;
}

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
ok(settingsHtml.includes('id="show-skip-notice"'), "settings.html: show-skip-notice toggle id present");
ok(settingsHtml.includes('data-i18n="settings_skip_notice"'), "settings.html: settings_skip_notice label present");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
