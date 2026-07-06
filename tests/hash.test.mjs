// Headless: SHA-256 hex-prefix of the pinned fixture videoID must be "5f6b".
// Run: node tests/hash.test.mjs
import { sha256HexPrefix } from "../background/hash.js";

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", got, "want", want); fails++; }
  else console.log("[PASS]", msg);
};

eq(await sha256HexPrefix("5GKIUKsrnKo", 4), "5f6b", "prefix len 4 of fixture videoID");
eq(await sha256HexPrefix("5GKIUKsrnKo", 8), "5f6bbb7c", "prefix len 8 of fixture videoID");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
