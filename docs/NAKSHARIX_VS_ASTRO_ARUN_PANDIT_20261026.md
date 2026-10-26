# NAKSHARIX vs Astro Arun Pandit — feature and delivery evidence, 2026-10-26

This is an **evidence register**, not a claim of competitive parity or completion.
Research covers public pages and the NAKSHARIX source tree only. No competitor internal code, transaction logs or app analytics were inspected. Marketing numbers and certifications on competitor pages are not independently verified here.

## Competitor's published product surfaces
- Main site: https://astroarunpandit.org/ — free Kundli, horoscope, consultations, written questions, reports, and cross-brand links.
- Written question: https://astroarunpandit.org/ask-astrologer/ — personalized response by email with a public service-time claim; not independently mystery-shopped.
- Consultations: https://astroarunpandit.org/astrology-consultation — astrologer selection and audio-call service.
- Reports: https://astroarunpandit.org/reports — Kundli, career, love, Fortune, Sade Sati, compatibility, planetary transits and other topics.
- Puja: https://astroarunpandit.org/poojan/en/ — package selection, Sankalp, claimed temple performance, photos, video, prasad; partner and fulfillment dependent.
- Learning: https://occultgurukul.com/ — classes, paid workshops and certificates advertised.
- Related brands: https://www.linkedin.com/company/astro-arun-pandit-pvtltd — Horocosmo, GemsMantra, ThePoojaHouse and OccultGurukul.

## Verified NAKSHARIX capability comparison

| Category | Existing source-backed state | Remaining differentiation | This branch |
| --- | --- | --- | --- |
| Free Kundli and calculations | Kundli generation, charts, report and PDF routes | Independent astronomy validation is not certified | Preserve |
| Panchang / transits / horoscope | Existing public computation APIs | Independent quality and end-user UX comparison pending | Preserve |
| Numerology / tarot / matching | Existing functional tool routes | Algorithmic parity is not established | Preserve |
| Report catalogue | Catalogue, request, admin PDF, account library | Some specialist report variants and real delivery proofs lack acceptance | Preserve |
| Approved astrologer marketplace | Profiles, availability, bookings, reviews | Verified live audio/video calling and provider capacity absent | Preserve |
| Written question | Two-way private SupportTicket workflow exists | No discoverable dedicated astrologer-question intake | Add written enquiry intake and honest non-guarantee |
| Puja service | No verified temple partner or ceremony fulfillment | Temple assignment, Sankalp, logistics, prasad, proof of service | Add informative page with real private enquiry ONLY |
| Education | No independently certified mentor/courses | No full LMS, instructors, exams or certificates | Add original four-lesson free guide, no fake course |
| Mobile | Expo browser companion and app build tests | Not full native app parity or signed Google Play release | Preserve |
| Shop | Enquiry-only catalogue by accepted policy | No stock/fulfillment or partner certificate | Preserve enquiry-only mode |
| Reviews and credibility | Genuine owner-linked consultation review code | No right to invent famous clients or awards | Do not invent social proof |
| Operations | CI and disposable DB rehearsal | Neon restore, Redis, monitoring/alerts, exact live release evidence remain | No cloud change |

## Non-payment guided-enquiry contract
1. Authenticated user chooses allowed topic and enters 20–1200 character message.
2. Backend creates user-owned SupportTicket with fixed category subject and private message.
3. Support staff reviews via existing Admin Support Desk. User follows up in their own Support Centre.
4. No expert assignment or time SLA, phone/video call, real puja booking, prasad, partner guarantee or payment order.
5. CSRF guard, server-side schema validation, per-user rate limit, and disposable DB E2E are required.
6. No production database schema change; no migration; no Vercel deployment.

## Risks, acceptance, non-negotiable boundaries
- Source CI does not prove real human availability, legitimate expert credentials, temple services or mobile store approval.
- External competitor marketing numbers are not certified by this audit.
- Production migration, backups, refunds/payment, secrets, DNS, domain, accounts and protected live site are untouched.
- Existing payment, Gemini/AI, shop enquiry-only and public design constraints remain in effect.
- Do not use imaginary testimonials, success metrics, partners, prices or claims of guaranteed remedies.
- Evidence for cloud provider integrations must be independently demonstrated before claiming launch readiness.

## Durable GitHub-only checkpoint
Authoritative branch: complete-production-polish at base SHA 9880828a1526691b41b047cf1594d18c2eb82c23.
Isolated work branch: feat/competitor-gap-nonpayment-20261026.
Acceptance: merge only after exact-SHA static, quality, browser and Final Code Closure are all successful. Never call GitHub success a production deployment.
