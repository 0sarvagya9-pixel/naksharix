# A21 lunar reference frame and Vimshottari timing

The public chart, canonical chart, natal/D9 Moon, period boundaries, matching inputs, and daily Panchang now obtain the lunar longitude from the same versioned calculation. The pre-existing fixed 365.2425-day interpretation of the Vimshottari year and 120-year sequence are preserved. The calculation record of new chart-based reports names lunar method v2 and its mean Lahiri value. Previously stored PDF bytes and calculation bindings identify their original version. The historical v1 provider-adapter fixtures remain reproducible as archived snapshots.

## Reproduction of the Delhi error

For civil 18 May 1992 at 08:15 in Delhi, Python IANA and both runtime paths agree on 02:45 UTC. The baseline lunar longitude exceeds Swiss/Moshier mode 1 by 0.00512514°. Over the 17-year birth lord, a mansion spans 13⅓ degrees. The implied timing displacement is 0.00512514 ÷ (360/27) × 17 × 365.2425 = 2.38669 days.

The instantaneous tropical value differed from Swiss by only +0.00001132°. The previous implementation subtracted a mean sidereal zero point from a *true*, nutated tropical longitude. Astronomy Engine's longitude nutation there was +0.00442006°. The previous mean origin was 0.00065668° below the Swiss mean. The remaining signed terms include the difference between the libraries' nutation models. These quantities explain the observed discrepancy without a fitted timing or angular offset.

## Numerical method

1. Astronomy Engine 2.1.19 supplies the geocentric lunar longitude in the true ecliptic/equinox of date. Subtract its own longitudinal nutation, available in arcseconds. Its documentation describes the coordinate frame. [Astronomy Engine](https://github.com/cosinekitty/astronomy/tree/master/source/js)
2. Adopt the published mean Lahiri origin 23°51′25.5324″ at J2000 TT. Advance it using the P03 expression for general precession in longitude. Subtracting the advanced mean value from a mean tropical coordinate keeps the frames consistent. This change is specifically scoped to the Moon. The chart's general historical ayanamsha and mean-node formula retain their original model. [Indian Astronomical Ephemeris comparison](https://www.astro.com/swisseph/swisseph.htm) · [P03, Table 4](https://www.aanda.org/articles/aa/pdf/2005/10/aa1908.pdf) · [Swiss reference frame options](https://www.astro.com/swisseph/swephprg.htm)
3. For civil UTC instants from 1972 onward, TT = UTC + (TAI−UTC) + 32.184 s. Use actual published leap steps. For future civil dates the convention holds the last announced offset until a new announcement. For earlier dates the historical delta-T estimate remains in place. UT-dependent Earth rotation and house calculations retain their existing clocks. [USNO](https://aa.usno.navy.mil/faq/TT) · [JPL leap-second kernel](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls) · [IERS Bulletin C](https://hpiers.obspm.fr/iers/bul/bulc/bulletinc.dat)

## Independent acceptance

The reference generator uses Swiss Ephemeris 2.10.03, its built-in Moshier ephemeris, Lahiri mode 1, Python's IANA time zones, and independently computes the period epochs. Its 123 public and canonical chart inputs include three prior report births, 12 civil-boundary cases, 52 development dates, 20 initially held-out dates and 36 further untouched dates selected after the method was frozen. Seven decades of inputs include historical IANA civil offsets. Six negative cases cover spring gaps, an autumn fold, half-hour transitions and a skipped civil day. The checked-in fixture includes 70 additional comparisons from an independent explicit-TT path using system IERS leap data.

| Set | Cases | Maximum previous lunar error | Maximum updated lunar error | Maximum updated timing difference |
|---|---:|---:|---:|---:|
| Original report births | 3 | 0.005125° | 0.000172° | 41.67 min |
| Civil boundaries | 12 | 0.004141° | 0.000388° | 2.58 h |
| Development | 52 | 0.006784° | 0.000735° | 7.73 h |
| First holdout | 20 | 0.006288° | 0.000642° | 8.02 h |
| Untouched final holdout | 36 | 0.005752° | 0.000836° | 9.89 h |

The first attempt fixed the coordinate frame and the mean zero point. It passed 85/87 at the new 0.002° target. The two failures were in 2038 and 2040, where the library's forecast UT-to-TT conversion differed from the civil-time convention. The final repair passed 123/123 at the original 0.02° tolerance and the 0.002° check. Maximum error among the 70 independent TT-specific comparisons was 0.000667°. Delhi's original boundary difference fell to 8.04 minutes. London measured 41.67 minutes and Kathmandu 40.72 minutes. Directly propagating each input Moon difference explains its calculated epoch difference within three milliseconds, including output rounding.

There is no general minute-accuracy claim. A fixed date shown in a report depends on the birth record, lunar ephemeris, time scale and chosen year definition. Advanced strengths, tradition-dependent interpretation and A21 overall still have their separate acceptance gates.

Run `npm run qa:independent-ephemeris` from the repository. To reconstruct the oracle, use Python 3.12, pyswisseph 2.10.3.2 and an IANA timezone installation with the IERS leap-seconds list, then run `python scripts/generate-dasha-lunar-reference.py`. The production runtime does not use Swiss Ephemeris.
