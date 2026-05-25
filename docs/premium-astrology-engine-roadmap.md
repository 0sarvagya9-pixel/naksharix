# Naksharix Premium Astrology Engine Roadmap

This document is a product and engineering boundary map. It prevents Naksharix from claiming a premium astrology engine before the calculation, interpretation, QA, and business layers are actually production-ready.

## Current State

- Active: Kundli generation, Kundli PDF, focused astrology calculators, numerology, Lo Shu, kundli matching, tarot, static horoscope pages, manual report catalogue.
- Coming Soon / Hold: AI Astrologer, Shop, Consultation, Panchang, transit prediction, payments, marketplace, automated premium report delivery.
- Existing engine surface: `lib/astrology/*`, `lib/numerology/index.ts`, `lib/matching/kundli-matching.ts`, `app/api/focused-calculators/kundli/route.ts`.
- Current risk: some legacy helpers still include seeded/mock/fallback astrology utilities. These must not be used for production claims.

## No-Fake-Claim Rules

- Do not claim live Panchang until date, location, timezone, sunrise/sunset, tithi, nakshatra, yoga, karana, Rahu Kaal, Yamaganda, Gulika Kaal, and Abhijit Muhurat are verified.
- Do not claim transit predictions until exact transit dates and interpretation rules are verified.
- Do not claim personalized prediction unless DOB, time, place, coordinates, timezone, and chart context are actually used.
- Do not claim payment/order/report delivery until the backend workflow, admin review, receipt/refund logic, and delivery are live.
- Do not activate AI Astrologer until prompt grounding, fallback, Hindi/Hinglish QA, safety, and chart-context boundaries are tested.

## Target 10/10 Architecture

### A. Calculation Layer

- Ephemeris abstraction with provider identity and version.
- Planet longitude, sign, house, nakshatra, pada, speed, retrograde status.
- Combustion status using Sun-distance rules.
- Ayanamsa strategy: Lahiri first, then Raman/KP/Fagan if verified.
- Timezone/location normalization and reproducible date math.
- Sunrise/sunset and lunar calculations with fixtures.
- Test fixtures for known charts and boundary degrees.

### B. Chart Layer

- D1 Lagna, D2 Hora, D3 Drekkana, D4 Chaturthamsha, D7 Saptamsha, D9 Navamsha, D10 Dashamsha, D12, D16, D20, D24, D27, D30, D40, D45, D60.
- D64 only after the base varga framework and precision tests are stable.
- Chart rendering should be generated from canonical chart data, not display strings.

### C. Strength Layer

- Shadbala.
- Ashtakvarga.
- Exaltation/debilitation, own/friendly/enemy sign.
- Functional benefic/malefic by lagna.
- Planet dignity and avastha.
- Clear uncertainty flags when inputs or provider data are incomplete.

### D. Prediction Layer

- Vimshottari, Yogini, Chara, Ashtottari, Jaimini dashas.
- Antardasha, Pratyantar, Sookshma.
- Transit/gochar overlays on natal chart.
- Varshaphal/Solar Return/Tajika.
- Event-timing rules with confidence tiers, never guarantees.

### E. Interpretation Layer

- Versioned rule database.
- Graha + rashi + bhava + nakshatra combinations.
- Dasha + transit combinations.
- Varga-specific interpretations.
- Remedies rules with non-fear-based language.
- EN/HI/HIN content keys.
- Claim boundaries embedded in every generated report.

### F. Report Layer

- Premium PDF templates by report type.
- HTML-to-PDF or Chromium rendering pipeline.
- Multi-language PDF support.
- Chart visuals, report versioning, and report history.
- Manual review path before paid automated delivery.

### G. Business Layer

- Report request tracking.
- Admin review and status transitions.
- User dashboard/history.
- Payment later, after request workflow is stable.
- Refund/legal alignment before monetization.
- Analytics for funnel health, not prediction claims.

## Suggested Data Models

- `AstrologyCalculationRun`: input hash, provider, ayanamsa, chart JSON, warnings, createdAt.
- `InterpretationRule`: key, scope, language, conditions JSON, text, version, status.
- `ReportRequest`: report type, user details, status, admin notes, delivery status.
- `GeneratedReport`: request id, template version, language, pdf url, hash, createdAt.
- `QAFixture`: module, input JSON, expected JSON, tolerance, source, status.

## Suggested APIs

- `POST /api/engine/chart`: canonical chart calculation.
- `POST /api/engine/panchang`: disabled until verified fixtures pass.
- `POST /api/engine/transit`: disabled until verified fixtures pass.
- `POST /api/reports/request-intent`: review-only first, persisted only after workflow approval.
- `POST /api/admin/reports/:id/status`: admin-only status updates.

## Accuracy Requirements

- Every engine module needs deterministic fixtures.
- Boundary tests are required for nakshatra, rashi, lagna, dasha period transitions, tithi, and sunrise/sunset.
- Panchang and transit must include location/timezone fixtures before public activation.
- Matching must keep koot max scores fixed at 36 and verify Nadi/Bhakoot edge cases.

## Phase B Fixture Infrastructure Status

- Added fixture directories for astrology, numerology, matching, and safety gates.
- Added `npm run qa:engine` for deterministic contracts and honest skipped fixtures.
- Verified today: numerology formula contracts, Lo Shu counts, nakshatra degree boundaries, rashi degree boundaries, Vimshottari order/120-year cycle, Ashtakoot max-score contract, Panchang hold gate, transit hold gate, and selected public claim safety checks.
- Skipped by design: full Kundli benchmark assertion, exact Dasha transition dates, Panchang result accuracy, and transit date accuracy.
- Activation rule: skipped fixtures must become deterministic assertions before the related public feature can be upgraded from Coming Soon to active.

## Next Fixture Sources Needed

- Verified planet positions and ascendant from a trusted ephemeris for at least five DOB/time/place samples.
- Nakshatra and rashi boundary samples around exact segment edges.
- Vimshottari Mahadasha/Antardasha transition samples with verified Moon longitude and balance.
- Panchang samples for multiple locations/timezones with tithi, nakshatra, yoga, karana, Vaar, sunrise/sunset, Rahu Kaal, Yamaganda, Gulika, and Abhijit.
- Transit ingress and retrograde samples for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.

## Phase Order

1. Phase A: QA foundation, truth gates, safe CTAs, legal/SEO cleanup.
2. Phase B: Ephemeris abstraction, ayanamsa interface, retrograde/combustion audit, fixture testing.
3. Phase C: Shadbala, Ashtakvarga, vargas, micro dasha, interpretation rule DB.
4. Phase D: DB-backed report/user/admin workflows.
5. Phase E: Razorpay/cart/checkout/refunds.
6. Phase F: AI Astrologer and consultation marketplace.

## Risks

- High: Panchang, transit, AI, payment, consultation marketplace, automated report delivery.
- Medium: report request workflow, admin CMS, multilingual long-form content, SEO route indexing.
- Low: static educational content and report CTA polish.

## Current Hold Decisions

- Panchang remains Coming Soon.
- Transit remains Coming Soon.
- AI Astrologer remains Beta Hold.
- Shop remains Coming Soon.
- Consultation remains Coming Soon.
- Payments remain disabled from public report flow.
