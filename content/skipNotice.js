/**
 * content/skipNotice.js — shows a small "skip notice" toast over the YouTube
 * player when skipEngine skips a segment: a localized "Skipped: <Category> · M:SS"
 * label (the length is optional), an Undo button, and a close button. Auto-dismisses
 * after a few seconds, but pauses while the pointer rests on it so it can't vanish
 * mid-reach. Each skip is also announced to screen readers via a persistent
 * aria-live region on document.body.
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
  let srRegion = null;

  /**
   * The persistent, visually-hidden aria-live region that announces each skip to
   * screen readers. Normally created empty before the first announcement and
   * reused while attached (or recreated if external DOM churn removes it): a live region
   * created and populated in the same tick is missed by many screen readers, so
   * it should already be in the DOM before its text changes. It lives on
   * document.body (not the player), survives toast replace/remove and player-
   * subtree churn, and is never touched by remove()/clear(). Fail-open: returns
   * null if body is absent.
   * @returns {Element|null} the live region, or null when there is no document.body.
   * @sideEffects May append a region when no attached one exists.
   */
  function ensureSrRegion() {
    if (srRegion && srRegion.parentNode) return srRegion;
    const body = document.body;
    if (!body) return null;
    const el = document.createElement("div");
    el.className = "sbskip-sr-only";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    body.appendChild(el);
    srRegion = el;
    return el;
  }

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
     * @param {{category: string, length?: number, onUndo: () => void}} opts
     *   category - SponsorBlock category id (for the localized label).
     *   length   - skipped segment length in seconds; when finite, appended as
     *              " · M:SS" (same form as the timeline-marker tooltip). Optional:
     *              a missing/non-finite length just omits the suffix.
     *   onUndo   - invoked at most once on Undo click; owns the seek + stat reversal.
     * @returns {void}
     * @sideEffects Inserts a toast into the player DOM, sets a dismiss timer, and
     *   updates the aria-live region.
     */
    show(opts) {
      try {
        const category = opts && opts.category;
        const length = opts && opts.length;
        const onUndo =
          opts && typeof opts.onUndo === "function" ? opts.onUndo : null;
        const player = findPlayer();
        if (!player) return; // no player yet — fail open, skipping is unaffected

        remove(); // drop any existing toast + its pending timer
        const gen = ++generation;

        let labelText = NS.i18n.notice("skipped") + ": " + NS.i18n.catName(category);
        if (Number.isFinite(length) && NS.timelineGeometry) {
          labelText += " · " + NS.timelineGeometry.formatLength(length);
        }

        const toast = document.createElement("div");
        toast.className = "sbskip-notice";

        const label = document.createElement("span");
        label.className = "sbskip-notice-label";
        label.textContent = labelText;

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

        // Keep the toast up while the pointer is on it, so it can't vanish mid-reach
        // toward Undo. Pause on enter, re-arm a fresh timer on leave. Both are
        // generation-guarded, so a stale toast's late mouseleave can't re-arm.
        toast.addEventListener("mouseenter", () => {
          if (gen !== generation) return;
          if (dismissTimer) {
            clearTimeout(dismissTimer);
            dismissTimer = null;
          }
        });
        toast.addEventListener("mouseleave", () => {
          if (gen !== generation || dismissTimer) return;
          dismissTimer = setTimeout(() => {
            if (gen === generation) remove();
          }, DISMISS_MS);
        });

        // Announce the skip to screen readers via the persistent live region.
        const region = ensureSrRegion();
        if (region) region.textContent = labelText;

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

  // Create the (empty) live region up front so the first skip's text change is
  // announced — a region created and populated in one tick can be missed by AT.
  try {
    ensureSrRegion();
  } catch (e) {
    NS.log("skipNotice sr-region init error", e);
  }
})();
