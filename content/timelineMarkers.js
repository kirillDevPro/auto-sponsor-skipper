/**
 * content/timelineMarkers.js — draws colored markers on YouTube's player
 * progress bar for the segments that would actually be skipped, with a hover
 * tooltip naming the category and its length.
 *
 * Design (mirrors skipEngine's discipline):
 * - `computeMarkers()` is a PURE function (no DOM/chrome) turning raw segments +
 *   settings + duration into marker descriptors. It calls the SAME
 *   NS.segmentFilter.filterActive the skip engine uses, so the drawn set is
 *   definitionally equal to the skipped set. It is unit-tested headlessly.
 * - Every public entry point (render/reapply/clear) is wrapped in try/catch and
 *   the DOM is scraped fail-open: if the progress bar or duration can't be found,
 *   markers are silently absent and skipping is completely unaffected.
 * - A monotonic `generation` counter (bumped on every render/clear) drops stale
 *   async draws — deferred duration/bar waits and re-inject callbacks all check
 *   it, exactly like content.js's navigation `token`.
 * - render() has REPLACE semantics: it tears down the previous instance's DOM,
 *   listeners, and observers before drawing, so watch->watch navigation and live
 *   settings changes never leak listeners or leave a stale overlay.
 *
 * Known limitation: on chaptered videos YouTube splits the bar with small gaps;
 * markers positioned by global percent can be slightly offset there. Accepted for
 * the lite build (alignment is exact on non-chaptered videos).
 */

;(() => {
  const NS = self.__SBSKIP__;

  // ---- module state ----------------------------------------------------------
  let generation = 0;
  let videoEl = null;
  let currentRaw = [];
  let currentWhitelisted = false;
  let currentMarkers = [];

  let layerEl = null; // the .sbskip-marker-layer container
  let tipEl = null; // the reusable .sbskip-tip tooltip
  let barEl = null; // the .ytp-progress-bar we are bound to

  // Cleanup callbacks, split so removeOverlay() can drop just the overlay's
  // listeners/observer while a pending duration/bar wait survives.
  let overlayDisposers = [];
  let waitDisposers = [];

  let durationWaitAttached = false;
  let barWaitAttached = false;
  let reinjectTimer = null;
  let rafPending = false;
  let lastClientX = 0;

  // ---- pure marker computation (headlessly testable) -------------------------
  /**
   * @param {Array<{start:number,end:number,category:string}>} raw
   * @param {object} settings - merged settings (needs showTimelineMarkers +
   *   whatever filterActive reads).
   * @param {boolean} whitelisted
   * @param {number} dur - video duration in seconds.
   * @returns {Array<object>|null} marker descriptors
   *   `{category,start,end,length,startPct,widthPct,color}` (in skip-engine
   *   order), `[]` when nothing should be drawn (markers off / disabled /
   *   whitelisted / no active segment), or `null` when there ARE segments to draw
   *   but the duration isn't usable yet (caller should wait for metadata).
   */
  function computeMarkers(raw, settings, whitelisted, dur) {
    if (!settings || !settings.showTimelineMarkers) return [];
    const active = NS.segmentFilter.filterActive(raw, settings, whitelisted);
    if (active.length === 0) return [];

    const G = NS.timelineGeometry;
    const colors = NS.CATEGORY_COLORS || {};
    const out = [];
    for (const seg of active) {
      const startPct = G.timeToPercent(seg.start, dur);
      const endPct = G.timeToPercent(seg.end, dur);
      if (startPct === null || endPct === null) return null; // duration not ready
      const color = colors[seg.category];
      if (!color) continue; // unknown category — nothing to draw for it
      out.push({
        category: seg.category,
        start: seg.start,
        end: seg.end,
        length: seg.end - seg.start,
        startPct,
        widthPct: Math.max(0, endPct - startPct),
        color
      });
    }
    return out;
  }

  // ---- DOM helpers -----------------------------------------------------------
  /** Locate YouTube's progress bar, most-specific first. Fail-open (may be null). */
  function findBar() {
    return (
      document.querySelector(".ytp-progress-bar") ||
      document.querySelector(".ytp-progress-bar-container") ||
      document.querySelector(".ytp-progress-list")
    );
  }

  /** Best available duration: the <video>, else the bar's aria-valuemax; NaN if
   *  neither is usable (computeMarkers then treats it as "not ready"). */
  function usableDuration() {
    const d = videoEl ? videoEl.duration : NaN;
    if (Number.isFinite(d) && d > 0) return d;
    const bar = findBar();
    if (bar) {
      const v = parseFloat(bar.getAttribute("aria-valuemax"));
      if (Number.isFinite(v) && v > 0) return v;
    }
    return NaN;
  }

  function addOverlayDisposer(fn) { overlayDisposers.push(fn); }
  function addWaitDisposer(fn) { waitDisposers.push(fn); }
  function runDisposers(list) {
    for (const d of list) { try { d(); } catch (e) { /* fail-open */ } }
    list.length = 0;
  }

  /** Remove the overlay + tooltip + their listeners/observer; keep pending waits. */
  function removeOverlay() {
    runDisposers(overlayDisposers);
    barEl = null;
    if (layerEl && layerEl.parentNode) layerEl.parentNode.removeChild(layerEl);
    layerEl = null;
    if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
    tipEl = null;
    currentMarkers = [];
  }

  /** Full cleanup: overlay + all pending waits + timers. Keeps state fields. */
  function teardown() {
    removeOverlay();
    runDisposers(waitDisposers);
    durationWaitAttached = false;
    barWaitAttached = false;
    if (reinjectTimer) { clearTimeout(reinjectTimer); reinjectTimer = null; }
    rafPending = false;
  }

  // ---- draw pipeline ---------------------------------------------------------
  function draw(gen) {
    if (gen !== generation) return;
    if (!videoEl) { removeOverlay(); return; }
    const markers = computeMarkers(
      currentRaw, NS.settings.get(), currentWhitelisted, usableDuration()
    );
    if (markers === null) { waitForDuration(gen); return; } // segments exist, dur pending
    if (markers.length === 0) { removeOverlay(); return; } // nothing to draw
    const bar = findBar();
    if (!bar) { waitForBar(gen); return; } // controls not mounted yet
    currentMarkers = markers;
    paint(bar, markers, gen);
  }

  /** Build the marker layer and (re)bind the bar. Idempotent — drops a prior layer. */
  function paint(bar, markers, gen) {
    if (layerEl && layerEl.parentNode) layerEl.parentNode.removeChild(layerEl);
    layerEl = document.createElement("div");
    layerEl.className = "sbskip-marker-layer";
    for (const m of markers) {
      const el = document.createElement("div");
      el.className = "sbskip-marker";
      el.style.left = m.startPct + "%";
      el.style.width = m.widthPct + "%";
      el.style.backgroundColor = m.color;
      layerEl.appendChild(el);
    }
    // Sit above the play/load progress but below the scrubber handle.
    const scrubber = bar.querySelector(".ytp-scrubber-container");
    if (scrubber && scrubber.parentNode === bar) bar.insertBefore(layerEl, scrubber);
    else bar.appendChild(layerEl);
    bindBar(bar, gen);
  }

  /** Attach the tooltip listeners + the re-inject observer, once per bar. */
  function bindBar(bar, gen) {
    if (barEl === bar) return; // already bound to this exact bar (barEl tracks it)
    runDisposers(overlayDisposers); // rebind cleanly if the bar element changed
    barEl = bar;

    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "sbskip-tip";
      tipEl.style.display = "none";
    }
    if (tipEl.parentNode !== bar) bar.appendChild(tipEl);

    const move = (e) => onBarMove(e);
    const leave = () => hideTip();
    bar.addEventListener("mousemove", move, { passive: true });
    bar.addEventListener("mouseleave", leave, { passive: true });
    addOverlayDisposer(() => {
      bar.removeEventListener("mousemove", move);
      bar.removeEventListener("mouseleave", leave);
    });

    // Re-inject if YouTube swaps out the bar, its container, or rebuilds their
    // children (dropping our layer) — ad<->content, chapter/scrubber rebuilds,
    // some SPA nav. Observe the childList of the bar and its two nearest ancestors,
    // all WITHOUT subtree, so YouTube's constant descendant style churn doesn't
    // fire this every frame (the debounced callback would otherwise still run). A
    // swap even higher up is rare and fails soft: markers stay absent until the
    // next navigation/settings redraw, and skipping is unaffected.
    const parent = bar.parentNode;
    const grandparent = parent ? parent.parentNode : null;
    for (const root of [bar, parent, grandparent]) {
      if (!root) continue;
      const obs = new MutationObserver(() => scheduleReinject(gen));
      obs.observe(root, { childList: true });
      addOverlayDisposer(() => obs.disconnect());
    }
  }

  /** Debounced: rebuild the overlay only when our layer has actually detached. */
  function scheduleReinject(gen) {
    if (gen !== generation || reinjectTimer) return;
    reinjectTimer = setTimeout(() => {
      reinjectTimer = null;
      if (gen !== generation) return;
      const bar = findBar();
      if (bar && layerEl && bar.contains(layerEl)) return; // still attached — nothing to do
      draw(gen);
    }, 200);
  }

  /** Redraw once the <video> exposes a usable duration. Attaches once per gen. */
  function waitForDuration(gen) {
    if (durationWaitAttached || !videoEl) return;
    durationWaitAttached = true;
    const v = videoEl;
    const rerun = () => { if (gen === generation) draw(gen); };
    v.addEventListener("loadedmetadata", rerun);
    v.addEventListener("durationchange", rerun);
    addWaitDisposer(() => {
      v.removeEventListener("loadedmetadata", rerun);
      v.removeEventListener("durationchange", rerun);
    });
  }

  /** Redraw once the progress bar mounts, giving up after a bounded wait so a
   *  never-matching selector can't leave an observer running forever (fail-open:
   *  markers stay absent, skipping is unaffected). Only one bar wait is active
   *  at a time; a later draw may start a fresh bounded wait after timeout. */
  function waitForBar(gen) {
    if (barWaitAttached) return;
    barWaitAttached = true;
    const root = document.querySelector("#movie_player") || document.body || document.documentElement;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      obs.disconnect();
      clearTimeout(timer);
      barWaitAttached = false;
    };
    const obs = new MutationObserver(() => {
      if (gen !== generation) { finish(); return; }
      if (findBar()) { finish(); draw(gen); }
    });
    obs.observe(root, { childList: true, subtree: true });
    const timer = setTimeout(finish, 15000); // give up — bar never appeared
    addWaitDisposer(finish);
  }

  // ---- tooltip ---------------------------------------------------------------
  function onBarMove(e) {
    lastClientX = e.clientX;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateTip(lastClientX);
    });
  }

  /**
   * Update the hover tooltip for the current pointer position.
   * @param {number} clientX - pointer x-coordinate in viewport pixels.
   * @returns {void}
   * @sideEffects Updates tooltip text, position, and visibility.
   */
  function updateTip(clientX) {
    if (!tipEl || !barEl) return;
    const rect = barEl.getBoundingClientRect();
    if (rect.width <= 0) { hideTip(); return; }
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const t = NS.timelineGeometry.percentToTime(pct, usableDuration());
    let seg = null;
    if (t !== null) {
      // First covering segment in skip-engine order, so the tooltip names the
      // category that would actually drive the seek.
      for (const m of currentMarkers) {
        if (t >= m.start && t <= m.end) { seg = m; break; }
      }
    }
    if (!seg) { hideTip(); return; }
    const name = NS.i18n.catName(seg.category);
    const text = name + " · " + NS.timelineGeometry.formatLength(seg.length);
    if (tipEl.textContent !== text) tipEl.textContent = text;
    tipEl.style.left = (clientX - rect.left) + "px";
    tipEl.style.display = "block";
  }

  function hideTip() { if (tipEl) tipEl.style.display = "none"; }

  // ---- public surface --------------------------------------------------------
  NS.timelineMarkers = {
    /** Exposed for headless testing of the marker-set == skip-set invariant. */
    compute: computeMarkers,

    /**
     * Draw markers for a video's segments. Replace semantics: tears down any
     * previous overlay/listeners first.
     * @param {HTMLVideoElement|null} video
     * @param {Array<{start:number,end:number,category:string}>} rawSegments
     * @param {{whitelisted?: boolean}} [opts]
     */
    render(video, rawSegments, opts) {
      try {
        const gen = ++generation;
        teardown();
        videoEl = video || null;
        currentRaw = rawSegments || [];
        currentWhitelisted = !!(opts && opts.whitelisted);
        currentMarkers = [];
        if (!videoEl) return; // nothing to draw without a video element
        draw(gen);
      } catch (e) {
        NS.log("timelineMarkers.render error", e);
      }
    },

    /** Recompute + redraw after a live settings change (categories, min-length,
     *  master enable, or the showTimelineMarkers toggle). */
    reapply() {
      try {
        if (!videoEl) return;
        NS.timelineMarkers.render(videoEl, currentRaw, { whitelisted: currentWhitelisted });
      } catch (e) {
        NS.log("timelineMarkers.reapply error", e);
      }
    },

    /** Remove all markers + listeners (e.g. when leaving a watch page). */
    clear() {
      try {
        generation++; // invalidate any pending gen-guarded callbacks
        teardown();
        videoEl = null;
        currentRaw = [];
        currentWhitelisted = false;
      } catch (e) {
        NS.log("timelineMarkers.clear error", e);
      }
    }
  };
})();
