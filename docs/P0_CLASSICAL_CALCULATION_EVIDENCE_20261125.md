# P0 traditional calculation — explicit method boundary

Baseline: 3742e0548ff5d78e84f24390c447b42c2153f9e1, all eight CI workflows passed before this change.

## Reproduced issues
- D30 had no implemented Varga chart, yet the internal Saptavargaja implementation used 30 equal slices in place of the classical five unequal spans.
- Ojayugma treated Mercury as always 30 and Saturn as even-preferring, inconsistent with the stated BPHS rule.
- Ashtakavarga overwrote duplicate planet placements rather than rejecting ambiguous inputs.
- The 337 checksum did not demonstrate individual sign parity.

## Changes and independent method references
- BPHS ch.6 (9–41): https://divyachadhava.com/en/sanatan-sahitya/bphs-chapter-6-the-sixteen-divisions-of-a-r-i. Sixteen named classical sign mappings implemented internally. Existing six-chart report consumer contract preserved. D30 uses unequal arcs; its displayed degree is explicitly a normalized coordinate. D60 uses local-degree remainder convention. D64 remains blocked.
- BPHS ch.27: https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-27. Corrected shared Saptavarga sign mapping, Ojayugma, and finite-input guards. Exposed traceable Uchcha, natural, angular and decanate components separately. Full Saptavargaja dignity, Bhava midpoints, Kala, Cheshta, Drik and Bhavabala require additional independently matched calculation methods. The existing approximate total is not a classical certified total.
- Brihat Jataka IX.1–7: https://chestofbooks.com/new-age/astrology/Brihat-Jataka/Chapter-IX-On-Ashtakavargas.html. Explicit raw Aiyar convention, independent transcribed contribution vectors, Prastara rows and input integrity. https://chestofbooks.com/new-age/astrology/Brihat-Jataka/On-Ashtakavargas-Part-2.html gives the worked reduction example; preserve raw and reduced tables separately.
- Published sample https://kundli.studio/ashtakavarga: Sun agrees 12/12; four SAV cells differ from the named Aiyar convention. Record those discrepancies instead of altering the source tradition or claiming complete parity. A second published software example also differs in Moon/Venus cells; it needs convention-specific investigation.

No live feature or public strength/varga activation is authorized. These tests are arithmetic verification, not professional or predictive certification. Run npm run qa:strength and the existing six-division, independent ephemeris, Dasha and full release suites. Roll back by reverting this commit, not by resetting the branch.
