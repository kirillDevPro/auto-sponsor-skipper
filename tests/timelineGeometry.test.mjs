// Headless: content/timelineGeometry.js — percent math (incl. non-finite guards)
// and tooltip length formatting. Run: node tests/timelineGeometry.test.mjs
import { readFileSync } from "node:fs";

const self = { __SBSKIP__: {} };
new Function(
  "self",
  readFileSync(new URL("../content/timelineGeometry.js", import.meta.url), "utf8")
)(self);
const G = self.__SBSKIP__.timelineGeometry;

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", JSON.stringify(got), "want", JSON.stringify(want)); fails++; }
  else console.log("[PASS]", msg);
};

eq(G.timeToPercent(50, 100), 50, "50/100 -> 50%");
eq(G.timeToPercent(0, 100), 0, "0 -> 0%");
eq(G.timeToPercent(200, 100), 100, "clamp over -> 100%");
eq(G.timeToPercent(-5, 100), 0, "clamp under -> 0%");
eq(G.timeToPercent(50, NaN), null, "NaN duration -> null");
eq(G.timeToPercent(50, 0), null, "0 duration -> null");
eq(G.timeToPercent(50, Infinity), null, "Infinity duration -> null (live/DVR)");

eq(G.percentToTime(50, 100), 50, "50% -> 50s");
eq(G.percentToTime(0, 100), 0, "0% -> 0s");
eq(G.percentToTime(50, Infinity), null, "Infinity -> null");

eq(G.formatLength(64), "1:04", "64 -> 1:04");
eq(G.formatLength(5), "0:05", "5 -> 0:05");
eq(G.formatLength(0), "0:00", "0 -> 0:00");
eq(G.formatLength(3723), "1:02:03", "3723 -> 1:02:03");
eq(G.formatLength(59.6), "1:00", "rounds up to 1:00");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
