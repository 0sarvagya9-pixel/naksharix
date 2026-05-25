# Premium PDF Automation Foundation Plan

## Current Status

Naksharix has a Kundli PDF foundation, but automated premium report PDF generation and delivery are not active. Reports remain manual/request-intent oriented with no payment, no WhatsApp workflow, and no instant delivery claim.

## Target Architecture

- HTML-to-PDF or Chromium renderer for premium templates.
- Multi-language templates for English, Hindi, and Hinglish.
- Chart visuals generated from canonical verified chart data.
- Versioned report sections.
- Manual/admin review before delivery.
- Database-backed report request, generation, and delivery records.
- User dashboard download only after a real generated file exists.

## Template Foundation

`fixtures/reports/premium-report-template-schema.json` defines the future reviewed template structure. It explicitly keeps:

- `paymentEnabled: false`
- `automaticGenerationEnabled: false`
- `automaticDeliveryEnabled: false`
- `requiresAdminReview: true`

## Hindi PDF Note

Hindi/Devanagari PDF quality should be validated with Chromium/HTML rendering before premium PDF launch. React PDF can be useful for simple output, but complex matra shaping and premium chart layout need render testing before production use.

## Activation Gate

Premium PDF automation requires:

1. Verified chart engine output.
2. Database report request workflow.
3. Admin review and status transitions.
4. Real PDF rendering and storage.
5. Legal/payment/refund alignment before paid delivery.

## Public Claim Boundary

Do not claim instant premium report generation, delivery, payment success, or downloadable paid PDF until the workflow is implemented end to end.
