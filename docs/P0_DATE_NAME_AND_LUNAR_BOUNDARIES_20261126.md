# Report calculation and input acceptance

The two date-and-name products calculate from the supplied civil birth date and confirmed A–Z spelling. Neither enters the astrology provider. Historical orders may include geographical details. The calculation discards those fields, and the report identifies its basis as `date_name_only`. The spelling comparison represents empty letter groups with null. The Royal renderer can select its date-and-name layout using the calculation basis.

Fortune uses the confirmed spelling for its whole-name, vowel and consonant calculations. A historical order without a separately supplied spelling receives only its applicable birth-date and chart calculations. The editorial arithmetic shows the Pythagorean repeating A–Z mapping, actual letters, compound totals and reductions. The grid is oriented 4–9–2 / 3–5–7 / 8–1–6, skips zero and counts repeated birth-date digits. The business-name package has its own distinctly identified Chaldean mapping. No Kua or personal direction result is advertised in the approved 15-product catalogue reviewed here.

## Date cycles

The reference date uses the UTC civil calendar of the report's evaluation instant. A change of server timezone cannot shift the reference date. The core name and life-path convention preserves 11, 22 and 33. The separate January-to-December cycle convention uses single digits 1–9.

- Personal year combines the birth month, birth day and target calendar year. Personal month combines personal year and calendar month. Personal day combines personal month and calendar day. The daily public calculator now uses this same convention.
- The four challenge values are the absolute differences of reduced birth month/day, day/year, first/second challenge and month/year. Zero is valid.
- The 12 monthly entries begin in the calendar month following generation. They recompute the personal year when the January boundary is crossed.
- Worked references used for arithmetic checks include a 5 May birth in 2026 and the 3 July 1962 four-challenge example. No proprietary interpretation was imported. [Personal month calculation](https://www.worldnumerology.com/free-forecasts/monthly-numerology-forecast.html) and [challenge calculation](https://www.worldnumerology.com/numerology-challenges/).
- The geometric layout is independently documented in George Gheverghese Joseph, *The Crest of the Peacock*, chapter 6, figure 6.8. [University of Kentucky copy](https://www.ms.uky.edu/~sohum/ma330/files/crest_of_the_peacock.pdf).

## Boundary corrections

The calculation modules previously divided by a rounded 13⅓° mansion span. This could place an exact rational boundary in the preceding mansion. For example, at 93⅓° the chart displayed Pushya while the Dasha calculation selected Punarvasu. The same issue affected the equal-sector Panchang Yoga lookup. The new partition compares input degrees with the floating-point representation of the rational section boundary. The same 108 sectors now supply chart nakshatra, pada, Dasha and Yoga boundaries. Tests cover each internal pada boundary immediately before, at and immediately after it. The original Moon longitude is retained in the Dasha record.

The birth Panchang previously formatted a UTC-offset-shifted Date in the host timezone, which could change the weekday. It now reads the weekday in UTC after applying the recorded offset. For a synthetic Thursday in India the name is Thursday under UTC, Los Angeles and Auckland host settings. Milliseconds are now included when converting JavaScript UTC Dates into Julian days. Three published USNO Gregorian examples and a half-second J2000 case are in the runtime tests. [U.S. Naval Observatory Gregorian-to-Julian examples](https://aa.usno.navy.mil/faq/JD_formula).

## Reproducing the checks

- `node scripts/qa-automatic-report-delivery.mjs` covers six chart-free report/language combinations, equivalence with historical inputs, date cycles, name consent and actual PDF integration.
- `node scripts/qa-independent-runtime-ephemeris.mjs` checks four Julian day values and previously frozen ephemeris, rise/set and transit fixtures.
- `node scripts/qa-dasha-timeline-runtime.mjs` covers 321 adjacent-float pada cases, 78 adjacent-float Dasha cases, three host timezones and the previous 135 timing cases.
- `node scripts/qa-varga-division-runtime.mjs` reproduces the existing 1,296,000 whole-arcsecond checks for each of D7 and nakshatra/pada.
- `npm run qa:strength` preserves the independent comparison. The current named candidate reproduces 71 of 97 whole-strength cells within the existing 0.25-virupa tolerance. Of 26 residuals outside tolerance, 10 are planetary Sthana/Kala/Cheshta or their totals, and 16 are downstream Bhava lord strengths and totals. Isolated published Kala components match 63/63. A second reference gives 7/7 positional, 7/7 aspect and 1/5 motional matches at the recorded tolerances. The five separately published historical motional readings reproduce within 0.03 virupa under the original table method. These comparisons do not establish vendor parity or professional acceptance. Advanced activation remains held.

## Independent strength investigation

A controlled comparison used published 1979 Shadbala and Bhava tables and a second 1978 chart. The original threshold of 0.25 virupa applies throughout. No calibration factors were estimated. The source fixture preserves full precision and signed residuals.

| 1979 root component | Calculated minus published, virupas | Finding |
| --- | ---: | --- |
| Mars Kala | +0.251029 | Ayana accounts for +0.240304, Natonnata +0.008946 and Paksha −0.008221. The printed subrows sum to 172.95 and the printed total is 172.94. Unrounded published components and the exact declination algorithm remain unknown. |
| Mars Cheshta | +0.5020 | The Raman-table result remains 0.5029 high using the vendor's printed true longitude. A separate historical mean-motion model is 0.5034 high. |
| Mercury Cheshta | −2.5909 | Substituting the printed true longitude gives −2.5892. The second historical model gives −0.3953. The required inner-planet apogee and mean solar longitude are unpublished. |
| Jupiter Cheshta | +0.6793 | The alternative historical model gives +0.0401 in 1979 and +0.0335 in 1978. It fails for other planets. These two Jupiter readings do not justify changing the published method per planet. |
| Saturn Sthana | +14.997 | The disagreement is in Saptavargaja. The published D7 assigns Saturn the preceding sign, which changes its dignity by 15 virupas. The equal-sevenths geometry already reproduces 10/10 independent published worked positions. |
| Saturn Cheshta | −0.6840 | The printed true longitude gives −0.6810. The second historical model gives −1.1948. For Saturn, Mars and Jupiter the computation also needs a mean planet longitude and a mean solar longitude. Neither is printed in the vendor table. |

These six root-component residuals cause four planetary totals to miss the tolerance. Substituting only the seven printed planetary totals while retaining the actual birth-chart directions and aspects brings all 24 house lord/total cells within 0.25. Only 8 of these 24 pass before substitution. The worst remaining house-total error in that diagnostic is 0.05053 virupa. This accounts for all 16 downstream misses. No printed value was substituted into a customer calculation.

The separate Ayana comparison tests projected ecliptic longitude, the BPHS three-part Khanda rule, and actual equatorial declination scaled by obliquity of date. Across 14 printed rows those variants match 14/14, 8/14 and 2/14 respectively. Projected Mars narrowly misses the aggregate Kala tolerance, while the individual Mars Ayana cell meets it. On the second chart, the lunar Paksha convention yields 36.77 and the printed row is 23.23. Adding this previously unused held-out Kala table exposes a separate 13.395-virupa total discrepancy. The report does not document its lunar-polarity decision. [Published 1979 table](https://www.astrosage.com/pdf/brihat-horoscope.pdf), [published 1978 table, page 118](https://www.astrosage.com/pdf/poojasharmaE.pdf), [Raman articles 48–51 and 88–104](https://astrojyotish.info/pdf/graha-bhava-balas.pdf) and [Khanda and declination rules](https://saravali.github.io/astrology/bala_ayana.html).

For motion, the existing 1900 Raman table and the Kali-epoch Sūryasiddhānta substitution each match 2/10 published readings. They agree on different planets. The second convention matched the independently published 255.61° mean Sun at Ujjain midnight on 1 January 2000 within 0.005°. Every Raman score changes by less than 0.006 virupa if the published true planet position replaces the computed true longitude. The differing choice of mean motion and zodiac reference remains unresolved. The historical-mean experiment intentionally combines two reference frames to test a proposed substitution. Its failure is recorded without promoting it. Earlier JPL and Swiss-element probes also matched 2/10. Re-run `npm run qa:strength` and inspect the `P0_STRENGTH_CONVENTION_ATTRIBUTION` record. [Public-domain Burgess translation](https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf), [EFEO canon parameter table](https://hic.efeo.fr/HIC_Manual.pdf), [Ujjain epoch](https://www.astro.com/swisseph/swisseph.htm), and [worked January 2000 reference](https://pustakalaya-org.github.io/vol12_jyotisa/worked_example.html).

Name Correction now includes a second calculation for every proposed spelling. It shares the business package's existing Cheiro-style Chaldean table, displays letter values, preserves the compound sum and reduces to a single digit. The Pythagorean column preserves 11/22/33. A new request containing only a punctuation/spacing variant of a supplied spelling fails validation. [Chaldean alphabet and reduction convention](https://esoterrier.com/systems/gematria/cipher-chaldean).

### Raman Ayana table follow-up

The internal strength comparison can now select `raman_15_degree_table`. Raman describes six 15-degree steps from equinox to solstice with linear interpolation within each step. Their declination increments, in arcminutes, are 362, 341, 299, 236, 150 and 52. The stated maximum is 24 degrees. The calculation uses these published quantities. [Graha and Bhava Balas, articles 73–75](https://astrojyotish.info/pdf/graha-bhava-balas.pdf)

All 21 printed Ayana values across the 1978, 1979 and 2025 examples agree within 0.014 virupa. The 2025 fixture uses the fictional January 1 Delhi sample, with birth data on page 6 and tables on pages 142–143. The fixture records the source PDF hash. [2025 sample](https://onekundli.com/wp-content/uploads/2025/02/OneKundli-Sample-Report.pdf)

At the original 0.25-virupa tolerance, Mars Kala in 1979 improves from a signed residual of +0.251029 to +0.010493. The complete 1979 comparison improves from 71/97 to 72/97. The separate 2025 comparison improves from 63/97 to 70/97. The previous projected calculation remains the default. Residuals include historical motion, positional conventions, and the 2025 choice of planetary hour. Both candidates retain their independent-qualification hold. Run `npm run qa:strength` and inspect `P0_RAMAN_AYANA_TABLE` for every full-chart comparison cell.
