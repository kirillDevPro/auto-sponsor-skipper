/**
 * settings/statistics.js — the Statistics section: total segments skipped and
 * total time saved, with a reset button.
 */

import { loadStats, resetStats } from "../shared/settingsStore.js";
import { formatDuration, getLanguage, onLanguageChange } from "../shared/i18n.js";

/**
 * Wire the statistics display and reset button.
 * @returns {Promise<void>}
 * @sideEffects Reads/writes chrome.storage.local, updates stat text, adds a reset
 *   listener, and registers a language-change listener.
 */
export async function initStatistics() {
  const countEl = document.getElementById("stat-count");
  const timeEl = document.getElementById("stat-time");
  const resetEl = document.getElementById("stat-reset");
  let lang = await getLanguage();

  /**
   * Render the current statistics using the current language.
   * @returns {Promise<void>}
   * @sideEffects Reads chrome.storage.local and updates statistic text.
   */
  async function render() {
    const stats = await loadStats();
    countEl.textContent = String(stats.count || 0);
    timeEl.textContent = formatDuration(stats.seconds, lang);
  }

  resetEl.addEventListener("click", async () => {
    await resetStats();
    render();
  });

  // Re-render so the localized time units update on a live language switch.
  onLanguageChange(lang, (newLang) => {
    lang = newLang;
    render();
  });

  render();
}
