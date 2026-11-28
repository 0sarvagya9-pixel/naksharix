# Provider and device controls — 2026-11-27

## Completed scope

This batch covers eight previously inventoried operational controls:

- Account push preferences and phone connection approval.
- Provider profile, credential submission and private note forms.
- Provider availability, booking actions and logout.

The mobile connection, provider profile and provider availability private entry pages also use the requested locale for page copy and metadata. They retain authentication/role boundaries, private indexing settings and the mobile page's no-referrer setting. The wider account profile, provider dashboard and navigation are separate surfaces and are not represented as fully localized by this batch.

English, Hindi and Hinglish now cover these controls, consent text, action labels, statuses, known errors and unconfirmed outcomes. Raw server errors are not forwarded into the notices. Unconfirmed writes preserve entered form values and block another mutation until records are reviewed; confirmed actions require the recorded response fields specified by the actual endpoint. Synchronous guards prevent repeated submission before React has rendered the busy state.

## Verified defects and behavior

The immutable `15784f5` browser baseline reproduced two same-turn profile requests, unchecked channels sent as the string `"false"`, a credential success notice from an empty response, and an all-devices-revoked notice despite `revoked: false`.

The actual baseline profile handler was also executed with isolated persistence. It stored string `"false"` as `true` and an empty optional session price as zero. The repository search found the profile form as the only caller of this JSON endpoint. The current form sends booleans and omits an unset session price. The current handler requires actual booleans, rejects strings and numbers with 422, and maps an empty optional session price to null. Existing role checks, price bounds and the `PENDING_REVIEW` transition remain intact. An outdated client that still sends string booleans must refresh instead of silently enabling a channel.

Profile receipts must match the authenticated user, existing profile identity where applicable, submitted fields and review state. Private-note receipts must match the customer, text, nonempty record and provider identities, and `private: true`. Availability receipts must match the chosen day, times, mode, active/holiday flags and status. Credential submission acknowledges only `submitted: true` with `PENDING`; a submission is never represented as independent verification. After an uncertain credential submission the review status is shown as unconfirmed.

Push readiness validates the actual consent version, boolean readiness, valid device count and public-key shape. An unreadable count remains unknown. Registration requires an explicit recorded acknowledgement and does not claim actual notification delivery. Revoke-all requires `revoked: true` and zero remaining registrations. Local unsubscribe failure remains visibly unconfirmed, including the case where server revocation did succeed. The shared push helper retains local-unsubscribe cleanup even when the server request fails; existing callers can continue ignoring its newly returned result. Permission prompts remain tied to an explicit enable gesture.

Booking payment/status policy, private-note eligibility, credential role/URL/rate limits, phone origin/ticket checks, device ownership/verification/limits and logout session revocation are preserved. Browser navigation follows verified booking/logout acknowledgements and never replays a POST.

## Fresh evidence

| Suite | Result | Actual code exercised |
| --- | --- | --- |
| `qa-provider-account-controls.mjs` | **314 passed** | Eight mounted Chromium controls, actual locale/CSRF code and push helper; HTTP, browser permission/subscription and Next router boundaries isolated |
| `qa-provider-account-routes.mjs` | **106 passed** | Eight actual API modules, actual schemas, sanitizer and policy functions; account, DB, quotas, signing and session storage operations isolated |
| Private pages in the route suite | **24 passed** | Three actual private entry pages and metadata in three locales, invalid ticket and role denial cases |

The baseline client-form `action(FormData)` handlers use a compatibility bridge in the React 18 UMD harness; it invokes the original baseline function. Current forms use their real submit handlers. Primitive presentation components and Next navigation are adapted at the boundary. No substitute business state machine supplies these results.

Run the maintained qualification commands from the repository root:

```sh
node scripts/qa-provider-account-controls.mjs
node scripts/qa-provider-account-routes.mjs
```

Optional baseline reproduction requires the immutable commit to be present locally; normal CI does not depend on Git history:

```sh
PROVIDER_ACCOUNT_BASELINE=15784f5 node scripts/qa-provider-account-controls.mjs
PROVIDER_ACCOUNT_BASELINE=15784f5 node scripts/qa-provider-account-routes.mjs
```

Full TypeScript and scoped ESLint completed successfully. The existing provider workspace and mobile-native checks passed. Booking reliability passed 10/10, and the existing push contract passed. Two existing static guards were updated solely to follow extracted locale text: `scripts/qa-booking-reliability.mjs` now verifies the booking date copy binding and dictionary; `scripts/qa-web-push-contract.mjs` verifies the registration notice binding and delivery disclaimer dictionary. Their other policy assertions remain in place.

Integration evidence is under `evidence/ai-reminder-recovery/`:

- `provider-browser-qualified.log`
- `provider-routes-qualified.log`
- `provider-baseline-final.log`
- `provider-routes-baseline.log`
- `provider-typecheck-qualified.log`
- `provider-lint-qualified.log`
- `provider-workspace-contract.log`
- `provider-mobile-contract.log`
- `provider-booking-contract-final.log`
- `provider-push-contract-final.log`

Earlier harness diagnostics and superseded counts are retained separately. They do not supply the final counts above. No real device permission, subscription, account approval, provider/DB write, notification, email or payment occurred in this qualification.

## Remaining boundary

These eight controls are no longer the open component items described in the earlier bounded A44 inventory. The other inventoried components are owned by separate integration batches and must use their own receipts. Wider dashboard/navigation/account-profile copy, independent native-language review and actual localized delivery acceptance still require their own evidence. A44 and production readiness are not closed by this local engineering batch.
