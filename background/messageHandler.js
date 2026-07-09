/**
 * background/messageHandler.js — the single runtime.onMessage entry point.
 *
 * The listener is intentionally NON-async: an async listener returns a Promise,
 * which Chrome does not reliably treat as "keep the response channel open,"
 * dropping responses on some versions. Instead we start the async work, call
 * sendResponse from its continuation, and synchronously `return true` to hold
 * the channel open. A message that is not ours returns nothing (no channel).
 */

import { getSegments } from "./segmentService.js";
import { MSG_GET_SEGMENTS } from "../shared/messaging.js";

/** Register the GET_SEGMENTS handler. Call once at service-worker startup. */
export function registerMessageHandler() {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== MSG_GET_SEGMENTS) return; // not ours

    const videoId = msg.videoId;
    if (typeof videoId !== "string" || videoId.length < 6) {
      sendResponse({ ok: false, videoId, error: "bad videoId" });
      return; // synchronous response; channel already answered
    }

    getSegments(videoId)
      .then(({ status, segments }) =>
        sendResponse({ ok: true, videoId, status, segments })
      )
      .catch((err) =>
        sendResponse({ ok: false, videoId, error: String((err && err.message) || err) })
      );

    return true; // keep the channel open for the async sendResponse
  });
}
