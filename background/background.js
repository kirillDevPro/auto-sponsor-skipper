/**
 * background/background.js — service-worker entry point.
 *
 * Deliberately tiny and STATELESS: it only registers listeners at top level,
 * synchronously, so they are re-installed on every cold start. The worker holds
 * no load-bearing in-memory state — all durable state lives in chrome.storage
 * and in the content script — so MV3 suspending and waking this worker can
 * never break segment skipping.
 */

import { registerMessageHandler } from "./messageHandler.js";
import { registerFirstRunLanguage } from "./firstRunLanguage.js";

registerMessageHandler();
registerFirstRunLanguage();
