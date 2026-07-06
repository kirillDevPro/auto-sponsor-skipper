/**
 * settings/settings.js — options-page orchestrator. Localizes the static HTML
 * and initializes each section module. Sections are independent and each owns
 * its own storage reads/writes via the shared store.
 */

import { localizePage } from "./i18n.js";
import { initGlobal } from "./global.js";
import { initWhitelist } from "./whitelist.js";
import { initStatistics } from "./statistics.js";

localizePage();
initGlobal();
initWhitelist();
initStatistics();
