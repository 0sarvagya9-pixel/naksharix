import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => readFileSync(p, "utf8");
const layout = read("app/layout.tsx");
const css = read("app/site-notifications.css");
const center = read("components/ui/site-notification-center.tsx");
const emitter = read("lib/ui/site-notification.ts");
const secure = read("lib/security/csrf.ts");
const pay = read("components/razorpay-checkout-button.tsx");
const browserConfig = read("tests/e2e/playwright.config.ts");
const add = read("components/shop/quote-cart-controls.tsx");

assert.ok(browserConfig.includes('"site-notification-center.spec.ts"'),
  "Browser release must exercise the popup in Chromium, Firefox and WebKit");
assert.ok(layout.includes("<SiteNotificationCenter />") &&
  layout.includes('import "@/app/site-notifications.css"'),
  "Global notification UI must be installed in the root layout, not a single route");
assert.ok(emitter.includes('SITE_NOTIFICATION_DURATION_MS = 5000') &&
  emitter.includes('SITE_NOTIFICATION_EVENT = "naksharix:site-notification"') &&
  emitter.includes("window.dispatchEvent(new CustomEvent"),
  "All notifications require one type-safe, five-second event contract");
assert.ok(center.includes("SITE_NOTIFICATION_DURATION_MS") &&
  center.includes("window.setTimeout(dismiss, SITE_NOTIFICATION_DURATION_MS)") &&
  center.includes("window.clearTimeout(timeout)") &&
  center.includes('key={active.id}') &&
  center.includes("createPortal(") &&
  center.includes('className="pointer-events-none fixed left-[50vw] top-[50vh]') &&
  center.includes("w-[calc(100vw-2rem)]") &&
  center.includes("-translate-x-1/2 -translate-y-1/2") &&
  center.includes('aria-label="Dismiss notification"') &&
  center.includes('data-site-notifications-ready="true"') &&
  center.includes('role={active.kind === "error" ? "alert" : "status"}') &&
  center.includes("window.addEventListener(SITE_NOTIFICATION_EVENT") &&
  center.includes("window.removeEventListener(SITE_NOTIFICATION_EVENT"),
  "Center notification must position correctly, be accessible and auto-dismiss without leaking listeners");
assert.ok(css.includes("nx-center-notice-expire 5000ms") &&
  css.includes("prefers-reduced-motion: reduce") &&
  css.includes("max-height: min(75dvh") &&
  !css.includes("position: absolute"),
  "Motion, timer and mobile constraints must stay safe");
assert.ok(secure.includes("if (isMutation && !response.ok)") &&
  secure.includes("siteNotice.error(") &&
  secure.includes("if (isMutation && response.ok)") &&
  secure.includes('"POST /api/commerce/orders"') &&
  secure.includes('"POST /api/report-requests"') &&
  secure.includes('"POST /api/puja/bookings"') &&
  secure.includes('"POST /api/consultation-bookings"') &&
  secure.includes('"POST /api/support/tickets"') &&
  secure.includes('"POST /api/auth/login"') &&
  !secure.includes('"POST /api/payments/razorpay/order":') &&
  !secure.includes('"POST /api/payments/razorpay/verify":'),
  "Global mutation notifications may show persisted requests but never infer payment success from an HTTP order");
const verified = pay.indexOf('if (!verifyResponse.ok||!isVerifiedPaymentAck(');
const success = pay.indexOf('siteNotice.success("Your payment has been verified.');
assert.ok(verified !== -1 && success > verified &&
  pay.includes('secureFetch("/api/payments/razorpay/verify"') &&
  pay.includes("const verifyJson=await verifyResponse.json()") &&
  pay.includes("providerPaymentId:response.razorpay_payment_id") &&
  secure.includes('siteNotice.warning(') &&
  secure.includes('"Payment status pending"') &&
  pay.includes('setStatus("Payment confirmation is pending.') &&
  pay.includes('setStatus("Payment confirmation could not be checked.'),
  "Only gateway-verified capture gets a success notification; pending must remain visible");
assert.ok(add.includes('siteNotice.success(copy.addedMessage,copy.added)') &&
  add.includes('siteNotice.error(copy.cartStorage,copy.storageTitle)') &&
  add.includes('siteNotice.warning(copy.limitMessage,copy.limitTitle)') &&
  add.indexOf('writeCart(list)') < add.indexOf('siteNotice.success(copy.addedMessage') &&
  read("lib/shop/checkout-copy.ts").includes('"addedMessage": "Item added to your cart.') &&
  read("lib/shop/checkout-copy.ts").includes('"limitMessage": "Maximum 10 units') &&
  read("lib/shop/checkout-copy.ts").includes('"cartStorage": "Cart could not be saved'),
  "Shop local storage events require accurate global confirmation");

for (const path of ["components/auth-form.tsx", "components/consultation-booking.tsx", "components/admin-puja-offerings.tsx"]) {
  assert.ok(read(path).includes("siteNotice.warning("), "Missing inline validation notification: " + path);
}
console.log("NAKSHARIX_CENTERED_NOTIFICATIONS_STATIC=PASS;GLOBAL_LAYOUT=YES;AUTO_DISMISS_MS=5000;API_ERRORS=ALL_MUTATIONS;PAYMENT_SAFETY=YES;REDUCED_MOTION=YES");
