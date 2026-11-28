# P0-06 / A21: reference reconciliation and strict acceptance

## Result

Both original named reference charts still have **72/97 values within 0.25 virupa**. The remaining **50 failed cells comprise 10 primary component differences and 40 inherited planetary/house totals**. There are no unexplained composite failures in this pair. Neither the failed values nor the original expected values have been removed, replaced, rounded into tolerance, or reclassified as numerical passes.

The new qualification module follows each planetary sum, each house's actual lord, and each house sum. It separately checks candidate arithmetic, printed-source arithmetic at the source's two-decimal precision, and lord identity. A wrong total, a wrong lord, missing/non-finite input, or offsetting component errors cannot create a false acceptance. Numerical parity never supplies expert approval or public activation.

| Reference | Primary components | Inherited failed cells | Numerical status |
|---|---:|---:|---|
| AstroSage, 1979-08-23 | 5 | 20 | 72/97, blocked |
| Dhruv / OneKundli, 2025-01-01 | 5 | 20 | 72/97, blocked |

The six motion components are documented separately in `P0_MOTIONAL_REFERENCE_PROVENANCE_20261128.md`. The four positional components are traced below.

## 1979 Saturn: a published D7 geometry inconsistency

Source: https://www.astrosage.com/pdf/brihat-horoscope.pdf, published planetary positions, divisional table and strength table. The existing fixture retains all original numbers.

The printed Moon longitude is Leo 17°48′46″ and Saturn is Leo 21°28′48″. For the declared classical D7 rule, each sign is divided into seven equal parts; counting starts from the same sign for odd signs. Independent integer-arcsecond arithmetic therefore places the Moon in Sagittarius and Saturn in Capricorn. The reference table instead prints Scorpio and Sagittarius, respectively. Both results remain unchanged over the entire ±0.5 arcsecond rounding interval of the published positions.

For Saturn, the engine's Capricorn D7 contribution is 30 virupas; using the reference's printed Sagittarius instead gives 15. This explains the 15-virupa positional residual. It does not justify changing a mathematically consistent equal-sevenths partition to fit this one reference. Moon's two alternative sign contributions happen to have equal weights, so its D7 disagreement does not create another Sthana failure.

The actual birth-pipeline positional residual differs slightly from exactly 15 because the pipeline computes its own unrounded astronomical positions. The source-coordinate isolation and full birth-pipeline comparison are retained as separate evidence.

## 2025: printed divisional placements and friendships do not reproduce three totals under the selected method

Source: https://onekundli.com/wp-content/uploads/2025/02/OneKundli-Sample-Report.pdf, physical pages 9, 134–136 and 142. The source PDF SHA-256 remains `2060490e9231446d5e28ce15e00a85f44a0d9eeed70ef515143d31cb896b5d6d`.

All **42 directed fivefold friendships** in the published table agree with the engine. All **49 divisional signs** also agree. Independently summing those printed fields using Raman's article-30 dignity weights yields:

| Planet | Independently summed published fields | Published Saptavargaja | Difference |
|---|---:|---:|---:|
| Mercury | 105.000 | 90.000 | +15.000 |
| Jupiter | 108.750 | 82.500 | +26.250 |
| Saturn | 99.375 | 114.380 | −15.005 |

The other four planets reproduce their published totals. This independent recomputation imports no production dignity implementation; the resulting per-varga weights are subsequently compared with the engine. The new fixture preserves the printed friendship table and page provenance.

Raman source: https://astrojyotish.info/pdf/graha-bhava-balas.pdf, article 30, physical pages 27–29. Its seven dignity weights are 45, 30, 22.5, 15, 7.5, 3.75 and 1.875; its Moolatrikona contribution is restricted to D1. The existing degree-qualified D1 convention remains explicit.

The vendor has not supplied a complete method declaration for these totals. Consequently, this is a **difference under the selected method**, not proof that all vendor outputs are wrong. A whole-sign D1 Moolatrikona variant can explain Saturn's extra 15, but does not explain Mercury or Jupiter, and conflicts with a previously matching Parashara's Light Jupiter example. Selecting conventions separately for each failed planet would fit the examples instead of qualifying an algorithm. No such selection was introduced.

## Executable evidence and acceptance behavior

`npm run qa:strength-reference` runs the qualification diagnostic and the independent motion provenance experiment. It verifies the diagnostic's guards and writes an explicit `BLOCKED` qualification for this reference pair. Its successful process exit means the diagnostic executed correctly; it is not a commercial or numerical acceptance.

`npm run qa:strength-acceptance` runs the strict gate. **It exits 2 while the original reference differences remain.** It cannot be made successful by reporting green diagnostic tests. `STRENGTH_QUALIFICATION_OUTPUT=/absolute/path/report.json` saves the complete 194-cell comparison, root dependencies, original inputs, source hashes and dispositions. CI preserves this report together with the motion diagnosis.

Original `qa:strength` coverage remains in place, including the independently published 1918 worked example, the 1981 historical motion table, prior matching software fixtures, boundary checks and strict negative cases. No public strength flag was enabled.

## Evidence needed for closure

The next reviewer needs the reference software's intermediate mean longitudes, seeghrocha values, calendar/epoch and rate tables; for the positional differences, its actual D7 input and dignity/Moolatrikona conventions. These are the missing facts, not a request to relax the original threshold. A replacement reference would require a documented acceptance decision and independently established values while preserving the original comparisons in the register.

P0-06 and A21 remain open. Model-assisted mathematical review and reproducible arithmetic are explicitly distinguished from an independent qualified practitioner's approval.
