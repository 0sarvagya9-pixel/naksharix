# Shadbala And Ashtakvarga Foundation Plan

## Current Status

Shadbala and Ashtakvarga are not active public features. The repository now contains type contracts, fixture schemas, and QA gates only.

## Shadbala Target

- Sthana Bala
- Dig Bala
- Kala Bala
- Cheshta Bala
- Naisargika Bala
- Drik Bala
- Total Shadbala with units documented

Dependencies:

- Verified planet longitude, sign, house, speed, sunrise/sunset, and temporal data.
- Formula-by-formula fixtures.
- External reference scores for each planet.

## Ashtakvarga Target

- Bhinna Ashtakvarga by planet.
- Sarva Ashtakvarga aggregation.
- Rashi/house-wise bindu scores.
- Transit overlays only after base bindu scores are verified.

Dependencies:

- Verified natal placements.
- Formula fixtures for each planet.
- External reference bindu totals.

## Current QA

`npm run qa:strength` checks:

- Strength foundation files exist.
- No public-enabled flag exists.
- No module is marked verified.
- No fake numeric Shadbala total exists in source.
- Fixture slots include the required fields and are skipped or blocked until trusted scores are supplied.

## Activation Gate

No numeric score should appear in public UI until fixture values are externally sourced and exact comparison tests pass.

## Public Claim Boundary

Do not claim planetary strength, bindu scores, weak/strong planet judgement, or remedies from Shadbala/Ashtakvarga until verified.
