import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const publisherId = "pub-7848529669366564";
const expected = "google.com, " + publisherId + ", DIRECT, f08c47fec0942fa0";
const content = readFileSync("public/ads.txt", "utf8");
const entries = content.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

assert.deepEqual(entries, [expected], "AdSense ads.txt must be the exact approved publisher's single Google seller entry");
assert.ok(/^[a-z0-9.-]+,\s+pub-\d{16},\s+DIRECT,\s+[0-9a-f]{16}$/.test(expected), "Invalid ads.txt seller record");

// The publisher ID is public, but do not preload the AdSense ad-serving JS
// before approval, policy review and consent design. ads.txt alone is a
// supported Google site ownership verification method.
const layout = readFileSync("app/layout.tsx", "utf8");
assert.ok(!layout.includes("adsbygoogle.js"), "Auto ads must not be enabled by the ownership-only change");
assert.ok(readFileSync("lib/adsense.ts", "utf8").includes('ADSENSE_ENABLE_SERVING === "true"'), "Global activation gate missing");
console.log("ADSENSE_OWNER_ADS_TXT=PASS;PUBLISHER_ID=EXPECTED;AUTO_ADS=NOT_ENABLED");
