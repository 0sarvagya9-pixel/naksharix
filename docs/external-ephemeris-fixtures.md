# External Ephemeris Fixture Guide

Naksharix should not claim premium astrology precision until chart calculations are validated against trusted external ephemeris fixtures. This document explains how to add those fixtures without faking accuracy.

## Why These Fixtures Are Needed

Deterministic tests can verify formula contracts such as numerology, Lo Shu counts, nakshatra boundaries, rashi boundaries, and Ashtakoot maximum scores. They cannot prove real-world ephemeris precision. Full Kundli validation needs trusted expected values for date, time, timezone, latitude, longitude, ayanamsa, house system, ascendant, planet positions, nakshatra, and Dasha balance.

## Fixture File

External Kundli samples live in:

```text
fixtures/astrology/external-ephemeris-kundli-samples.json
```

Each sample must include:

- `id`
- `name`
- `purpose`
- `source`
- `source_note`
- `verified_level`
- `input.date`
- `input.time`
- `input.timezone`
- `input.latitude`
- `input.longitude`
- `input.place`
- `input.ayanamsa`
- `input.house_system`
- `expected.ascendant`
- `expected.moon`
- `expected.planets`
- `expected.dasha`

## Verified Levels

- `verified_external`: strict comparison is allowed. Expected values must be complete and sourced.
- `needs_external_validation`: fixture slot exists, but expected values are not trusted yet.
- `approximate`: documentation-only. Do not use for precision claims.
- `blocked_until_provider_ready`: expected values may exist, but the engine/provider adapter cannot compare them safely yet.

## Trusted Sources

Trusted sources may include:

- Swiss Ephemeris output generated in a reproducible environment.
- Jagannatha Hora chart values manually verified with the same ayanamsa and house assumptions.
- AstroSage, Drik Panchang, or similar reputable chart data only when exact values are cross-checked.

Every source must preserve date, time, timezone, latitude, longitude, ayanamsa, node mode if applicable, and house system.

## Tolerance Rules

- Initial planet and ascendant degree tolerance may be `0.25` degrees while provider parity is being established.
- Tighter tolerances can be introduced after provider, ayanamsa, node mode, and house system are standardized.
- Dasha transition tolerance should be explicit, usually `toleranceDays: 1` for date-level fixtures.
- Retrograde and combustion should be asserted only when the engine actually supports those fields.

## How To Add A Verified Fixture

1. Choose a sample with known birth date, time, timezone, latitude, longitude, ayanamsa, and house system.
2. Fill all expected ascendant, Moon, planet, and Dasha values from a trusted source.
3. Add source details in `source` and `source_note`.
4. Change `verified_level` to `verified_external`.
5. Add or enable a CI-safe runtime adapter for chart calculation.
6. Run:

```bash
npm run qa:ephemeris
```

The runner must fail if the verified chart does not match within tolerances.

## What Must Not Be Faked

- Planet degrees.
- Ascendant degree.
- Moon sign or nakshatra.
- Dasha balance.
- Transit dates.
- Panchang values.
- `verified_external` status.
- Any claim of `100% accurate`.

Truthful skipped fixtures are acceptable. Fake passed fixtures are not.

## Current Status

The repository currently includes five external ephemeris sample slots with `needs_external_validation`. They are schema-ready but intentionally skipped until trusted expected values are inserted.

## Provider Interface Status

The typed provider foundation lives in:

```text
lib/astrology/ephemeris/types.ts
lib/astrology/ephemeris/provider.ts
lib/astrology/ephemeris/current-provider-adapter.ts
lib/astrology/testing/chart-adapter.mjs
```

The current CI-safe testing adapter is intentionally blocked/unverified. It returns the canonical output shape and capability metadata, but unsupported chart fields remain `null` and `metadata.verified` remains `false`. This lets `qa:ephemeris` run safely in Node while preventing placeholder chart values from becoming public precision claims.

Verified external fixtures will fail if the adapter cannot provide comparable values. Placeholder fixtures remain skipped with `SKIPPED_NEEDS_EXTERNAL_VALIDATION`.

## Ayanamsa Status

- Lahiri / Chitra Paksha: implemented internally, not externally verified, not publicly selectable.
- Raman: planned, not implemented.
- KP: planned, not implemented.
- Fagan-Bradley: planned, not implemented.

No public ayanamsa selector should be added until degree-shift fixtures verify each option.
