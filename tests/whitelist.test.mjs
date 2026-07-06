// Headless: normalizeChannel must produce ids that content/channel.js can
// actually return ("@handle", "channel/UC...", "c/name", "user/name"), else
// null. Run: node tests/whitelist.test.mjs
import { normalizeChannel } from "../settings/whitelist.js";

let fails = 0;
const eq = (got, want, msg) => {
  if (got !== want) { console.log("[FAIL]", msg, "got", JSON.stringify(got), "want", JSON.stringify(want)); fails++; }
  else console.log("[PASS]", msg);
};

eq(normalizeChannel("@handle"), "@handle", "handle with @");
eq(normalizeChannel("handle"), "@handle", "bare handle gets @");
eq(normalizeChannel("UCabcdefghijklmnopqrstuv"), "channel/UCabcdefghijklmnopqrstuv", "bare UC id -> channel/UC...");
eq(normalizeChannel("channel/UCabcdefghijklmnopqrstuv"), "channel/UCabcdefghijklmnopqrstuv", "channel/UC passthrough");
eq(normalizeChannel("https://www.youtube.com/@somechannel"), "@somechannel", "URL @handle");
eq(normalizeChannel("https://www.youtube.com/channel/UC123456789012345678"), "channel/UC123456789012345678", "URL channel id");
eq(normalizeChannel("c/SomeName"), "c/SomeName", "legacy c/ form");
eq(normalizeChannel("user/SomeUser"), "user/SomeUser", "legacy user/ form");
eq(normalizeChannel(""), null, "empty -> null");
eq(normalizeChannel("   "), null, "whitespace -> null");
eq(normalizeChannel("has spaces!!"), null, "unmatchable -> null (not stored)");
eq(normalizeChannel("@"), null, "lone @ -> null");

console.log(fails ? "FAILED" : "OK");
process.exit(fails ? 1 : 0);
