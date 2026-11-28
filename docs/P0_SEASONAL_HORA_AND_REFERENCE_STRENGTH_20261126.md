# Planetary hours and published strength conventions

All comparisons use the existing tolerance of 0.25 virupa on unrounded output. Each complete chart has seven fields for each of seven grahas and four fields for twelve houses. A count of matches on the Parashara’s Light reports is descriptive because the house tables print integers and additionally count occupants and day/night strength. That publisher also offers selectable Mercury nature, Drig and angular calculation options. Its 2020 chart uses True Citra while the local pipeline uses Lahiri. [Publisher’s manual, p. 191](https://www.parasharasoftware.com/Parashara-Light-90/Download/PLmanual.pdf)

| Date | Publisher or software | Raman, equal hours | Raman, seasonal hours | Longitude sine, seasonal hours, split luminaries |
| --- | --- | ---: | ---: | ---: |
| 1978-08-23 | AstroSage | 66 | 66 | 62 |
| 1979-08-23 | AstroSage | 72 | 72 | 54 |
| 2025-01-01 | OneKundli / Dhruv Astro Software | 70 | 72 | 55 |
| 1990-04-23 | Parashara’s Light 7.0.3 | 35 | 35 | 42 |
| 2000-11-11 | Parashara’s Light 7.0.3 | 33 | 33 | 38 |
| 2020-01-25 | Parashara’s Light 9.0 | 37 | 37 | 47 |

Seasonal hours divide actual sunrise to sunset into twelve equal intervals and sunset to the next sunrise into twelve further intervals. Sunrise starts the first day hour and sunset starts the first night hour. The preceding sunrise supplies the weekday lord. The runtime evaluates 144 boundary conditions for three cycles of different lengths and rejects invalid intervals. The customary equal-cycle definition is also documented. [Seasonal and equal-cycle comparison](https://phaladeep.com/) · [Equal-cycle study, IIT Guwahati](https://event.iitg.ac.in/unikaa24/Abstract_Book_UNIKAA_2024.pdf)

The seasonal rule matches six published hour lords. Only the OneKundli chart distinguishes the two rules in this set. Its seasonal hour belongs to Mercury, and the equal-cycle hour belongs to Venus. The repair transfers a 60-virupa award between the two. Their planetary totals continue to differ because Mercury has positional and motion residuals and Venus has a motion residual. Both original charts still miss 25 cells apiece. No planetary or house total is taken from the fixture.

The second opt-in comparison computes Ayana as 30 times one plus the appropriately signed sine of the tropical ecliptic longitude. Mercury takes the absolute sine, the Moon and Saturn reverse the sign, and the others use the signed sine. The Sun contributes its undoubled Ayana to Kala and again separately to Cheshta. The Moon contributes the short Sun–Moon elongation divided by three to Paksha and again to Cheshta. The measured declination continues to serve the independent war comparator. [Writer, *Predictive Astrology Through the Nirayana System*, part II, pp. 61–62](https://ftpmirror.your.org/pub/wikimedia/images/wikipedia/commons/0/01/PREDICTIVE-NIRAYANA-SIDEREAL-ASTROLOGY_-_PART_II_AS-TAUGHT-BY-PROF-ANTHONY-WRITER.pdf) · [BPHS 27.18](https://indike.org/pramana/in.astro.hora.yavana.brhatparasara.27)

All seven values in Writer’s worked May 1990 example reproduce to its printed precision. The April 1990 and January 2020 Parashara’s Light reports reproduce all fourteen Ayana values with errors below 0.005 virupa. The November 2000 fixture was evaluated after selecting the formula and reproduces all seven values within 0.007. Six of six separately printed luminary Cheshta values match on these three charts. The older settings remain available for AstroSage and OneKundli.

Reproduce with `npm run qa:strength` and inspect `P0_SEASONAL_HORA_STRENGTH`. Each row identifies reference and computed values. Each planet trace includes computed longitude, measured declination, all seven divisional dignity contributions, temporal components, motion intermediates and houses inheriting its strength. The code retains public and full-strength verification gates. Numerical parity for these scoped components does not certify the complete planetary or house method.
