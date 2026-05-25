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
```

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
