# P0 strength components — named classical calculation methods

Parent: a551d3d4497cb28150165aad83b169483c7c9894. Public activation and commercial release unchanged.

Reference sources consulted:
- BPHS ch. 3, verses 51–58: https://divyachadhava.com/en/sanatan-sahitya/bphs-chapter-3-grah-characters-and-description
- BPHS ch. 26, verses 6–12: https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-26
- BPHS ch. 27, verses 1–7 and 26–31: https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-27
- Angular example and general interpolation: https://jatakaveda.com/library/study/aspects/
- Bhava sign groups and distinct reading variants: https://navapanchangam.com/learn/strength/bhava-bala-house-strength

Implementation:
- Compound relationship derived from directed natural friendship and natal relative sign; 45/30/20/15/10/4/2 grade scale with explicit D1-only degree moolatrikona convention.
- Replace the old fixed natural-only Saptavargaja grades in the internal engineering score. No substitution of alternative textual variants. Incomplete chart data cannot generate a complete aggregate.
- Actual midpoint input supports angular planetary Dig Bala and separate equal-quadrant geometry. Do not overwrite the public whole-sign chart. Degenerate or unordered geometry is refused.
- BPHS literal half-open angular aspects; distinct from constant-bonus commentary convention. Explicit two readings of the Mercury/Jupiter additional aspect term; explicit polarity is required, not guessed.
- Bhava directional component, midpoint occupant contribution, phase-dependent contribution, aspect contribution and supplied lord strength are separately auditable. Conditional arithmetic total withheld when any input is missing. Supplied synthetic lord strengths in tests do not prove Shadbala.
- Existing approximate internal Shadbala totals remain labeled engineering indicators, not a completed classical calculation. Full temporal, speed-state, Ayana, planetary-war, signed-aspect and independent component parity remain open. Full Bhavabala remains open pending authentic lord-strength/cusp/polarity reference fixtures.

Regression: npm run qa:strength (includes actual TS runtime). No public activation, provider spending, production mutation or predictive claims.
