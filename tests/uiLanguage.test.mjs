// Headless: background/uiLanguage.js — mapping a browser UI locale onto a
// shipped language code. matchUILanguage is pure and takes the code list as a
// parameter, so the table below is pinned against the FULL 27-language fixture
// regardless of how many languages currently ship; resolveUILanguage is checked
// against the real catalog.
//
// Run: node tests/uiLanguage.test.mjs
import { matchUILanguage, resolveUILanguage } from "../background/uiLanguage.js";
import { LANGUAGE_CODES, FALLBACK } from "../shared/languages.js";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };

// The full shipped set, as a fixture: this file tests the ALGORITHM, so it must
// not weaken as languages are added or narrow to whatever ships today.
const ALL = ["ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fa", "fi", "fr", "hi", "it", "ja",
             "ko", "lt", "no", "pl", "pt_PT", "ro", "ru", "sk", "sv", "tr", "uk", "zh_CN"];

const cases = [
  // exact / base-language
  ["en", "en"], ["en-US", "en"], ["en-GB", "en"], ["en_US", "en"],
  ["de", "de"], ["de-DE", "de"], ["de-AT", "de"], ["de-CH", "de"],
  ["ru-RU", "ru"], ["uk-UA", "uk"], ["fa-IR", "fa"], ["ar-EG", "ar"], ["ko-KR", "ko"], ["ja-JP", "ja"],
  ["es-419", "es"], ["es-MX", "es"], ["es-ES", "es"],
  // underscore codes: exact region match
  ["pt-PT", "pt_PT"], ["pt_PT", "pt_PT"],
  ["zh-CN", "zh_CN"], ["zh_CN", "zh_CN"],
  // regional variants we do not ship separately fall to the language's one code
  ["pt-BR", "pt_PT"], ["pt", "pt_PT"],
  ["zh-TW", "zh_CN"], ["zh-HK", "zh_CN"], ["zh", "zh_CN"],
  // a script subtag must not be read as a region (the reason Intl.Locale parses this)
  ["zh-Hans-CN", "zh_CN"], ["zh-Hant-TW", "zh_CN"], ["zh-Hans", "zh_CN"],
  // Norwegian: Chrome says nb/nn, the locale directory is "no"
  ["no", "no"], ["nb", "no"], ["nb-NO", "no"], ["nn-NO", "no"], ["nn", "no"],
  // case-insensitive (Intl canonicalizes)
  ["PT-pt", "pt_PT"], ["ZH-hans-cn", "zh_CN"], ["DE", "de"],
  // unsupported / malformed -> fallback
  ["vi", FALLBACK], ["th-TH", FALLBACK], ["xx-YY", FALLBACK], ["zz", FALLBACK],
  ["", FALLBACK], ["   ", FALLBACK], ["-", FALLBACK], ["!!", FALLBACK],
  [null, FALLBACK], [undefined, FALLBACK], [123, FALLBACK], [{}, FALLBACK], [[], FALLBACK]
];

for (const [input, expected] of cases) {
  const got = matchUILanguage(input, ALL);
  ok(got === expected, "matchUILanguage(" + JSON.stringify(input) + ") -> " + expected + (got === expected ? "" : " (got " + got + ")"));
}

// --- every shipped code round-trips to itself ---
// Catches a code the matcher cannot reach: e.g. if "pt_PT" failed to parse, a
// Portuguese user would silently land on English despite a shipped locale.
for (const code of ALL) {
  ok(matchUILanguage(code, ALL) === code, "round-trip (fixture): " + code + " -> itself");
}

// --- the same, against the REAL catalog (scales as languages ship) ---
for (const code of LANGUAGE_CODES) {
  ok(resolveUILanguage(code) === code, "round-trip (catalog): " + code + " -> itself");
}
ok(resolveUILanguage("vi") === FALLBACK, "resolveUILanguage: unsupported locale -> fallback");
ok(LANGUAGE_CODES.includes(resolveUILanguage("de-DE")), "resolveUILanguage: always returns a shipped code");

// --- a single-language catalog still resolves (no crash on a degenerate list) ---
ok(matchUILanguage("de-DE", ["en"]) === FALLBACK, "match: language absent from the catalog -> fallback");
ok(matchUILanguage("en-GB", ["en"]) === "en", "match: single-code catalog resolves");
ok(matchUILanguage("de", []) === FALLBACK, "match: empty catalog -> fallback");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
