/**
 * settings/whitelist.js — the channel-whitelist editor. Stored channel ids
 * match what content/channel.js reads from the DOM ("@handle", "channel/UC...",
 * "c/name", "user/name"). A pasted channel URL or bare id is normalized to that
 * form so the entry actually matches at skip time.
 *
 * Writes go through updateWhitelist (read-fresh-serialized) so two open options
 * tabs can't clobber each other, and a chrome.storage.onChanged listener keeps
 * the displayed list current when it changes elsewhere.
 */

import { WHITELIST_KEY } from "../shared/categories.js";
import { loadWhitelist, updateWhitelist } from "../shared/settingsStore.js";
import { t } from "./i18n.js";

/**
 * Normalize user input (handle, channel id, or a full URL) to the SAME id form
 * content/channel.js returns, so the entry actually matches at skip time:
 * "@handle", "channel/UC...", "c/name", or "user/name". Unrecognized input
 * returns null (not stored) rather than a value that could never match.
 */
export function normalizeChannel(raw) {
  const s = (raw || "").trim();
  if (!s) return null;

  // Any of the four id forms present (also covers a pasted full URL).
  const m = s.match(/(@[^/?#\s]+|channel\/[^/?#\s]+|c\/[^/?#\s]+|user\/[^/?#\s]+)/);
  if (m) return m[1];

  // A bare channel ID (UC + ~22 chars) — content/channel.js sees "channel/UC...".
  if (/^UC[0-9A-Za-z_-]{10,}$/.test(s)) return "channel/" + s;

  // A bare handle typed without the leading @.
  if (/^[A-Za-z0-9._-]+$/.test(s)) return "@" + s;

  return null; // unsupported format — don't store an unmatchable entry
}

/** Wire the whitelist add/list/remove UI. */
export async function initWhitelist() {
  const listEl = document.getElementById("wl-list");
  const inputEl = document.getElementById("wl-input");
  const addEl = document.getElementById("wl-add");

  let list = await loadWhitelist();

  function render() {
    listEl.textContent = "";
    if (list.length === 0) {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.className = "empty";
      span.textContent = t("settings_whitelist_empty");
      li.append(span);
      listEl.append(li);
      return;
    }
    for (const ch of list) {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = ch;
      const btn = document.createElement("button");
      btn.className = "secondary";
      btn.textContent = t("settings_remove");
      btn.addEventListener("click", async () => {
        list = await updateWhitelist((l) => l.filter((x) => x !== ch));
        render();
      });
      li.append(span, btn);
      listEl.append(li);
    }
  }

  async function add() {
    const ch = normalizeChannel(inputEl.value);
    inputEl.value = "";
    if (!ch) return;
    list = await updateWhitelist((l) => (l.includes(ch) ? l : [...l, ch]));
    render();
  }

  addEl.addEventListener("click", add);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") add();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[WHITELIST_KEY]) {
      list = changes[WHITELIST_KEY].newValue || [];
      render();
    }
  });

  render();
}
