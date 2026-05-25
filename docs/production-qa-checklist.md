# Production QA Checklist

## Route Safety

- Homepage loads.
- Kundli, Numerology, Tarot, Free Calculators, Reports, and static horoscope pages load.
- Shop remains Coming Soon.
- Consultation remains Coming Soon.
- AI Astrologer remains Coming Soon / Beta Hold.
- Panchang remains Coming Soon until verified.
- Transit/Varga/Shadbala/Ashtakvarga are not public active features.

## UX

- Mobile nav has no horizontal scroll.
- Dropdowns are readable.
- Forms show validation.
- Empty states are honest.
- No raw JSON, `undefined`, `null`, or stack traces.

## Trust

- No payment success appears outside real payment flows.
- No instant report delivery claim.
- No automated premium PDF claim.
- No guaranteed outcome language.
- No live Panchang/transit claims unless fixtures pass.

## Technical

- `npm run qa:all`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Browser smoke on mobile and desktop.
- Console error check.
- Robots/sitemap review for active vs hold pages.

## Security

- Admin routes require admin role.
- Dashboard requires authenticated user.
- APIs do not expose secrets.
- Payment webhooks require signature verification before activation review.
