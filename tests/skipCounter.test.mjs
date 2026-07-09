// Headless: content/skipCounter.js batches record()/unrecord() deltas and flushes
// them to a fake chrome.storage.local on a debounce timer. Covers: record writes,
// a record+undo pair nets zero, unrecord decrements after a flush, the >=0 clamp,
// and the flush SERIALIZATION that keeps an Undo's negative flush from interleaving
// with the skip's positive flush (which would resurrect the count).
// ASCII-only. Run: node tests/skipCounter.test.mjs
import { readFileSync } from "node:fs";

let fails = 0;
const ok = (c, msg) => { if (!c) { console.log("[FAIL]", msg); fails++; } else console.log("[PASS]", msg); };
const tick = () => new Promise((r) => setTimeout(r, 5)); // drain the module's microtasks

// Load config.js (NS.STORAGE + NS.contextAlive) + skipCounter.js with a fake chrome
// and controllable debounce timers. getSnapshots records what each storage read saw,
// so the serialization test can prove the undo flush reads after the record wrote.
function makeHarness() {
  const store = {}; // { skipStats?: {count, seconds} }
  const getSnapshots = [];
  const chrome = {
    runtime: { id: "test" }, // NS.contextAlive() -> true
    storage: {
      local: {
        async get(k) {
          getSnapshots.push(store[k] ? { ...store[k] } : null);
          return k in store ? { [k]: store[k] } : {};
        },
        async set(obj) { Object.assign(store, obj); }
      },
      onChanged: { addListener() {} }
    }
  };
  let seq = 0;
  const timers = new Map();
  const setT = (fn) => { const id = ++seq; timers.set(id, fn); return id; };
  const clrT = (id) => timers.delete(id);
  const fireTimers = () => { const fns = [...timers.values()]; timers.clear(); fns.forEach((f) => f()); };

  const self = { __SBSKIP__: {} };
  const load = (f) =>
    new Function("self", "chrome", "setTimeout", "clearTimeout", readFileSync(new URL("../content/" + f, import.meta.url), "utf8"))(self, chrome, setT, clrT);
  load("config.js");
  load("skipCounter.js");
  return { NS: self.__SBSKIP__, store, getSnapshots, fireTimers };
}

// 1. record then flush writes {count, seconds}
{
  const { NS, store, fireTimers } = makeHarness();
  NS.skipCounter.record(60);
  fireTimers();
  await tick();
  ok(store.skipStats && store.skipStats.count === 1 && store.skipStats.seconds === 60,
     "record: flush writes {1, 60}");
}

// 2. record + unrecord in the same batch nets zero -> nothing written
{
  const { NS, store, fireTimers } = makeHarness();
  NS.skipCounter.record(60);
  NS.skipCounter.unrecord(60);
  fireTimers();
  await tick();
  ok(store.skipStats === undefined, "record+unrecord same batch: nothing persisted");
}

// 3. unrecord after a prior flush decrements back to zero
{
  const { NS, store, fireTimers } = makeHarness();
  NS.skipCounter.record(60);
  fireTimers();
  await tick(); // store {1, 60}
  NS.skipCounter.unrecord(60);
  fireTimers();
  await tick(); // store {0, 0}
  ok(store.skipStats.count === 0 && store.skipStats.seconds === 0,
     "unrecord after flush: back to {0, 0}");
}

// 4. clamp: unrecord with no prior recorded skip floors at 0 (never negative)
{
  const { NS, store, fireTimers } = makeHarness();
  NS.skipCounter.unrecord(60);
  fireTimers();
  await tick();
  ok(store.skipStats.count === 0 && store.skipStats.seconds === 0,
     "clamp: unrecord with no prior skip floors at {0, 0}");
}

// 5. overlapping flush serialization: the skip's positive flush and the Undo's
//    negative flush must not interleave their read-modify-write.
//    With the flushChain, the undo flush reads the store AFTER the record wrote it,
//    so record+undo cannot leave the skip resurrected.
{
  const { NS, store, getSnapshots, fireTimers } = makeHarness();
  NS.skipCounter.record(60);
  fireTimers();               // flush#1 -> chained persist(+1, +60) begins
  NS.skipCounter.unrecord(60);
  fireTimers();               // flush#2 -> chained persist(-1, -60) QUEUED behind #1
  await tick();               // drain the serialized chain
  ok(getSnapshots.length === 2, "serialize: exactly two storage reads");
  ok(getSnapshots[1] && getSnapshots[1].count === 1,
     "serialize: undo flush reads AFTER the record flush wrote (chain ordered)");
  ok(store.skipStats.count === 0 && store.skipStats.seconds === 0,
     "serialize: record+undo end at {0, 0} (undo not lost)");
}

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
