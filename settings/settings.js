/**
 * settings/settings.js — options-page orchestrator. Localizes the static HTML
 * and initializes each section module. Sections are independent and each owns
 * its own storage reads/writes via the shared store.
 */

import { getLanguage, localizePage } from "../shared/i18n.js";
import { initTabs } from "./tabs.js";
import { initGlobal } from "./global.js";
import { initWhitelist } from "./whitelist.js";
import { initStatistics } from "./statistics.js";

// Localize with the selected language BEFORE first paint (getLanguage is async),
// then wire the tab switcher and the sections. Each section also re-localizes
// live on a language change via onLanguageChange.
(async () => {
  const lang = await getLanguage();
  localizePage(document, lang);
  initTabs();
  initGlobal();
  initWhitelist();
  initStatistics();
})();
