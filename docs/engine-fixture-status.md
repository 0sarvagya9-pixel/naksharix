# Naksharix Engine Fixture Status

This document records what the fixture runner verifies today and what remains blocked. It is intentionally conservative: a skipped fixture is not a pass.

| Module | Verified today? | Test type | Risk | Next requirement | Activation status |
| --- | --- | --- | --- | --- | --- |
| Numerology birth/life/name numbers | Yes | Deterministic fixture | Low | Add more names including non-English handling policy | Active |
| Lo Shu grid | Yes | Deterministic fixture | Low | Add more DOB edge cases with repeated digits | Active |
| Nakshatra degree mapping | Yes | Pure boundary fixture | Medium | Add external Moon longitude fixtures | Active only as mapping support |
| Moon sign/rashi degree mapping | Yes | Pure boundary fixture | Medium | Add ephemeris Moon longitude fixtures | Active only as mapping support |
| Vimshottari lord cycle | Yes | Deterministic sequence fixture | Medium | Add externally verified birth Dasha transitions | Partial |
| Full Kundli benchmark | No | Skipped external benchmark | High | Stable provider and trusted ephemeris comparison in CI | Partial |
| Matching Ashtakoot max score | Yes | Structural fixture | Medium | Add verified pair-specific score fixtures | Active |
| Nadi/Bhakoot exact scoring | Partial | Structural only | Medium | Add externally verified pair fixtures | Active with caution |
| Panchang | No | Gate test only | High | Verified date/location/timezone Panchang fixtures | Coming Soon |
| Transit / Gochar | No | Gate test only | High | Verified ingress/retrograde fixtures and interpretation rules | Coming Soon |
| Public claim safety | Yes | Source scan | Medium | Expand scan as new public flows are added | Active guardrail |
| External Kundli ephemeris samples | No | Schema + skipped fixtures | High | Insert trusted expected values and add CI-safe chart adapter | Needs external validation |
| Ephemeris provider interface | Partial | Type/interface guard | Medium | Wire CI-safe runtime adapter returning canonical chart JSON | Foundation only |
| Ayanamsa support | Partial | Source metadata guard | Medium | Verify Lahiri and future options against degree-shift fixtures | Lahiri internal only, no public selector |
| Panchang accuracy fixtures | No | Schema + skipped fixtures | High | Insert trusted Panchang values and adapter | Coming Soon |
| Transit engine foundation | No | Schema + skipped fixtures | High | Verified ingress/retrograde fixtures and provider adapter | Coming Soon |
| Varga chart foundation | No | Schema + skipped fixtures | High | Verified formulas and expected placements | Foundation only |
| Shadbala / Ashtakvarga foundation | No | Schema + guardrail fixtures | High | Verified formulas, external scores, and provider data | Foundation only |
| Premium PDF automation | No | Template schema only | Medium | Database workflow, admin review, renderer, storage, and delivery | Foundation only |

## Rule For Promotion

A module can move from Coming Soon or Partial to Active only when:

1. It has deterministic or externally verified fixtures.
2. The QA runner asserts those fixtures without skipped status.
3. The public UI includes clear limitations.
4. Sitemap/robots treat the route according to real activation status.
5. Build, lint, typecheck, `qa:foundation`, and `qa:engine` pass.

## External Ephemeris Gate

`qa:ephemeris` must also pass before any claim of production-grade chart precision. Placeholder fixture slots are allowed only when marked `needs_external_validation`; they are not proof of accuracy.

Panchang fixture slots follow the same rule. A fixture with null Sunrise, Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Yamaganda, Gulika, or Abhijit values cannot activate public Panchang.

## Advanced Engine Gate

`qa:transit`, `qa:varga`, and `qa:strength` extend the same no-fake rule:

- Transit fixture slots must stay skipped until exact ingress or retrograde data is externally sourced.
- Varga chart fixture slots must stay skipped or blocked until formulas and placements are verified.
- Shadbala and Ashtakvarga fixture slots must stay skipped or blocked until trusted numeric scores exist.
- Premium PDF automation is represented as schema and documentation only; no report generation or delivery is active.
