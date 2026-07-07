/**
 * settings/tabs.js — the options-page tab switcher. Toggles the `.active` class
 * on the tab buttons and their matching panels (data-tab <-> data-panel), and
 * keeps aria-selected in sync. Purely presentational — no storage, no settings.
 * Defaults to whichever tab/panel already carries `.active` in the HTML.
 */

/**
 * Wire click handling for the Settings / Statistics tabs.
 * @returns {void}
 * @sideEffects Adds click listeners and updates tab/panel classes plus aria state.
 */
export function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tabs .tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  if (!tabs.length || !panels.length) return;

  /**
   * Show the panel for `name` and mark its tab selected; hide the rest.
   * @param {string} name - data-tab/data-panel name to activate.
   * @returns {void}
   * @sideEffects Updates tab and panel DOM state.
   */
  function activate(name) {
    for (const tab of tabs) {
      const on = tab.dataset.tab === name;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const panel of panels) {
      panel.classList.toggle("active", panel.dataset.panel === name);
    }
  }

  for (const tab of tabs) {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
  }
}
