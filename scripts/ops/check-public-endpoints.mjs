import assert from "node:assert/strict";

export const BASE_URL = "https://www.naksharix.com";
const ADS_SELLER = "google.com, pub-7848529669366564, DIRECT, f08c47fec0942fa0";

export async function checkPublicEndpoints(fetcher = fetch, base = BASE_URL) {
  const endpoints = ["/api/health", "/api/release", "/ads.txt", "/", "/kundli", "/advertising"];
  const results = [];
  for (const path of endpoints) {
    let passed = false;
    let status = "unreachable";
    try {
      const response = await fetcher(base + path, {
        cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(18000)
      });
      status = String(response.status);
      if (response.ok) {
        const body = (await response.text()).slice(0, 200000);
        if (path === "/api/health") {
          const data = JSON.parse(body).data;
          passed = data?.status === "ok" &&
            data?.checks?.app === "ok" && data?.checks?.database === "ok";
        } else if (path === "/api/release") {
          const data = JSON.parse(body).data;
          passed = data?.environment === "production" &&
            data?.branch === "complete-production-polish" &&
            /^[a-f0-9]{40}$/.test(data?.commitSha ?? "");
        } else if (path === "/ads.txt") {
          passed = body.trim() === ADS_SELLER;
        } else {
          passed = body.length > 300 && !/Authentication Required/i.test(body);
        }
      }
    } catch {
      // Never log response bodies, headers, cookies, birth data or credentials.
    }
    results.push({path, passed, status});
  }
  return {passed: results.every(item => item.passed), results};
}

if (process.argv[1]?.endsWith("check-public-endpoints.mjs")) {
  let result;
  for (let attempt = 1; attempt <= 3; attempt++) {
    result = await checkPublicEndpoints();
    if (result.passed) break;
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 10000));
  }
  assert.ok(result);
  console.log("NAKSHARIX_PUBLIC_MONITOR=" + (result.passed ? "PASS" : "FAIL"));
  console.log("PUBLIC_ENDPOINT_COUNT=" + result.results.length);
  if (!result.passed) {
    console.error("FAILED_PATHS=" + result.results.filter(x => !x.passed)
      .map(x => x.path + " HTTP_" + x.status).join(", "));
    process.exitCode = 1;
  }
}
