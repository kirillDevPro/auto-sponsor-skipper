/**
 * content/skipNotice.js — shows a small "skip notice" toast over the YouTube
 * player when skipEngine skips a segment: a localized "Skipped: <Category>" label,
 * an Undo button, and a close button. Auto-dismisses after a few seconds.
 *
 * View-only by design: the actual undo action (seeking the <video> back and
 * reversing the stat) is OWNED by skipEngine and passed in as an `onUndo`
 * callback, so this module never touches the video or the counter — it only
 * renders and invokes the callback. This keeps the seek/stat logic in one place
 * (skipEngine) and makes the toast headlessly testable with a spy callback.
 *
 * Discipline mirrors content/timelineMarkers.js:
 * - A monotonic `generation` (bumped by every show()/clear() AND by an Undo click)
 *   drops stale auto-dismiss timers and click handlers, so a navigation, a newer
 *   skip, or a repeated click on an already-consumed toast can never act twice —
 *   the Undo path is one-shot (a double-click reverses the stat only once).
 * - Every public entry is wrapped in try/catch and fails OPEN: a missing player
 *   or any DOM error is swallowed and never throws into the skip loop.
 * - Pure DOM, no chrome.* — so it keeps working in an orphaned extension context.
 * - The toast is appended to the PLAYER element (#movie_player), NOT document.body,
 *   so it stays visible in fullscreen (fullscreen shows only the player subtree).
 * - One toast at a time: each show() removes the previous toast first, so there is
 *   never more than one notice and Undo always targets the most recent skip.
 */

;(() => {
  const NS = self.__SBSKIP__;
  const DISMISS_MS = 5000;

  let generation = 0;
  let toastEl = null;
  let dismissTimer = null;

  /**
   * Locate YouTube's player container. Fail-open (may be null).
   * @returns {Element|null} YouTube player container, if present.
   * @sideEffects None.
   */
  function findPlayer() {
    return (
      document.querySelector("#movie_player") ||
      document.querySelector(".html5-video-player")
    );
  }

  /**
   * Remove the current toast and cancel its dismiss timer.
   * @returns {void}
   * @sideEffects Removes the toast from the DOM and clears the dismiss timer.
   */
  function remove() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    toastEl = null;
  }

  NS.skipNotice = {
    /**
     * Show the skip notice for a just-skipped segment, replacing any current one.
     * @param {{category: string, onUndo: () => void}} opts
     *   category - SponsorBlock category id (for the localized label).
     *   onUndo   - invoked at most once on Undo click; owns the seek + stat reversal.
     * @returns {void}
     * @sideEffects Inserts a toast into the player DOM and sets a dismiss timer.
     */
    show(opts) {
      try {
        const category = opts && opts.category;
        const onUndo =
          opts && typeof opts.onUndo === "function" ? opts.onUndo : null;
        const player = findPlayer();
        if (!player) return; // no player yet — fail open, skipping is unaffected

        remove(); // drop any existing toast + its pending timer
        const gen = ++generation;

        const toast = document.createElement("div");
        toast.className = "sbskip-notice";

        const label = document.createElement("span");
        label.className = "sbskip-notice-label";
        label.textContent = NS.i18n.notice("skipped") + ": " + NS.i18n.catName(category);

        const undoBtn = document.createElement("button");
        undoBtn.className = "sbskip-notice-undo";
        undoBtn.type = "button";
        undoBtn.textContent = NS.i18n.notice("undo");
        undoBtn.addEventListener("click", () => {
          if (gen !== generation) return; // stale or already-consumed toast
          generation++; // one-shot: a repeated click on this button can't fire again
          remove();
          if (onUndo) {
            try {
              onUndo();
            } catch (e) {
              NS.log("skipNotice onUndo error", e);
            }
          }
        });

        const closeLabel = NS.i18n.notice("close");
        const closeBtn = document.createElement("button");
        closeBtn.className = "sbskip-notice-close";
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.title = closeLabel;
        closeBtn.setAttribute("aria-label", closeLabel);
        closeBtn.addEventListener("click", () => {
          if (gen !== generation) return;
          remove();
        });

        toast.appendChild(label);
        toast.appendChild(undoBtn);
        toast.appendChild(closeBtn);
        player.appendChild(toast);
        toastEl = toast;

        dismissTimer = setTimeout(() => {
          if (gen === generation) remove();
        }, DISMISS_MS);
      } catch (e) {
        NS.log("skipNotice.show error", e);
      }
    },

    /**
     * Remove the notice (e.g. on navigation, or when the setting is turned off).
     * Bumps the generation so any pending auto-dismiss timer or click handler no-ops.
     * @returns {void}
     * @sideEffects Removes the toast from the DOM and cancels its timer.
     */
    clear() {
      try {
        generation++;
        remove();
      } catch (e) {
        NS.log("skipNotice.clear error", e);
      }
    }
  };
})();
