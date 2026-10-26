# NAKSHARIX editorial photo redesign — 2026-10-26

## Design basis
The official public Astro Arun Pandit homepage (https://astroarunpandit.org/)
was consulted for high-level presentation concepts: photography-led hero,
clear consultation/report entrypoints, horoscope/zodiac discovery and
service-led content blocks. The result is independently written with
NAKSHARIX copy, links, fonts, colors, layout and motion. It does NOT reuse
their logo, banner art, person photography, press logos, testimonials,
statistics, certification badges or fabricated success metrics.

## Assets and provenance
Existing repository-owned assets:
- /naksharix/ganesh-hero-light-saffron.jpg
- /naksharix/zodiac-wheel-gold.jpg

Third-party photographs loaded from Unsplash image CDN:
- https://images.unsplash.com/photo-1519681393784-d120267933ba (Milky Way above mountains)
- https://images.unsplash.com/photo-1500534623283-312aade485b7 (golden horizon)

Unsplash license: https://unsplash.com/license. NAKSHARIX does not assert
authorship. The URLs were visibly verified when selected. Staff should
check original authors and ongoing availability before production release.

## Product interactions
- Three real hero destinations to Kundli, Panchang, consultation. Autoplay
  pauses for hover/focus and stops when reduced-motion is preferred.
- Accessible previous/next/slide selector buttons and descriptive link names.
- Zodiac links and photo service cards to real consultation, reports, learning,
  puja enquiry and informational shop routes.
- No fake expert profiles, temple operations, social statistics or checkout.
- Optimized Next Image sources, responsive image sizes, descriptive alt
  for meaningful images and empty alt for decorative repeated backgrounds.
- Desktop, tablet and mobile styles and no-animation accessibility override.

## Verification and restrictions
- Full CI and browser QA on the exact committed SHA, including narrow 320px
  viewport, slider behavior, semantic accessibility and reduced motion.
- No database migration, Razorpay/payment edits, login change or Vercel
  deployment as part of this design PR without separate authorization.
- Visual richness does not prove real astrologer staffing, audio/video provider
  readiness, puja fulfillment, a live academy or native Android parity.
- Prior homepage source remains in components/nx-home.tsx for safe rollback.
