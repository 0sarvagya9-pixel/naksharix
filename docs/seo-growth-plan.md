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

## 2026-10-29 verified-language educational expansion
- New useful, language-complete Kundli explanatory pages: English, Hindi, Marathi,
  Bengali, Spanish and French. Every version explains Lagna, Rashi, Nakshatra,
  Dasha, birth data accuracy and uncertainty, and has its own natural-language
  FAQ, canonical and reciprocal six-language hreflang cluster.
- This is a **six-language educational guide**, not full website/application
  translation. Calculator UI and payment processes remain independently scoped.
- Do not extrapolate guide-local language support into availability of
  consultation, commerce, shipping or native-language support for every workflow.
- Four of the 37 additional planned language codes (mr, bn, es, fr) now have
  educational guides. The remaining **33** do not have indexable translations.
  The larger site-wide localization backlog stays open pending original content,
  qualified native editorial review and regional legal/business verification.
- Added actual HTTP assertions for the full six-language cluster, SSR lang,
  sitemap uniqueness and exact reciprocal links. Search Console discovery and
  rankings require postdeployment monitoring; rankings cannot be guaranteed.
- Translations supplied here are editorial drafts generated for implementation;
  qualified native review is recommended before international marketing.

## SEO publishing safety gate — 29 October 2026
- Four newly drafted translations (Marathi, Bengali, Spanish, French) require independent native-speaker review before being declared indexable.
- New draft routes remain reachable for review, but send noindex,follow and are excluded from sitemap and hreflang.
- English/Hindi baseline guide routes remain indexable and mutually annotated.
- Private commerce, puja and written-astrology enquiry forms now have noindex,follow metadata and are excluded from the sitemap.
- Metadata avoids claiming provider-verified Panchang or currently unavailable AI remedies without evidence.
- Promote a language explicitly in indexableKundliGuideLanguages only after linguistic, cultural, accessibility and legal/claim review.
- Search Console access, actual rankings, provider configuration, backups and supplier fulfillment are separate release-acceptance tasks.
