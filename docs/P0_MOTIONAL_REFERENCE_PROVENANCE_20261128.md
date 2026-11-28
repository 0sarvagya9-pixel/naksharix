# P0-06 / A21: independent motional-strength diagnosis

## Decision

The six outstanding motional discrepancies on the named 1979 and 2025 reports are real differences against their printed values. **No tested replacement is sufficiently supported to change the retained calculation or declare this requirement complete.** The useful engineering result is a reproducible, read-only provenance diagnostic that distinguishes numerical implementation errors from incompatible reference conventions and prevents a plausible-looking offset from being fitted to one report.

The diagnostic independently reproduces all **30 existing non-luminary motion values** across six charts, without importing any production implementation. It preserves the original **0.25 virupa** tolerance and original expected values. The baseline is commit `f4bccdf832c25de43ef8eeddeaaa746702006b9a`.

## Exact outstanding components on the two named references

| Date | Planet | Retained calculation | Printed reference | Difference, actual minus reference |
|---|---|---:|---:|---:|
| 1979-08-23 | Mars | 24.2419787264 | 23.74 | +0.5019787264 |
| 1979-08-23 | Mercury | 22.1191201441 | 24.71 | -2.5908798559 |
| 1979-08-23 | Jupiter | 3.8593111447 | 3.18 | +0.6793111447 |
| 1979-08-23 | Saturn | 3.4560016907 | 4.14 | -0.6839983093 |
| 2025-01-01 | Mercury | 25.4794653940 | 25.76 | -0.2805346060 |
| 2025-01-01 | Venus | 37.1257761700 | 38.25 | -1.1242238300 |

Sun and Moon use different luminary rules and are not included in these 30 non-luminary observations. The existing 97-cell score for each named report also contains positional, temporal, directional, natural, aspectual, total, and house terms. A count of passing motion cells must not be substituted for that 97-cell score.

## What the primary source requires

B.V. Raman's *Graha and Bhava Balas*, articles 87-105, defines a uniform mean position, counts the Gregorian civil interval from local mean midnight at 76 degrees east on 1 January 1900, excludes 1900 as a leap year, and combines mean and true longitudes with the relevant seeghrocha. Articles 94-104 supply the epoch and annual corrections; article 105 supplies the geometry. The existing implementation follows that declared epoch. The Table IX Venus coefficient is retained; the article-versus-table printing difference already documented by the project has not been silently changed.

Source: https://astrojyotish.info/pdf/graha-bhava-balas.pdf

The independent reconstruction uses the production baseline's published revolution counts as frozen inputs, then reimplements the interval, mean position, circular midpoint, and folded angle arithmetic. It validates numerical consistency with that declared method; it does **not** independently certify the method's physical or interpretive accuracy.

Frozen baseline source: https://github.com/0sarvagya9-pixel/naksharix/blob/f4bccdf832c25de43ef8eeddeaaa746702006b9a/lib/astrology/strength/motional-epoch.ts

## A tempting epoch correction is disproved by the other observations

The 1979 Mercury and Jupiter differences each correspond to moving the mean epoch input about 2.159 days earlier. This initially suggests a shared date error. An analytical interval calculation, using the original 0.25 tolerance, shows why applying that shift would be unsafe:

- All five 1979 non-luminary values can fall inside tolerance for an arbitrary shift between approximately **-2.36772 and -1.95100 days**. No consulted primary source supplies this correction.
- The 1978 reference cannot be explained by any single shift in the tested **-7 to +7 day** range. Its Mercury needs **-2.36591 to -1.94919 days**, whereas its Venus needs **-0.77424 to +0.57791 days**. These intervals do not overlap.
- The 2025 reference also rejects any common shift in that range: Mercury needs **-0.44217 to -0.02545 days**, whereas Venus needs **+2.36416 to +3.71631 days**. These intervals do not overlap.

These intervals diagnose incompatibility. They are never used to change engine inputs or choose correction constants. Their midpoints are independently reevaluated to verify the interval algebra.

The executable additionally checks the concrete errors of omitting the Ujjain conversion, reading UTC+5:30 local time as UTC, using noon instead of midnight, adding a false 1900 leap day, omitting one intervening leap day, and mixing a Julian epoch with Gregorian birth dates. None explains all observations. The intended Julian-versus-Gregorian probe is an explicit mixed-calendar fault, not a legitimate alternate civil-calendar convention.

## Independently published rate approximation

PyJHora publishes this complete daily-rate vector: Sun 0.9856, Mars 0.524, Mercury 4.0923, Jupiter 0.0831, Venus 1.60215, Saturn 0.033439 degrees per day. The diagnostic applies the entire vector consistently to all charts, retaining the same source epoch corrections and geometry. It does not select a rate separately for each planet or chart.

Pinned source: https://github.com/naturalstupid/PyJHora/blob/be344af506590b6e4c79942d84b958495dee4766/src/jhora/horoscope/chart/strength.py (`planet_speed_at_epoch_ujjain_1900`), downloaded SHA-256 `f701c174b7c5ac4a32e271064419915940d8748d4e509d84ce223016c2f1e8b2`. This is a first-party software implementation, not an independent expert review or a replacement for the classical source.

This approximation changes 2025 Mercury to approximately **25.73388**, within tolerance of 25.76. Its Venus remains approximately **37.20084**, outside tolerance of 38.25. The four 1979 failures remain. Across all six charts, passing motion cells change from **6/30 to 7/30**; three of those charts come from Parashara's Light with separately documented convention differences, so the combined count is a sensitivity summary, not an acceptance target. A modest score increase does not justify replacing more precise rates with rounded ones.

The correction year is determined in the declared 76 E mean-time frame. For the 2025-01-01 00:00 IST input, that frame is still **2024-12-31 23:34**, so the annual correction year is 2024. The executable explicitly reports this boundary rather than quietly using the displayed local year.

## Rejected modern orbital-element substitution

JPL's official 1800-2050 Table 1 orbital elements were checked as a separate diagnostic hypothesis. The publisher explicitly says these fitted elements are not intended to represent a mean. A simplified J2000-frame substitution reduces passing cells from 6/30 to 4/30 and worsens the named 2025 Mercury/Venus residuals. Its deliberately stated UTC/TDB and frame approximations also prevent treating it as a qualified astronomical pipeline. It has no basis for silently replacing Raman's mean positions.

Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html

## Concrete deliverables and use

- `fixtures/astrology/motional-reference-diagnostic-inputs.json`: frozen dates, software/source provenance, true longitudes, original expected values, and original mean/motion traces for all six charts.
- `scripts/diagnose-motional-reference-provenance.mjs`: standalone Node diagnostic with no production imports and no dependencies. It checks the baseline, named full-rate sensitivity, bounded calendar fault hypotheses, and common-shift incompatibility.
- `motion-reference-diagnostic.json`: complete per-planet arithmetic, signed residuals, original-tolerance results, interval proofs, input SHA-256, and source URLs.

Run `node scripts/diagnose-motional-reference-provenance.mjs` from the repository, or pass an explicit input and output path. The default JSON report is written to the operating system temporary directory, not added to the source tree. The output intentionally retains `acceptedReplacement: null`, `publicEnabled: false`, and `fullParityAccepted: false`.

Frozen input SHA-256: `079e556f2e6e0ed6683c972740dd14aaff2086a8f8eca422da60ae6012c184c5`. Reference PDFs and downloaded third-party implementation files are working research inputs and should not be redistributed with these four diagnostic deliverables.

## Remaining requirement

To close the vendor comparison honestly, obtain the named reports' **actual mean longitudes and seeghrocha values, exact epoch/civil-day convention, rate tables, correction rules, and software version**. Those intermediate values would locate a remaining difference before the final folded-angle calculation. Otherwise a separate method-specific reference must be accepted explicitly, with its own independently derived component values and the original benchmark still reported as unmatched. A final printed total alone cannot distinguish a convention choice, an upstream date error, a reference printing error, or a changed vendor implementation.

No human language reviewer, astrologer, scientist, payment provider, or merchant acceptance was simulated or certified by this work. No production engine or published expected value was modified.
