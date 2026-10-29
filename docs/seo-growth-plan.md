# SEO And Content Growth Plan

## Current Rule

Only active, useful content pages should be indexed. Hold pages and unverified engine pages must not be promoted as complete SEO surfaces.

## Active SEO Candidates

- Static horoscope pages.
- Free calculators and focused calculators.
- Reports catalogue and report detail pages.
- Blog posts after editorial review.

## Schema Plan

- Organization schema.
- Breadcrumb schema.
- Calculator structured data where appropriate.
- Article schema for blog.
- FAQ schema only when page content truly contains FAQs.

## Hold Pages

Do not create thin SEO pages for:

- Panchang until verified.
- Transit until verified or clearly educational.
- Varga/Shadbala/Ashtakvarga until verified.
- Shop, Consultation, AI Astrologer while held.

## Next Step

Build a metadata inventory and route index/noindex table before adding more SEO pages.


## 2026-10-29 International SEO and native content publication policy

- Verified indexable languages at this checkpoint: English and Hindi. Hinglish is
  a language preference in the UI; it is not an independent SEO content route.
- English/Hindi reciprocal hreflang pairs: home, free-kundli, kundli-matching.
  Each emits its own canonical, self and counterpart alternates, and x-default.
- /hi/aaj-ka-rashifal is an educational Hindi page, not a translated version
  of the live English daily forecast; do not emit false reciprocal hreflang.
- /hi SSR HTML lang must be Hindi regardless of a previously saved UI cookie.
- Unrelated child routes must not inherit homepage canonical from root layout.
- No artificial "today" modification timestamp on all sitemap entries.
- lib/seo-localization.ts enumerates Indian/international *candidate* locales,
  not active translations. This is not a claim of all-world-language coverage.
- Before publishing an additional locale: native-language content and review,
  cultural terminology accuracy, legal/privacy/price claims verification,
  language-specific navigation and UX, own canonical, reciprocal hreflang,
  SSR html lang, sitemap, links, accessibility/browser QA, and postdeploy
  Search Console indexing/monitoring evidence. No auto-translation thin pages.
- Remaining external SEO acceptance: Search Console property control, sitemap
  submission, crawl/index evidence, regional keyword research, CWV field data.
