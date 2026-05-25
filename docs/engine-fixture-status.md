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

## Rule For Promotion

A module can move from Coming Soon or Partial to Active only when:

1. It has deterministic or externally verified fixtures.
2. The QA runner asserts those fixtures without skipped status.
3. The public UI includes clear limitations.
4. Sitemap/robots treat the route according to real activation status.
5. Build, lint, typecheck, `qa:foundation`, and `qa:engine` pass.
