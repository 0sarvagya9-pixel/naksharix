# Naksharix Final Remaining Cleanup QA

## Scope

This branch completes the remaining code-side launch cleanup after Consultation Phase 2. It intentionally does not deploy production and does not activate the parked AI Astrologer or physical shop.

- Base branch: `complete-production-polish`
- Working branch: `feat/final-remaining-cleanup`
- Production deployment: intentionally held for local review

## Completed

### Legal and policy alignment

- Added a current legal/policy component covering:
  - About
  - Contact
  - Privacy Policy
  - Terms & Conditions
  - Disclaimer
  - Refund & Cancellation Policy
  - Delivery Policy
  - FAQ
- Updated policy copy for active Razorpay payments, saved digital reports, and consultation booking.
- Removed obsolete copy claiming that automatic payments were inactive.
- Added digital-delivery and consultation-delivery wording.
- Clarified that the physical shop and AI Astrologer remain parked.
- Added support warnings not to share passwords, OTPs, card details, UPI PINs, or banking credentials.

### Public claims cleanup

- Removed unsupported homepage metrics such as user counts, accuracy percentages, ratings, and 24/7 expert-support claims.
- Removed sample testimonial names and unsupported “most accurate” or life-changing claims.
- Replaced static “today” Panchang values with a clearly labelled calculation preview.
- Removed unsupported certification, sub-second-accuracy, monthly-plan, and guaranteed-clarity wording.
- Replaced claims with product capabilities and limitations that match the current application.

### Navigation and SEO

- Added Delivery Policy to the footer.
- Added active Horoscope, Consultation, Astrologer, Saved Reports, and Booking links to the footer.
- Canonicalized `/terms-and-conditions`; legacy `/terms` redirects to it.
- Added FAQ and Delivery Policy to the sitemap.
- Corrected the yearly-horoscope route in robots configuration.
- Removed Consultation from robots disallow because it is now active.
- AI Astrologer and Shop remain excluded from search crawling while parked.

### CI hardening

Pull-request CI now runs:

1. `npm ci`
2. Prisma client generation
3. `npm run lint`
4. `npm run typecheck`
5. `npm run build`
6. `git diff --check`

## Intentionally remaining

### AI Astrologer

- Status: `COMING_SOON`
- Gemini backend code remains for later debugging.
- Public chat remains parked until reliability is separately approved.

### Shop

- Status: `COMING_SOON`
- No active physical-product checkout or shipping promise.
- Shop implementation is deferred until catalogue, inventory, cart, order, delivery, and refund workflows are ready.

### Email delivery credentials

- Code has a safe fallback when SMTP is not configured.
- Real email sending still requires valid production SMTP values in Vercel.
- Secrets must not be committed to GitHub.

## Required review before deployment

After this branch is merged or pulled locally:

```powershell
cd "C:\Users\ravan\Documents\Codex\2026-05-13\naksharix"
git fetch origin
git checkout complete-production-polish
git pull --ff-only origin complete-production-polish
npm ci
npm run lint
npm run typecheck
npm run build
git diff --check
npm run dev
```

Review these public routes:

- `/`
- `/about`
- `/contact`
- `/faq`
- `/privacy-policy`
- `/terms-and-conditions`
- `/refund-policy`
- `/delivery-policy`
- `/disclaimer`
- `/consultation`
- `/astrologers`
- `/horoscope`
- `/reports`
- `/ai-astrologer` — must remain parked
- `/shop` — must remain parked

Also verify:

- Premium Kundli Razorpay payment still works.
- Consultation Razorpay payment still works.
- Saved reports and booking dashboard remain account-protected.
- More dropdown and footer links work.
- No unsupported homepage metrics or sample testimonials remain visible.

## Deployment

Production deployment should happen only after local visual and functional review:

```powershell
npx vercel --prod
```

## Status

`REVIEW_REQUIRED` until GitHub CI and local visual/functional smoke review pass.

> This repository copy improves operational policy wording but is not a substitute for review by a qualified legal professional for the business entity and jurisdictions in which Naksharix operates.
