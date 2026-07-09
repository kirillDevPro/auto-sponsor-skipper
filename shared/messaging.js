/**
 * shared/messaging.js — the content/popup ↔ service-worker message protocol.
 *
 * Shared by the service worker (background/messageHandler.js handles it) and the
 * popup (which asks the SW to refresh a stale cache entry). Both are ES-module
 * trees that import shared/. The classic content tree can't import modules, so it
 * keeps its own copy in content/config.js NS.MSG — kept in sync (guarded by
 * tests/popupStatus.test.mjs).
 */

/** Request type: content/popup → SW, "fetch skip segments for this videoId". */
export const MSG_GET_SEGMENTS = "GET_SEGMENTS";
