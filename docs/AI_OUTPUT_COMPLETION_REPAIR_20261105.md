# AI response completion repair — 2026-11-05

## Observed production defect

Read-only/public synthetic questions against release 60ff165 returned HTTP 200 but unfinished prose in both English and Hindi. The strict chat adapter used a 900-token maximum and ignored the candidate finish reason. The report-draft adapter similarly ignored finish reason and silently sliced its text at 9,000 characters. These are implementation defects, not successful provider acceptance.

## Repair

Use model-aware low reasoning effort for Gemini 3; separate bounded output budgets of 4,096 chat tokens and 8,192 draft tokens. Gemini 2.5 retains its supported reasoning-budget form. Accept only STOP candidates, exclude thought parts, reject oversized/empty/blocked/incomplete output instead of displaying a partial success. Preserve the authorized professional-only report API, human review, rate limits, payment controls, model selection, existing failure responses and all authentication.

Tests execute both adapters with controlled provider responses: 25 assertions including MAX_TOKENS, safety, missing finish reason, Unicode, no reasoning disclosure, oversized-report rejection and model compatibility. Tests do not call a paid provider or use real credentials. Full CI and real public English/Hindi/Hinglish acceptance after deployment remain required.

## Separate operational acceptance

A real production verification email reached the owner's configured receiving mailbox during this session; Google reception headers reported SPF, DKIM and DMARC PASS. This verifies the email transport and account-verification message only, not every workflow or the 11-template admin suite. No recipient address, OTP, cookie or private mailbox content is included in source.

The latest backup status still reported configured=true, operational=false, fresh_verified_receipt_missing. No real production backup completion is claimed. PR96 stays gated on an actual successful receipt. Payments and AdSense remain unchanged.

## Primary provider references

- https://ai.google.dev/gemini-api/docs/generate-content/thinking
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5
