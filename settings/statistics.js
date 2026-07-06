/**
 * settings/statistics.js — the Statistics section: total segments skipped and
 * total time saved, with a reset button.
 */

import { loadStats, resetStats } from "../shared/settingsStore.js";

/** Format a duration in seconds as a compact "1h 2m 3s" string. */
function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h) parts.push(h + "h");
  if (m) parts.push(m + "m");
  parts.push(sec + "s");
  return parts.join(" ");
}

/** Wire the statistics display + reset button. */
export async function initStatistics() {
  const countEl = document.getElementById("stat-count");
  const timeEl = document.getElementById("stat-time");
  const resetEl = document.getElementById("stat-reset");

  async function render() {
    const stats = await loadStats();
    countEl.textContent = String(stats.count || 0);
    timeEl.textContent = formatDuration(stats.seconds);
  }

  resetEl.addEventListener("click", async () => {
    await resetStats();
    render();
  });

  render();
}
