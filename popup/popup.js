/**
 * popup/popup.js — the toolbar popup. Master on/off, per-category checkboxes
 * (from the shared catalog), and the skip counter. Every change is a
 * read-fresh-modify-write via updateSettings so a change here can't clobber a
 * concurrent edit made in an open options tab; a chrome.storage.onChanged
 * listener keeps the popup's own controls in sync if storage changes elsewhere.
 * There is no popup-to-content messaging and no `tabs` permission — the content
 * script's own onChanged listener applies settings live.
 */

import { CATEGORIES, SETTINGS_KEY, STATS_KEY } from "../shared/categories.js";
import { loadSettings, updateSettings, loadStats } from "../shared/settingsStore.js";
import { t, localizePage, formatDuration, onLanguageChange } from "../shared/i18n.js";

const enabledEl = document.getElementById("enabled");
const categoriesEl = document.getElementById("categories");
const countEl = document.getElementById("skipped-count");
const timeEl = document.getElementById("saved-time");

let settings;
let lang = "en";
let lastSeconds = 0; // last known stats.seconds, so a language switch can re-format it

/**
 * Reflect the master-enabled state in the popup controls.
 * @returns {void}
 * @sideEffects Updates the enabled checkbox and disabled body class.
 */
function renderEnabled() {
  enabledEl.checked = settings.enabled;
  document.body.classList.toggle("disabled", !settings.enabled);
}

/**
 * Sync each category checkbox to the current settings without rebuilding rows.
 * @returns {void}
 * @sideEffects Updates category checkbox checked states.
 */
function syncCategoryChecks() {
  for (const cat of CATEGORIES) {
    const input = document.getElementById("cat-" + cat.id);
    if (input) input.checked = settings.categories[cat.id] === true;
  }
}

/**
 * Build one checkbox row per category.
 * @returns {void}
 * @sideEffects Rebuilds the category list DOM and adds checkbox listeners.
 */
function renderCategories() {
  categoriesEl.textContent = "";
  for (const cat of CATEGORIES) {
    const row = document.createElement("div");
    row.className = "cat";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "cat-" + cat.id;
    input.checked = settings.categories[cat.id] === true;
    input.addEventListener("change", async () => {
      settings = await updateSettings((s) => {
        s.categories[cat.id] = input.checked;
      });
    });

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.dataset.i18n = cat.i18nKey;
    label.textContent = t(lang, cat.i18nKey);

    row.append(input, label);
    categoriesEl.append(row);
  }
}

/**
 * Initialize the popup UI.
 * @returns {Promise<void>}
 * @sideEffects Reads/writes chrome.storage, renders localized controls, adds DOM
 *   listeners, and registers storage/language-change listeners.
 */
async function init() {
  // settings (sync) and stats (local) are independent — fetch both at once.
  const [loaded, stats] = await Promise.all([loadSettings(), loadStats()]);
  settings = loaded;
  lang = settings.language;
  localizePage(document, lang);

  lastSeconds = stats.seconds || 0;
  countEl.textContent = String(stats.count || 0);
  timeEl.textContent = formatDuration(lastSeconds, lang);

  renderEnabled();
  renderCategories();

  enabledEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.enabled = enabledEl.checked;
    });
    document.body.classList.toggle("disabled", !settings.enabled);
  });

  document.getElementById("open-settings").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Keep the popup's controls in sync if settings/stats change elsewhere.
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "sync" && changes[SETTINGS_KEY]) {
      settings = await loadSettings();
      renderEnabled();
      syncCategoryChecks();
    }
    if (area === "local" && changes[STATS_KEY]) {
      const s = changes[STATS_KEY].newValue || { count: 0, seconds: 0 };
      lastSeconds = s.seconds || 0;
      countEl.textContent = String(s.count || 0);
      timeEl.textContent = formatDuration(lastSeconds, lang);
    }
  });

  // Re-localize + re-format the saved-time units live on a language switch.
  onLanguageChange(lang, (newLang) => {
    lang = newLang;
    localizePage(document, lang);
    timeEl.textContent = formatDuration(lastSeconds, lang);
  });
}

init();
