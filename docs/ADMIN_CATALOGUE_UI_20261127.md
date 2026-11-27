# Admin catalogue and partner controls — 27 November 2026

English, Hindi and Hinglish now cover manual-report prices, Puja offers, partner registration/review and their private page metadata. Saved amounts remain integer paise. A new Puja draft remains unpublished at the existing ₹1,100 starting value; a previously saved price overrides that starting value. Changing an offer never charges a customer. The existing checkout, verified operator, scheduled ceremony, identity, evidence and payment readiness requirements remain in force.

Successful saves require the recorded offering to match every submitted editable field. A partner must be returned as pending with the matching name, region, exact supported topics and evidence. A review acknowledgement must identify the same partner and decision. An unknown response retains inputs and disables further changes until readback. Same-turn actions are locked synchronously. Starting a write invalidates older reads, so an earlier refresh cannot replace a newly saved price.

## Fresh evidence

`node scripts/qa-admin-catalogue-ui.mjs` passes **98 actual Chromium scenarios and 47 private-page, handler/schema and acknowledgement-parser checks**. Browser cases cover the three languages, existing prices, unpublished defaults, mismatched fields/identity/decision, malformed JSON, interruption, duplicate requests, held reads, localized unknown states, safe evidence links and independent verification disclosures. The three required-price cases exercise the actual localized global notification emitter as well as the inline validation. The actual route tests preserve role, evidence, supported-topic, positive-price and audit gates.

The catalogue currently has **zero eligible manual-rate forms**: all 15 current reports already use gateway-priced checkout. The suite confirms the actual empty eligibility state and the actual backend rejection of manual repricing for all 15. Parser checks are counted separately; no fictional manual product is introduced to claim browser coverage.

At immutable baseline `15784f5`, the same review probe observed the original success message for the wrong partner/decision and two PATCH requests from a same-turn double click. The baseline assertion correctly fails. A first current harness attempt used `NaN`, which JSON legitimately serializes to an allowed null price; that fixture was corrected to an invalid string. Its failed receipt is retained separately from the passing result.

Full-project TypeScript and scoped lint pass; lint reports three existing-style ref-cleanup warnings and no errors. Database, identity, network and image presentation are explicitly isolated in these tests. No real partner was approved, no price was changed in production, and no payment or outbound message was performed. Independent language/operational review and the original release acceptance gates remain open.
