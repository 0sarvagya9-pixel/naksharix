# Verified Astrology Data Workflow

## Status

Naksharix currently has fixture slots and QA gates, but no trusted external chart values have been inserted. Strict ephemeris tests must stay skipped until verified data is supplied.

## Fixture Import Template

Every verified Kundli fixture must include:

- Source name and source URL or exported file reference.
- Date of birth.
- Exact time of birth.
- Timezone.
- Latitude and longitude.
- Place name.
- Ayanamsa.
- House system.
- Ascendant sign and degree.
- Planet signs and degrees for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.
- Moon nakshatra and pada.
- Dasha starting lord, balance at birth, and transition dates if available.
- Tolerance rule.
- Human reviewer name/date.

## Status Flags

- `no_verified_data`: schema exists but no trusted expected values are available.
- `partially_verified`: some expected values are verified, but the fixture cannot assert full chart precision.
- `verified_external`: complete trusted expected values are available and strict QA may fail if Naksharix differs outside tolerance.

## Promotion Rule

Do not change a fixture to `verified_external` unless every expected value needed by the test is filled and source notes are complete.
