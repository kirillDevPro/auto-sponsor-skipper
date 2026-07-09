/**
 * content/content.js — orchestrator, loaded last. Wires navigation → segment
 * fetch → skip engine + timeline markers, and re-applies both on live settings
 * changes.
 *
 * A monotonically increasing `token` guards against a stale async result: it is
 * bumped on EVERY navigation (including leaving a watch page), so a fetch that
 * resolves after the user has moved on is dropped, and a scheduled retry for an
 * abandoned video is cancelled.
 */

;(() => {
  const NS = self.__SBSKIP__;
  let token = 0;
  let lastVideoId = null; // the last videoId we committed to (distinguishes a real
                          // navigation from a same-video retry / whitelist re-eval)
  const MAX_RETRIES = 3;

  /**
   * Load and apply segments for the current navigation target.
   * @param {string|null} videoId - YouTube video id, or null off a watch page.
   * @param {number} [attempt=0] - transient-failure retry count.
   * @returns {Promise<void>}
   * @sideEffects Updates engines, clears stale UI, and may schedule a retry.
   */
  async function onVideo(videoId, attempt = 0) {
    const myToken = ++token;

    // Left the watch page: drop stale segments so a lingering miniplayer isn't
    // skipped with the previous video's data, and let pending retries die.
    if (!videoId) {
      lastVideoId = null;
      NS.skipEngine.clear();
      NS.timelineMarkers.clear();
      NS.skipNotice.clear();
      return;
    }

    // Only on a REAL navigation to a different video (not a same-video retry or a
    // whitelist re-eval): drop the previous video's skip set AND markers NOW,
    // before the async fetch, so they stay in lockstep and neither acts on stale
    // data during the await window below — (a) a stale re-inject/duration callback
    // from the old marker generation can't repaint the previous segments onto the
    // freshly mounted bar, and (b) the reused <video>'s timeupdate can't seek using
    // the previous video's segments before apply() re-arms them. For a same-video
    // re-eval we keep the still-valid segments/markers serving until apply()/render()
    // refresh them after the fetch, so an unrelated whitelist edit doesn't blink
    // enforcement or markers off.
    if (videoId !== lastVideoId) {
      lastVideoId = videoId;
      NS.skipEngine.clear();
      NS.timelineMarkers.clear();
      NS.skipNotice.clear();
    }

    NS.log("video", videoId, attempt ? "(retry " + attempt + ")" : "");
    try {
      let [resp, video, whitelist] = await Promise.all([
        NS.getSegments(videoId),
        NS.videoTarget.waitFor(),
        NS.settings.whitelist()
      ]);
      if (myToken !== token) return; // navigated away — drop stale result

      // The <video> can appear after the wait timeout on a slow load: retry once
      // so skipping isn't silently disabled for the rest of this navigation.
      if (!video) {
        video = await NS.videoTarget.waitFor(10000);
        if (myToken !== token) return;
      }

      const channel = NS.channel.current();
      const whitelisted = !!(channel && whitelist.includes(channel));
      const segments = resp && resp.ok && resp.segments ? resp.segments : [];

      NS.skipEngine.apply(video, segments, { whitelisted });
      NS.timelineMarkers.render(video, segments, { whitelisted });
      NS.log("applied", segments.length, "segments; whitelisted:", whitelisted);

      // Transient failure — either a fetch error, or the service worker was
      // unreachable after swClient exhausted its fast retries. Self-heal on a
      // slower schedule without needing a navigation/reload.
      const transientFailure =
        resp && ((resp.ok && resp.status === "error") || resp.ok === false);
      if (transientFailure && attempt < MAX_RETRIES) {
        const delay = 45000 * (attempt + 1);
        setTimeout(() => {
          if (token === myToken) onVideo(videoId, attempt + 1);
        }, delay);
      }
    } catch (err) {
      NS.log("onVideo error", err);
    }
  }

  // Live re-apply when the user toggles settings in the popup/options.
  NS.onSettingsChanged = () => {
    NS.skipEngine.reapply();
    NS.timelineMarkers.reapply();
  };

  // Whitelist edits change whether the CURRENT channel is skipped, which
  // reapply() alone can't recompute — re-run the full flow for this video.
  NS.onWhitelistChanged = () => {
    const id = NS.navigation.currentVideoId();
    if (id) onVideo(id);
  };

  // Start navigation watching even if the initial settings load fails — the
  // settings client falls back to defaults — so the tab is never left inert.
  NS.settings
    .load()
    .catch(() => {})
    .then(() => NS.navigation.start(onVideo));
})();
