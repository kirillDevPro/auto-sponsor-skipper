/**
 * popup/popup.js — the toolbar popup. Master on/off, per-category checkboxes
 * (from the shared catalog), skip-stat tiles, and the active-tab video status
 * line. Every settings change is a
 * read-fresh-modify-write via updateSettings so a change here can't clobber a
 * concurrent edit made in an open options tab; a chrome.storage.onChanged
 * listener keeps the popup's own controls in sync if storage changes elsewhere.
 * There is no popup-to-content messaging; the content script's own onChanged
 * listener applies settings live. The popup uses the `activeTab` permission only
 * to read the active tab's URL (to derive the watch videoId) and shows that
 * video's SponsorBlock status from the shared cache; when that entry is stale it
 * asks the service worker to re-fetch via a GET_SEGMENTS message.
 */

import { CATEGORIES, SETTINGS_KEY, STATS_KEY } from "../shared/categories.js";
import { loadSettings, updateSettings, loadStats } from "../shared/settingsStore.js";
import { t, localizePage, formatDuration, onLanguageChange } from "../shared/i18n.js";
import { cacheKey, isFresh } from "../shared/videoCache.js";
import { MSG_GET_SEGMENTS } from "../shared/messaging.js";
import { watchVideoIdFromUrl, statusView } from "./popupStatus.js";

const enabledEl = document.getElementById("enabled");
const categoriesEl = document.getElementById("categories");
const countEl = document.getElementById("skipped-count");
const timeEl = document.getElementById("saved-time");
const statusEl = document.getElementById("video-status");

let settings;
let lang = "en";
let lastSeconds = 0; // last known stats.seconds, so a language switch can re-format it
let currentVideoId = null; // active tab's watch videoId, or null off a watch page
let lastStatusEntry;       // last read sbseg_ cache entry (undefined until first read)

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
 * Render the current video's segment status line from currentVideoId +
 * lastStatusEntry. Hidden when the active tab is not a YouTube watch page.
 * @returns {void}
 * @sideEffects Updates the #video-status element's text and hidden state.
 */
function paintStatus() {
  if (!currentVideoId) {
    statusEl.hidden = true;
    return;
  }
  const view = statusView(lastStatusEntry);
  let text = t(lang, view.key);
  if (view.count !== null) text += " " + view.count;
  statusEl.textContent = text;
  statusEl.hidden = false;
}

/**
 * Read the active video's cached status and repaint. If the cache entry is
 * missing or stale, ask the service worker to (re)fetch — the storage.onChanged
 * listener repaints when it writes, so opening the popup doubles as a re-check.
 * @returns {Promise<void>}
 * @sideEffects Reads chrome.storage.local; may send a GET_SEGMENTS message.
 */
async function refreshStatus() {
  if (!currentVideoId) {
    paintStatus();
    return;
  }
  const key = cacheKey(currentVideoId);
  const obj = await chrome.storage.local.get(key);
  lastStatusEntry = obj[key] ?? null;
  paintStatus();
  if (!isFresh(lastStatusEntry, Date.now())) {
    // Stale or missing — trigger a background (re)fetch; onChanged repaints.
    chrome.runtime.sendMessage({ type: MSG_GET_SEGMENTS, videoId: currentVideoId }, () => {
      void chrome.runtime.lastError; // fire-and-forget; ignore transport errors
    });
  }
}

/**
 * Initialize the popup UI.
 * @returns {Promise<void>}
 * @sideEffects Reads/writes chrome.storage, renders localized controls, adds DOM
 *   listeners, and registers storage/language-change listeners.
 */
async function init() {
  // settings (sync), stats (local), and the active-tab lookup are independent —
  // run all three round-trips at once. activeTab exposes tab.url on popup
  // invocation; the query resolves to [] on failure so currentVideoId → null.
  const [loaded, stats, tabs] = await Promise.all([
    loadSettings(),
    loadStats(),
    chrome.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => [])
  ]);
  settings = loaded;
  lang = settings.language;
  localizePage(document, lang);

  lastSeconds = stats.seconds || 0;
  countEl.textContent = String(stats.count || 0);
  timeEl.textContent = formatDuration(lastSeconds, lang);

  renderEnabled();
  renderCategories();

  // Show the active tab's video status (null off a watch page → hidden).
  currentVideoId = watchVideoIdFromUrl(tabs[0] && tabs[0].url);
  paintStatus();   // instant: "Checking…" on a watch page, hidden otherwise
  refreshStatus(); // async cache read + optional re-check

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
    // Repaint only when the current active video's shared cache entry changes.
    if (area === "local" && currentVideoId && changes[cacheKey(currentVideoId)]) {
      lastStatusEntry = changes[cacheKey(currentVideoId)].newValue || null;
      paintStatus();
    }
  });

  // Re-localize + re-format the saved-time units live on a language switch.
  onLanguageChange(lang, (newLang) => {
    lang = newLang;
    localizePage(document, lang);
    timeEl.textContent = formatDuration(lastSeconds, lang);
    paintStatus();
  });
}

init();
