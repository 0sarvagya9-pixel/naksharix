# Customer payment and report-status language repair

## Scope

The customer checkout, Payment History, payment-success continuation, report-success states, automatic-delivery retry controls and shared mutation notifications now use explicit English, Hindi and Hinglish dictionary keys. Payment purposes and statuses are translated for display; stored codes, request payloads, charges and ownership/entitlement checks are unchanged. Saved custom report titles and customer data are not guessed or rewritten.

Checkout status is stored as a key, so an already displayed pending-payment message follows a language switch. Gateway callbacks read the current UI language when emitting a notification. The pending/unknown outcome remains locked and directs the customer to existing Payment History without another charge. A malformed or mismatched acknowledgement still cannot trigger the verified callback.

Unknown server error text is not displayed as customer prose. Public checkout uses stable response-status categories. Report retry uses stable response-status categories and acknowledges a retry only when the response explicitly says `data.queued === true`. A failed or malformed Payment History response is shown as unavailable rather than as an empty purchase history. Detailed report delivery errors remain stored for operational review; the customer sees a localized, status-based recovery explanation. Provider email acceptance is not presented as proof of inbox delivery.

The existing bilingual Puja fee disclosure and its terms version are preserved. The surrounding fee dialog, acknowledgement and action controls are localized.

The payment-success page describes the verified payment record without claiming that a report request was submitted. No-charge admin access has its own heading and explanation, and ignores payment IDs in its URL. The stored product ID, purpose, price and purchase context determine whether a fixed-report form is offered; the URL's plan cannot change the product. An owned linked request leads to its status page. Shop purchases, subscriptions and unmatched report purchases lead to the dashboard and existing Payment History. Subscription plan labels use stored purchase metadata. No backend payment or delivery entitlement is relaxed.

The shared notification layer translates exact endpoint/status message keys and default titles. It does not infer successful payment from an order/verification HTTP response. Existing `silent` callers remain silent; the repaired consultation request form already uses this mechanism.

## Language switching

An explicit change of language persists the cookie and updates the client context before invoking `router.refresh()`, so server-rendered account/report status can be refreshed in the selected language. Selecting the current language is a no-op. Initial hydration and storage-event synchronization do not trigger refresh loops.

## Verification

```sh
PLAYWRIGHT_BROWSERS_PATH=/path/to/existing/playwright-browsers node scripts/qa-customer-localization-ui.mjs
node scripts/qa-customer-status-pages.mjs
node scripts/qa-site-notifications.mjs
node scripts/qa-puja-offerings.mjs
```

The Chromium harness exercises **66 cases** across three languages using the actual checkout, payment-history, retry, language-provider and notification components, shared copy, catalogue mappings and acknowledgement validators. It covers malformed orders, transport/409 failures, mismatched/unpaid verification, duplicate callbacks, post-verification continuation errors, exact existing-purchase resume links, payment-history failure, acknowledged/unacknowledged retry, unknown server-text suppression, silent requests, fallback locale, unchanged-locale behavior, cookie-before-refresh ordering and a language change during an active gateway callback. Router, transport and gateway SDK are isolated.

The server-rendering harness exercises **90 cases** across three languages. Actual payment/report pages are rendered with isolated account, database and entitlement decisions. It checks localized ready/email-accepted/manual/refunded/reconciliation states, removal of private-download links for refunded or unreconciled purchases, suppression of internal error prose and retained ownership redirects. Payment receipt cases cover no-charge admin access, rejection of a non-admin bypass, ignored admin payment IDs, verified payment without a request, existing owned requests, different report SKUs, stored subscription plans, shop receipts and malformed or mismatched purchase contexts. Neither a manipulated plan query nor payment status alone can create a report-confirmed message or a mismatched report continuation.

The adjacent notification and Puja source contracts now follow the dictionary keys while retaining their original payment-safety assertions. Focused ESLint and full TypeScript checking are required alongside these commands.

These checks do not certify live payments, email delivery, database entitlements or professional language quality. They do not close all of A44: broader dashboard prose, additional tools, other standalone notice callers, transactional email and independent editorial acceptance require their own coverage. No Royal report source, numerical engine, production deployment or provider configuration is changed by this work.
