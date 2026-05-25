# Transit Engine Foundation Plan

## Current Status

Transit/gochar remains Coming Soon. Naksharix does not currently expose verified transit prediction, real-time ingress dates, retrograde windows, or personalized natal overlays.

## Target Architecture

- Transit planet positions for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.
- Ingress date detection with timezone-aware timestamps.
- Retrograde/direct windows where the provider supports planetary speed.
- Natal chart overlay only after a verified birth chart is available.
- Rashi-wise educational content clearly separated from personalized transit prediction.
- Fixture validation before any public activation.

## Required Data And Fixtures

- Trusted ephemeris source with date range, ayanamsa, timezone, and expected ingress/retrograde timestamps.
- Tolerance rules in hours for ingress and retrograde boundaries.
- Provider metadata for calculation mode and precision level.
- Public copy review to avoid guaranteed or fear-based claims.

## Current QA

`npm run qa:transit` checks:

- Transit foundation files exist.
- Public prediction remains disabled.
- Transit fixtures are present and skipped honestly until external values exist.
- Sitemap does not promote unverified transit routes.
- No transit route files are present for the listed unverified transit pages.

## Activation Gate

Transit can only become active when verified external fixtures pass strict comparisons and the public route explicitly states whether the result is general, educational, or personalized by a birth chart.

## Public Claim Boundary

Do not claim live transit, real-time gochar, personalized transit impact, or exact transit dates until fixtures pass.
