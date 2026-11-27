# A44 — bounded operational language inventory and completion receipts

## Follow-up disposition — 2026-11-27

The 17-file list below is the historical inventory at `7c3de8f89c26bc4a5d3eb07bb9cf56bd807fb21b`. All 17 listed controls have subsequently received English/Hindi/Hinglish action copy, receipt checks, guarded mutation paths and scoped runtime qualification in this development branch. The original table is retained to make that boundary auditable; its rows are no longer an unimplemented work list.

| Inventory scope | Controls | Fresh scoped receipt | Maintained evidence |
| --- | ---: | --- | --- |
| Account/device and provider controls | 8 | 314 mounted Chromium + 106 actual route/schema/policy + 24 private-page SSR cases | `docs/qa/provider-account-controls-20261127.md`; `qa-provider-account-controls.mjs`, `qa-provider-account-routes.mjs` |
| Shop shipping and catalogue controls | 2 | 141 mounted Chromium + 43 actual route/private-page cases | `docs/SHOP_ADMIN_RECOVERY_20261127.md`; `qa-shop-admin-ui.mjs`, `qa-shop-admin-contracts.mjs` |
| Report correction and workflow controls | 2 | 91 mounted Chromium + 25 actual route/private-page cases | `docs/REPORT_ADMIN_OPERATIONS_20261127.md`; `qa-report-admin-operations.mjs` |
| Deferred-service and owner verification controls | 5 | 204 mounted Chromium + 82 actual handler/schema/policy + 27 private-page SSR cases | `docs/DEFERRED_AND_OWNER_CONTROLS_20261127.md`; `qa-deferred-controls-ui.mjs`, `qa-deferred-controls-routes.mjs` |

These are isolated development receipts. They do not establish real email delivery, a production encrypted restore, real device acceptance, independent language review or acceptance of every rendered route. Broader provider dashboard/navigation and authored course/workbook content remain outside this bounded list. A44 remains partial under its original acceptance criterion. The CI workflow runs all seven maintained commands above and retains their logs for the exact candidate commit.

## Boundary

The AI customer, AI chat and reference-reminder batches do not close A44 for the whole site. This source inventory records **17 remaining component files** outside those batches. Their contents were checked against integration head `7c3de8f89c26bc4a5d3eb07bb9cf56bd807fb21b` on 2026-11-27 and matched the inspected recovery worktree. This is a bounded source inventory, not a declaration that every other rendered route is translated, accessible or independently reviewed.

At the inventory checkpoint these controls needed deliberate English/Hindi/Hinglish copy and runtime qualification. The follow-up above includes mutation errors, consent prompts, result acknowledgement and recovery paths as well as visible headings.

| Operational area | Exact remaining sources | Confirmed English examples |
| --- | --- | --- |
| Account browser notifications | `components/push-preferences.tsx` | Account notification preferences; enable/disable/revoke controls; consent; registration and revocation notices; unknown status. |
| Phone account connection approval | `components/mobile-account-link-approval.tsx` | Connect your Android app; signed-in account warning; five-minute expiry; approval button; connection expired, failure and successful approval text. |
| Provider professional profile | `components/astrologer-profile-form.tsx` | Saving your professional profile; profile saved and sent for admin review; profile form field labels. |
| Provider credentials | `components/astrologer-credential-form.tsx` | Reference saved for independent administrator review; no verification badge yet; credential form fields and errors. |
| Provider private notes | `components/astrologer-note-form.tsx` | Private note title; save private note; saving/saved/failure notices. |
| Provider availability | `components/availability-form.tsx` | Availability saved; interrupted connection and refresh-before-retry notice; scheduling controls. |
| Provider booking actions | `components/astrologer-booking-actions.tsx` | Future IST date validation; booking updated; result unconfirmed and refresh instruction. |
| Provider sign-out | `components/astrologer-logout-button.tsx` | Sign-out could not be confirmed; please try again. |
| Unpaid deferred-service intake | `components/deferred-service-request-form.tsx` | Unpaid review request recorded; no payment or reservation; request unconfirmed recovery. |
| Customer deferred proposals | `components/deferred-service-allocations.tsx` | Private review proposals; acknowledge unpaid proposal; confirmation dialog; cancellation, expiry and progress labels. |
| Staff deferred planning | `components/admin/deferred-service-planning.tsx` | Internal review operation recorded; outcome uncertain; date validation; capacity/progress fields; attest reviewed records confirmation. |
| Staff country shipping rates | `components/shop/admin-shipping-rates.tsx` | Rate saved; active/unexpired/verified quote notice; shipping editor fields and failure notices. |
| Staff shop catalogue | `components/admin-shop-content.tsx` | Required product-field validation; seed-price notices; published catalogue reset confirmation. |
| Staff report correction review | `components/admin/report-correction-review.tsx` | Review could not be confirmed; reload this request; review controls. |
| Staff report workflow | `components/admin/report-request-actions.tsx` | Workflow updated and audit notice; generated-PDF notice and refresh instruction. |
| Staff mailbox acceptance control | `components/admin/admin-email-acceptance-test.tsx` | Provider accepted the request; independently confirm Inbox/Spam/Promotions receipt; acceptance status. |
| Staff encrypted recovery control | `components/admin/manual-encrypted-recovery-control.tsx` | Verified/unverified restore status; run-in-progress warning; interrupted request and recheck instruction. |

The parent integration also contains parallel support/fulfilment, course/expert/admin and digital-package work. Those owned scopes must use their own final evidence; they are not relisted here as unfinished merely because this worktree originated before those cherry-picks.

## English content that has a declared content language

The following are authored content, rather than untranslated action controls. They should remain accurately disclosed until separately authored and reviewed translations exist:

- `lib/digital-packages/catalogue.ts` explicitly declares the business-name PDF, self-study course, study workbook and reference-calendar PDF as English products (`language: "en"`).
- `lib/learning/paid-course.ts` composes paid lessons from the authored `studyChapters` in `lib/digital-packages/workbooks.ts` and the cases/questions in `lib/learning/paid-course-contract.ts`. Translated lesson-navigation, consent and error controls do not turn those chapter bodies into a Hindi or Hinglish course.
- `lib/reports/fictional-sample.ts` explicitly generates the fictional public report sample with `language: "en"`. `lib/reports/public-intake.ts` labels the sample language as English. Customer report language selection remains a separate contract.
- The reference-reminder service now uses the saved account locale for actual email composition. That change does not change the declared English language of the separately purchased reference-calendar PDF.

Names entered by customers or staff, product identifiers, consent-version strings, source titles, URLs, API enum values and internal logs should not be mechanically translated. Where a status enum is rendered to a person, the UI should map it to reviewed locale copy while preserving the stored value.

## Acceptance still required

The listed operational controls now have maintained qualification for actual mounted flows, rejected/uncertain requests and consent changes. Independent native Hindi/Hinglish review, real localized inbox acceptance and coverage of other rendered routes remain separate evidence requirements. A44 remains partial until the original acceptance criteria, rather than a component count, are satisfied.
