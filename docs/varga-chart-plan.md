# Varga Chart Foundation Plan

## Current Status

Varga charts are foundation-only. No public D9, D10, D60, or other divisional chart output is enabled or verified.

## Target Architecture

- D1 as base chart after ephemeris precision is verified.
- D9 Navamsha and D10 Dashamsha as first future candidates.
- D2, D3, D4, D7, D12, D16, D20, D24, D27, D30, D40, D45, D60, and D64 later.
- Each chart should consume canonical planet longitudes, not UI display strings.
- Each chart needs formula documentation, fixture samples, and public interpretation boundaries.

## Required Fixtures

- Source longitude for every planet.
- Expected divisional chart sign and degree per planet.
- Ayanamsa and house-system metadata where relevant.
- Trusted external source note for each expected placement.

## Current QA

`npm run qa:varga` checks:

- Varga type and engine foundation files exist.
- All target chart definitions are listed.
- No formula is marked verified.
- No Varga chart is public enabled.
- Fixture slots are skipped or blocked truthfully until formulas and expected values are verified.

## Activation Gate

A Varga chart can be exposed only after its formula is documented, fixtures are marked `verified_external`, and QA compares all placements without skipped status.

## Public Claim Boundary

Do not display Varga placements or interpretations as real user results until verified fixtures pass.
