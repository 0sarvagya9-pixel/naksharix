# NAKSHARIX — GitHub-only Non-payment Engineering Acceptance Register (2026-10-26)

This describes source-code readiness, **not production readiness**. No Vercel
deploy, domain changes, account switches, live Neon DB writes, or Razorpay
configuration changes are authorized in this phase.

## Engineering capabilities staged in this change
- Consultation: role-gated external HTTPS meeting-link assignment and participant
  access for existing eligible confirmed bookings, with URL allowlist and concurrent
  update guard. This does NOT host or guarantee audio/video or create paid meetings.
- Learning: authenticated self-study completion for four existing courses/lessons,
  unique per user/lesson in PostgreSQL, replay safe, owner-only and rate-limited.
  Not an accredited course, examination or a certificate.
- Expert trust: personal credential reference submission, independent administrator
  review decision and private audit; public wording distinguishes marketplace
  approval from reviewed documentation. Actual authenticity requires human review.
- Puja partner operations: admin adds, reviews and suspends partner candidates with
  evidence and audit log, while public API lists reviewed records only. Zero fake
  partners are seeded; puja enquiry still cannot promise actual ceremony delivery.
- Astrologer notes: restrict private notes to customers with a valid consultation
  by the specific astrologer; prevent arbitrary-user note creation.
- Mobile: real local offline React Native numerology arithmetic with no server
  requests or stored birth dates; other mobile companion screens remain web-linked.
- Add-only staged SQL for LearningProgress and PujaPartner; production DB untouched.

## Code acceptance before GitHub merge
- Source/static and dependency safety
- ESLint, TypeScript, Prisma schema validation, app build
- Disposable localhost PostgreSQL E2E role and ownership gates
- Native offline calculation fixtures and Expo companion build
- Disposable schema backup and separate restore inventory match
- Full cross-browser release QA and Final Code Closure
- Pinned exact-head GitHub merge only after every gate PASS

## External unresolved requirements
- Professional credentials cannot be certified by self-submission or a button
  alone; real people must review issuers and references.
- Third-party call provider uptime/consent and real astrologer staffing are not
  supplied by session links alone.
- Real temple/pandit partnership, service execution, photos/prasad logistics
  and verified delivery depend on external operator agreements.
- Paid mentorship, live classes, instructor portal, exam proctoring and
  certificates require real qualified instructors and product/service setup;
  only truthful free self-study is implemented in this engineering tranche.
- Production Neon migrations, backup and restore proof, shared Redis and actual
  central alert integration cannot be accepted from disposable tests alone.
- Independent astronomical software fixtures, real OTP inbox, Google OAuth,
  mobile device coverage, accessibility and Play Store acceptance remain external.
- Shop verified suppliers/media storage and fulfillment are still pending.
- Payment is excluded by explicit owner request. Do not change Razorpay.

## Recovery
Authoritative base: complete-production-polish, commit
088018f51a2f2daca14124ad6ebf84b4da768fde.
Work branch: feat/nonpayment-operations-closure-20261026.
Resume after chat interruption by inspecting the latest branch, PR and checks
rather than assuming every pending feature is finished.
