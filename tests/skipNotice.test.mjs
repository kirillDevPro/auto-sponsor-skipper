// Headless: content/skipNotice.js renders a toast into a fake player DOM, invokes
// the onUndo callback on Undo, removes on close / clear / auto-dismiss, reuses a
// single toast across skips (no stacking), retargets Undo to the newest skip, and
// fails open when no player is present. Also covers the segment length in the label,
// the hover-pause on auto-dismiss, and the persistent aria-live announcement region.
// The seek/stat logic lives in skipEngine (passed in as onUndo), so this covers the
// module's view behavior with a spy. ASCII-only: the middle-dot separator (U+00B7)
// is built with String.fromCharCode so the source stays ASCII. Run: node tests/skipNotice.test.mjs
import { readFileSync } from "node:fs";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const MID = String.fromCharCode(0xB7); // middle-dot U+00B7 separator, kept out of the ASCII source

// ---- minimal fake DOM element ----
function makeEl(tag) {
  return {
    tagName: tag,
    className: "",
    type: "",
    title: "",
    id: "",
    _text: "",
    _attrs: {},
    children: [],
    parentNode: null,
    _handlers: {},
    get textContent() { return this._text; },
    set textContent(v) { this._text = v; this.children = []; }, // setting text clears children
    setAttribute(k, v) { this._attrs[k] = v; },
    addEventListener(type, fn) { this._handlers[type] = fn; },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    click() { if (this._handlers.click) this._handlers.click(); },
    dispatch(type) { if (this._handlers[type]) this._handlers[type](); }
  };
}

// Load skipNotice.js into a fresh fake page. Injects document + controllable timers.
function makeHarness({ withPlayer = true } = {}) {
  const player = makeEl("div");
  player.id = "movie_player";
  const body = makeEl("body");
  const doc = {
    body,
    createElement: (t) => makeEl(t),
    querySelector: (sel) => {
      if (!withPlayer) return null;
      if (sel === "#movie_player" || sel === ".html5-video-player") return player;
      return null;
    }
  };
  let seq = 0;
  const timers = new Map();
  const setT = (fn) => { const id = ++seq; timers.set(id, fn); return id; };
  const clrT = (id) => { timers.delete(id); };
  const runPending = () => { const fns = [...timers.values()]; timers.clear(); fns.forEach((fn) => fn()); };

  const self = { __SBSKIP__: {} };
  const NS = self.__SBSKIP__;
  NS.log = () => {};
  NS.i18n = {
    notice: (k) => ({ skipped: "Skipped", undo: "Undo", close: "Dismiss" }[k]),
    catName: (c) => (c === "sponsor" ? "Sponsor" : c)
  };
  // Load the REAL length formatter so the "M:SS" length suffix is exercised, not stubbed.
  new Function("self", readFileSync(new URL("../content/timelineGeometry.js", import.meta.url), "utf8"))(self);
  const code = readFileSync(new URL("../content/skipNotice.js", import.meta.url), "utf8");
  new Function("self", "document", "setTimeout", "clearTimeout", code)(self, doc, setT, clrT);
  return { NS, player, body, runPending };
}

// 1. show renders label + undo + close, appended to the player
{
  const { NS, player } = makeHarness();
  let undoCalls = 0;
  NS.skipNotice.show({ category: "sponsor", length: 64, onUndo: () => { undoCalls++; } });
  ok(player.children.length === 1, "show: toast appended to the player");
  const toast = player.children[0];
  ok(toast.className === "sbskip-notice", "show: toast has the sbskip-notice class");
  ok(toast.children.length === 3, "show: toast has label + undo + close (length in label, no extra child)");
  ok(toast.children[0]._text === "Skipped: Sponsor " + MID + " 1:04", "show: label includes the formatted length");
  ok(toast.children[2].title === "Dismiss", "show: close button localized title");
  ok(undoCalls === 0, "show: onUndo not called before a click");
}

// 2. Undo click invokes onUndo once and removes the toast
{
  const { NS, player } = makeHarness();
  let undoCalls = 0;
  NS.skipNotice.show({ category: "sponsor", onUndo: () => { undoCalls++; } });
  player.children[0].children[1].click();
  ok(undoCalls === 1, "undo: onUndo called once");
  ok(player.children.length === 0, "undo: toast removed after click");
}

// 3. close click removes the toast WITHOUT calling onUndo
{
  const { NS, player } = makeHarness();
  let undoCalls = 0;
  NS.skipNotice.show({ category: "sponsor", onUndo: () => { undoCalls++; } });
  player.children[0].children[2].click();
  ok(player.children.length === 0, "close: toast removed");
  ok(undoCalls === 0, "close: onUndo not called");
}

// 4. a second show reuses a single toast (no stacking) and retargets Undo
{
  const { NS, player } = makeHarness();
  let first = 0, second = 0;
  NS.skipNotice.show({ category: "sponsor", onUndo: () => { first++; } });
  NS.skipNotice.show({ category: "intro", length: 30, onUndo: () => { second++; } });
  ok(player.children.length === 1, "replace: still a single toast");
  ok(player.children[0].children[0]._text === "Skipped: intro " + MID + " 0:30", "replace: label updated to the newest skip");
  player.children[0].children[1].click();
  ok(first === 0 && second === 1, "replace: Undo targets the most recent skip");
}

// 5. auto-dismiss removes the toast when the timer fires
{
  const { NS, player, runPending } = makeHarness();
  NS.skipNotice.show({ category: "sponsor", onUndo: () => {} });
  ok(player.children.length === 1, "auto-dismiss: toast present before timer");
  runPending();
  ok(player.children.length === 0, "auto-dismiss: toast removed when the timer fires");
}

// 6. clear() removes the toast
{
  const { NS, player } = makeHarness();
  NS.skipNotice.show({ category: "sponsor", onUndo: () => {} });
  NS.skipNotice.clear();
  ok(player.children.length === 0, "clear: toast removed");
}

// 7. fail-open: no player -> show() does not throw and draws nothing
{
  const { NS } = makeHarness({ withPlayer: false });
  let threw = false;
  try { NS.skipNotice.show({ category: "sponsor", onUndo: () => {} }); } catch { threw = true; }
  ok(!threw, "fail-open: show() with no player does not throw");
}

// 8. a stale Undo (clicked after clear) does not fire onUndo
{
  const { NS, player } = makeHarness();
  let undoCalls = 0;
  NS.skipNotice.show({ category: "sponsor", onUndo: () => { undoCalls++; } });
  const undoBtn = player.children[0].children[1];
  NS.skipNotice.clear();   // bumps generation, removes toast
  undoBtn.click();         // stale handler
  ok(undoCalls === 0, "stale: Undo after clear() does not fire onUndo");
}

// 9. a repeated click on the same Undo button fires onUndo only ONCE (one-shot)
{
  const { NS, player } = makeHarness();
  let undoCalls = 0;
  NS.skipNotice.show({ category: "sponsor", onUndo: () => { undoCalls++; } });
  const undoBtn = player.children[0].children[1];
  undoBtn.click();
  undoBtn.click(); // second click on the now-consumed toast
  ok(undoCalls === 1, "double-undo: onUndo fires only once (one-shot)");
}

// 10. hovering the toast pauses auto-dismiss; leaving re-arms it
{
  const { NS, player, runPending } = makeHarness();
  NS.skipNotice.show({ category: "sponsor", length: 10, onUndo: () => {} });
  const toast = player.children[0];
  toast.dispatch("mouseenter"); // pause: the pending dismiss timer is cleared
  runPending();                 // nothing queued -> the toast stays
  ok(player.children.length === 1, "hover: toast stays while the pointer is on it");
  toast.dispatch("mouseleave"); // re-arm a fresh dismiss timer
  runPending();                 // fires the re-armed timer
  ok(player.children.length === 0, "hover: toast dismisses after the pointer leaves");
}

// 11. a skip with no length degrades to the plain label (no separator)
{
  const { NS, player } = makeHarness();
  NS.skipNotice.show({ category: "sponsor", onUndo: () => {} });
  ok(player.children[0].children[0]._text === "Skipped: Sponsor", "no length: plain label, no separator");
}

// 12. each skip announces to a persistent, empty-until-populated aria-live region on body
{
  const { NS, body } = makeHarness();
  const region = body.children.find((c) => c.className === "sbskip-sr-only");
  ok(region && region._attrs["aria-live"] === "polite", "aria-live: persistent polite region created on body");
  ok(region._text === "", "aria-live: region starts empty (created before it is populated)");
  NS.skipNotice.show({ category: "sponsor", length: 64, onUndo: () => {} });
  ok(region._text === "Skipped: Sponsor " + MID + " 1:04", "aria-live: region announces the skip");
  NS.skipNotice.clear();
  ok(body.children.filter((c) => c.className === "sbskip-sr-only").length === 1, "aria-live: single region survives clear()");
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
