/**
 * background/uiLanguage.js — maps a browser UI locale onto a shipped UI language
 * code. Used on install and update to record a machine-local language hint
 * (background/firstRunLanguage.js). Pure: no chrome.* calls, so it is headlessly
 * testable.
 *
 * Chrome reports the UI locale as a BCP-47 tag with hyphens ("pt-BR",
 * "zh-Hans-CN", "nb-NO"), while our codes are _locales directory names with
 * underscores ("pt_PT", "zh_CN"). Both sides are parsed with Intl.Locale rather
 * than split on a separator: in "zh-Hans-CN" the second subtag is the SCRIPT,
 * not the region, so positional parsing reads "Hans" as a region and never
 * matches zh_CN.
 */

import { LANGUAGE_CODES, FALLBACK, toBcp47 } from "../shared/languages.js";

/**
 * Language subtags Chrome reports that are not themselves shipped codes, mapped
 * to the code that serves them. Norwegian is the live case: Chrome reports
 * Bokmal as "nb"/"nb-NO" (and Nynorsk as "nn"), but Chrome's own _locales
 * directory for Norwegian must be named "no" — so without this table every
 * Norwegian user falls through to English despite a shipped Norwegian locale.
 */
const ALIASES = { nb: "no", nn: "no" };

/**
 * Parse a locale tag into its language and region subtags.
 * @param {string} tag - a BCP-47 tag ("pt-BR") or a shipped code ("pt_PT").
 * @returns {{language: string, region: string|null}|null} parsed subtags, or
 *   null when the tag is not structurally valid.
 * @sideEffects None.
 */
function parse(tag) {
  try {
    const loc = new Intl.Locale(toBcp47(tag));
    return { language: loc.language, region: loc.region || null };
  } catch {
    return null; // not a well-formed tag — the caller falls back
  }
}

/**
 * Pick the best `codes` entry for a browser UI locale.
 *
 * Resolution order, first hit wins:
 *   1. alias the language subtag (nb/nn -> no),
 *   2. exact language+region ("pt-PT" -> pt_PT),
 *   3. the region-less code for that language ("de-DE" -> de),
 *   4. any code in that language ("pt-BR" -> pt_PT, "zh-TW" -> zh_CN),
 *   5. the fallback.
 * Step 4 handles a regional variant we do not ship generically, so it stays
 * correct as languages are added — the only hardcoded table is ALIASES.
 *
 * @param {unknown} uiLang - a browser UI locale tag; anything invalid yields the fallback.
 * @param {string[]} codes - shipped language codes to choose from.
 * @returns {string} a code from `codes`, or FALLBACK when nothing matches.
 * @sideEffects None.
 */
export function matchUILanguage(uiLang, codes) {
  if (typeof uiLang !== "string" || uiLang.trim() === "") return FALLBACK;
  const want = parse(uiLang);
  if (!want) return FALLBACK;
  const language = ALIASES[want.language] || want.language;

  const sameLanguage = codes
    .map((code) => ({ code, ...parse(code) }))
    .filter((s) => s.language === language);
  if (sameLanguage.length === 0) return FALLBACK;

  const exact = sameLanguage.find((s) => s.region === want.region);
  if (exact) return exact.code;
  const regionless = sameLanguage.find((s) => s.region === null);
  if (regionless) return regionless.code;
  return sameLanguage[0].code;
}

/**
 * matchUILanguage bound to the shipped catalog.
 * @param {unknown} uiLang - a browser UI locale tag (chrome.i18n.getUILanguage()).
 * @returns {string} a shipped language code.
 * @sideEffects None.
 */
export function resolveUILanguage(uiLang) {
  return matchUILanguage(uiLang, LANGUAGE_CODES);
}
