import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isTransientDatabaseError, retryTransientDatabaseRead, neonRuntimeDatabaseUrl } from "../lib/db-transient.ts";

const read = (path) => readFileSync(path, "utf8");
for (const code of ["P1001", "P1002", "P1008", "P1017"]) {
  assert.equal(isTransientDatabaseError({ code }), true, "READ_OUTAGE_CODE_" + code);
}
assert.equal(isTransientDatabaseError({ errorCode: "P1001" }), true, "INITIALIZATION_ERROR_CODE");
assert.equal(isTransientDatabaseError({
  name: "PrismaClientInitializationError",
  message: "Can't reach database server at pooler.invalid:5432"
}), true, "INITIALIZATION_ERROR_MESSAGE");
for (const code of ["P2021", "P2002", "P2025"]) {
  assert.equal(isTransientDatabaseError({ code }), false, "NONTRANSIENT_" + code);
}
assert.equal(isTransientDatabaseError(new Error("Unrelated application bug")), false, "APP_BUG_NOT_SUPPRESSED");
let attempts = 0;
assert.equal(await retryTransientDatabaseRead(async () => {
  attempts += 1;
  if (attempts === 1) throw { code: "P1001" };
  return "published-data";
}), "published-data", "ONE_READ_RETRY_MUST_RECOVER");
assert.equal(attempts, 2, "ONLY_ONE_READ_RETRY");
attempts = 0;
await assert.rejects(() => retryTransientDatabaseRead(async () => {
  attempts += 1;
  throw new Error("Application error");
}), /Application error/);
assert.equal(attempts, 1, "NEVER_RETRY_UNRELATED_ERRORS");

const sample = neonRuntimeDatabaseUrl("postgresql://test:dummy@ep-test-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require");
assert.ok(sample, "NEON_URL_EXPECTED");
const parsed = new URL(sample);
assert.equal(parsed.searchParams.get("connect_timeout"), "15", "NEON_CONNECT_TIMEOUT");
assert.equal(parsed.searchParams.get("pool_timeout"), "15", "NEON_POOL_TIMEOUT");
assert.equal(parsed.searchParams.get("sslmode"), "require", "NEON_SSL_PRESERVED");
const operator = new URL(neonRuntimeDatabaseUrl("postgresql://test:dummy@ep-test-pooler.c-8.us-east-1.aws.neon.tech/neondb?connect_timeout=23&pool_timeout=24"));
assert.equal(operator.searchParams.get("connect_timeout"), "23", "OPERATOR_CONNECT_TIMEOUT_PRESERVED");
assert.equal(operator.searchParams.get("pool_timeout"), "24", "OPERATOR_POOL_TIMEOUT_PRESERVED");
assert.equal(neonRuntimeDatabaseUrl("postgresql://test:dummy@db.example.com/test"), undefined, "DO_NOT_REWRITE_NON_NEON_DB");
assert.equal(neonRuntimeDatabaseUrl("invalid-url"), undefined, "INVALID_URL_FAIL_CLOSED");
assert.ok(read("lib/db.ts").includes("datasourceUrl: neonDatasourceUrl"), "NEON_TIMEOUT_NOT_WIRED");
const shopStore = read("lib/shop/catalogue-store.ts");
const pujaStore = read("lib/puja/offerings.ts");
assert.ok(shopStore.includes("retryTransientDatabaseRead") &&
  shopStore.includes("if (isTransientDatabaseError(error))") &&
  shopStore.includes("products: [], version: 0, storageReady: false"),
  "SHOP_MUST_NOT_EXPOSE_STALE_PRICES_ON_CONNECTION_LOSS");
assert.ok(pujaStore.includes("retryTransientDatabaseRead") &&
  pujaStore.includes("if(isTransientDatabaseError(error))return {};"),
  "PUJA_MUST_NOT_PUBLISH_UNVERIFIED_PRICES_ON_CONNECTION_LOSS");
assert.ok(read("app/page.tsx").includes("if (shop.storageReady) for (const product"),
  "HOME_MUST_NOT_EXPOSE_SEED_PRICES_WHEN_STORAGE_UNAVAILABLE");
assert.ok(read("app/cart/page.tsx").includes("catalogue.storageReady&&") &&
  read("app/cart/page.tsx").includes("Checkout temporarily unavailable"),
  "CART_CHECKOUT_MUST_FAIL_CLOSED");
for (const page of ["app/shop/page.tsx", "app/shop/[slug]/page.tsx"]) {
  assert.ok(read(page).includes("!catalogue.storageReady") &&
    read(page).includes("temporarily unavailable"), "PUBLIC_SHOP_OUTAGE_PAGE_" + page);
}
const product = read("app/shop/[slug]/page.tsx");
assert.ok(product.includes("Product details and secure checkout") &&
  product.includes("pay securely with Razorpay"), "PRODUCT_DETAIL_CHECKOUT_MESSAGING");
assert.ok(!product.includes("No automatic online checkout is active") &&
  !product.includes("Your order is an unpaid request"),
  "STALE_PRODUCT_DETAIL_PAYMENT_COPY");
const directory = read("components/puja/puja-services-directory.tsx");
assert.ok(directory.includes("₹1,100 published fee • Secure checkout") &&
  directory.includes("Puja prices and online bookings are currently unavailable."),
  "PUJA_DIRECTORY_BOOKING_AND_OUTAGE_TRUTH");
assert.ok(!directory.includes("Pandit assignment and muhurat are confirmed before payment"),
  "STALE_PUJA_HERO_PAYMENT_WARNING");
assert.ok(!read("app/pujas/page.tsx").includes("Request a private review; priest availability"),
  "PUJA_META_STALE");
console.log("PUBLIC_COMMERCE_RESILIENCE_QA=PASS;TRANSIENT_RETRY=READ_ONLY;STALE_PRICE_CHARGE=DISABLED;PUBLIC_COPY=ALIGNED");
