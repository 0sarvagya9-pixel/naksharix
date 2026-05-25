# Naksharix Engine Fixture Status

This document records what the fixture runner verifies today and what remains blocked. It is intentionally conservative: a skipped fixture is not a pass.

| Module | Verified today? | Test type | Risk | Next requirement | Activation status |
| --- | --- | --- | --- | --- | --- |
| Numerology birth/life/name numbers | Yes | Deterministic fixture | Low | Add more names including non-English handling policy | Active |
| Lo Shu grid | Yes | Deterministic fixture | Low | Add more DOB edge cases with repeated digits | Active |
| Nakshatra degree mapping | Yes | Pure boundary fixture | Medium | Add external Moon longitude fixtures | Active only as mapping support |
| Moon sign/rashi degree mapping | Yes | Pure boundary fixture | Medium | Add ephemeris Moon longitude fixtures | Active only as mapping support |
| Vimshottari lord cycle and provider Dasha balance | Yes | Deterministic/provider fixture | Medium | Add externally verified birth Dasha transitions | Provider verified, internal/report only |
| Full Kundli benchmark | Provider verified | Provider-generated regression fixture | High | Add Swiss Ephemeris/Jagannatha Hora cross-checked samples | Provider verified, not external verified |
| Matching Ashtakoot max score | Yes | Structural fixture | Medium | Add verified pair-specific score fixtures | Active |
| Nadi/Bhakoot exact scoring | Partial | Structural only | Medium | Add externally verified pair fixtures | Active with caution |
| Panchang | Provider verified | Provider-generated regression fixture | High | Cross-check with trusted Panchang source before external accuracy claims | Public active provider-verified |
| Transit / Gochar | Partial | Provider snapshot fixture only | High | Verified ingress/retrograde fixtures and interpretation rules | Snapshot provider verified, prediction pages Coming Soon |
| Public claim safety | Yes | Source scan | Medium | Expand scan as new public flows are added | Active guardrail |
| External Kundli ephemeris samples | No | Schema + skipped fixtures | High | Insert trusted expected values and replace blocked adapter metadata with verified chart output | Needs external validation |
| Ephemeris provider interface | Provider verified | CI-safe adapter + provider fixtures | Medium | Add external comparison fixtures | Internal provider verified |
| Ayanamsa support | Partial | Source metadata guard | Medium | Verify Lahiri and future options against degree-shift fixtures | Lahiri internal only, no public selector |
| Panchang accuracy fixtures | Provider verified | Generated provider fixtures + QA | High | Insert trusted external Panchang values and adapter | Public active provider-verified |
| Transit engine foundation | No | Schema + skipped fixtures | High | Verified ingress/retrograde fixtures and provider adapter | Coming Soon |
| Varga chart foundation | Provider verified | Provider longitude fixtures for D1/D2/D3/D9/D10/D12 | High | Cross-check placements with trusted software | Internal/report only |
| Shadbala / Ashtakvarga foundation | Partial | Naisargika Bala provider/deterministic constant guard | High | Verified formulas, external scores, and provider data | Partial internal only |
| Premium PDF automation | Partial | Internal PDF buffer generation guarded by content + admin review | Medium | Verified chart workflow, file storage, admin delivery status, and user download security | Internal only |
| Interpretation engine | Provider verified | Safety rules + provider chart facts | High | Editorially reviewed multilingual rule database | Internal/report only |
| Remedies engine | Provider verified | Safety rules + guarded conditions | High | Expert-reviewed non-fear-based remedy rules | Internal/report only |
| Report backend workflow | Partial | Prisma/API/admin read surfaces | Medium | No-payment request policy, admin notes/status workflow, user history | Request-intent public flow |
| Payment readiness | Partial | Route audit/docs | High | Env, webhook, invoices, refunds, entitlement review | Hold/foundation only |
| Production safety QA | Yes | Source/route guard script | Medium | Expand scan when new public modules are added | Active guardrail |

## Rule For Promotion

A module can move from Coming Soon or Partial to Active only when:

1. It has deterministic provider fixtures or externally verified fixtures.
2. The QA runner asserts those fixtures without skipped status.
3. The public UI includes clear limitations.
4. Sitemap/robots treat the route according to real activation status.
5. Build, lint, typecheck, `qa:foundation`, and `qa:engine` pass.

## External Ephemeris Gate

`qa:provider-kundli`, `qa:provider-panchang`, `qa:provider-transit`, and `qa:provider-varga` now provide deterministic provider-regression proof. This is not the same as external verification. `qa:ephemeris` must still pass with trusted external samples before any Swiss/JHora-style precision claim.

Panchang is public only as provider-verified. A fixture with null Sunrise, Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Yamaganda, Gulika, or Abhijit values cannot support stronger external accuracy claims.

## Advanced Engine Gate

`qa:transit`, `qa:varga`, and `qa:strength` extend the same no-fake rule:

- Transit prediction pages must stay skipped until exact ingress or retrograde data is externally sourced.
- Varga public chart output remains internal-only until placements are cross-checked externally.
- Shadbala total and Ashtakvarga bindu scores remain blocked until trusted formulas and numeric score fixtures exist.
- Premium PDF generation remains internal; no report delivery is active.

## Business Workflow Gate

Report, dashboard, payment, admin, and history surfaces should show only persisted data or honest empty states. Payment and delivery language must not appear in non-payment report flows. Shop, Consultation, and AI Astrologer remain excluded hold modules.

Current activation decision:

- Public report DB persistence is not activated because the existing creation API requires an authenticated user and either payment/admin bypass.
- Admin report request reading exists, but the status model and notes workflow are not yet aligned with the requested manual review lifecycle.
- User report/Kundli history remains honest-empty unless real persisted rows exist.
- Payment remains disabled for public report flows until order creation, webhook verification, entitlement, refund, and invoice handling are production-ready.
- Premium PDF generation can now produce an internal reviewed PDF buffer from assembled report content, but public delivery remains blocked until verified chart data, storage, admin review, and delivery status are real.

## Code-Level Activation Matrix

`lib/astrology/premium-engine/activation-status.ts` is the source of truth for public activation decisions. As of this pass:

- Chart precision, Dasha, Transit Snapshot, Varga, Interpretation, Remedies, Premium Report Content, and PDF Generation are provider-verified internal/report-only.
- Panchang is publicly enabled as provider-verified and sitemap-eligible, with clear limitations.
- Transit prediction pages remain Coming Soon until ingress/retrograde fixtures pass.
- Full Shadbala and Ashtakvarga remain blocked until formulas and trusted score fixtures exist.
- Provider-verified does not mean externally verified.
