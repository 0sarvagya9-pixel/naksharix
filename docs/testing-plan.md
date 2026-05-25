# Naksharix QA And Accuracy Testing Plan

## Immediate Automated Checks

- Deterministic numerology reduction.
- Lo Shu missing/repeated number extraction.
- Standard nakshatra index mapping.
- Matching koot total max score is 36.
- Public Panchang does not return seeded/fake production output.
- Reports pages do not expose WhatsApp/payment/instant-delivery language.
- Hold pages are removed from sitemap or marked noindex.

Run:

```bash
npm run qa:foundation
npm run qa:engine
```

## Engine Fixture Runner

`npm run qa:engine` loads JSON fixtures from `fixtures/` and reports four possible statuses:

- `PASSED`: deterministic contract passed.
- `FAILED`: deterministic contract failed and the command exits non-zero.
- `SKIPPED_NEEDS_VALIDATION`: fixture is useful but requires externally verified astronomical data before it can be asserted.
- `BLOCKED_UNTIL_ENGINE_READY`: feature is intentionally held until the engine is production-ready.

Current deterministic coverage:

- Numerology birth number, life path, name number, soul urge, and personality number.
- Lo Shu present, missing, repeated numbers, and count map.
- Nakshatra degree-to-name/pada boundaries.
- Moon sign/rashi degree boundaries.
- Vimshottari lord order and 120-year cycle.
- Ashtakoot max-score and matching structure contracts.
- Panchang disabled gate and required future activation fields.
- Transit route/sitemap gate.
- Public claim safety scan for core report/calculator/Panchang files.

Current skipped coverage:

- Full Kundli benchmark assertion.
- Exact Mahadasha/Antardasha date transitions.
- Panchang date/location/timezone result accuracy.
- Transit ingress and retrograde date accuracy.

These are skipped because they require independently verified ephemeris fixtures and provider-stable runtime calculations. They must not be treated as production-ready until promoted from skipped fixtures to deterministic assertions.

## Required Engine Fixtures

- Kundli basic sample: known DOB/time/place with expected ascendant, Moon sign, nakshatra, and planet positions within tolerances.
- Nakshatra boundary samples: exact longitude edges at every 13°20' segment.
- Moon sign boundary samples: sign changes at every 30°.
- Dasha boundary samples: Mahadasha/Antardasha transitions around start/end dates.
- Matching samples: Ashtakoot max scores, same Nadi = 0, different Nadi = 8, known Bhakoot distances.
- Numerology samples: Moolank, Bhagyank, Naamank, Soul Urge, Personality, mobile/vehicle reductions.
- Lo Shu samples: present, missing, repeated numbers.
- Panchang samples: date/location/timezone expected tithi, nakshatra, yoga, karana, sunrise, sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit.
- Transit samples: exact ingress dates and retrograde windows from verified ephemeris data.

## Fixture Source Rules

- Deterministic numerology and Lo Shu fixtures can be authored internally because formulas are deterministic and not ephemeris-dependent.
- Pure degree boundary fixtures can be authored internally because they validate mapping math only.
- Full Kundli, Panchang, Dasha date, and transit fixtures need external references such as a trusted ephemeris, Swiss Ephemeris comparison, AstroSage/Drik Panchang benchmark, or manual astrologer validation.
- No fixture should be marked deterministic unless its expected values are independently explainable and reproducible.

## UI/Route QA

- Empty focused calculator submit should not call API.
- Required fields show readable validation.
- No raw JSON, undefined, null, NaN, or stack traces.
- Related report CTA never claims payment, instant PDF, or automatic delivery.
- Active pages are in sitemap; hold pages are noindex/disallowed.
- Mobile navbar and dropdowns should avoid horizontal scroll.

## Manual Release Checklist

- Run `npm run typecheck`.
- Run `npm run build`.
- Smoke test active public routes.
- Switch EN/HI/HIN on horoscope, calculator, and reports pages.
- Verify Panchang, AI, Shop, Consultation remain held.
- Confirm no payment/order success is reachable from report catalogue.
