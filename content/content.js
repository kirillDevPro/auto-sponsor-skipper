/**
 * content/content.js — orchestrator, loaded last. Wires navigation → segment
 * fetch → skip engine, and re-applies on live settings changes.
 *
 * A monotonically increasing `token` guards against a stale async result: it is
 * bumped on EVERY navigation (including leaving a watch page), so a fetch that
 * resolves after the user has moved on is dropped, and a scheduled retry for an
 * abandoned video is cancelled.
 */

;(() => {
  const NS = self.__SBSKIP__;
  let token = 0;
  const MAX_RETRIES = 3;

  async function onVideo(videoId, attempt = 0) {
    const myToken = ++token;

    // Left the watch page: drop stale segments so a lingering miniplayer isn't
    // skipped with the previous video's data, and let pending retries die.
    if (!videoId) {
      NS.skipEngine.clear();
      return;
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
  NS.onSettingsChanged = () => NS.skipEngine.reapply();

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
