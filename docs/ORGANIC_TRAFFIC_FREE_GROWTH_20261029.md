# NAKSHARIX — Free organic traffic and operational acceptance (29 October 2026)

Scope: Owner explicitly postponed database backup and will report Google AdSense `Ready` themselves. **Do not activate ads**; do not claim AdSense approval. This plan never asks for bought traffic, fake reviews, fake clicks or unverified testimonials.

## Source-backed live baseline (checked on 29 October 2026)
- Deployed branch: `complete-production-polish`, SHA `4bea17e749f8ef8516d8ce408b89716d142d412d`; app/database health `ok`; AI enabled and ready.
- Production readiness: email adapter configured; **no proof of inbox delivery**. Redis not configured; safe structured logger only; Sentry unconfigured; no configured analytics ID.
- Existing `/sitemap.xml` and `/robots.txt` publish canonical `https://www.naksharix.com` URLs. The sitemap includes calculators, Kundli guides, categories and blog posts.
- Search Console performance, indexing, impressions and query data **not verified**; the connected third-party GSC Wizard tool requires a paid subscription. Owner may use the official free Search Console without that plugin.
- Read-only Neon business counts: 94 Puja offerings at ₹1,100, **0** verified Puja partners, **0** ShopCatalogueSnapshot rows, **0** ManualReportOffering rows. No customer data was exported.
- Website checkout contract: priced catalog with **unpaid** order requests; Shop/Puja automatic charging disabled pending actual fulfilment. Do not bypass these guards.

## New organic-search implementation
1. Seven editorial articles with 28 substantive explanatory sections across Kundli, Guna Milan, Dasha, Panchang, numerology, tarot and horoscope. No promises of medical, relationship, financial or predictive certainty.
2. Semantic H2 sections, related educational calculators and accessible internal links on each article; `/learn` includes direct learning-to-article links.
3. Article JSON-LD uses the same verified `www` canonical origin as SEO metadata and sitemap. Do not expose account, OTP or payment information in structured data.
4. Existing sitemap automatically discovers new articles through `blogPosts`; no synthetic lastModified dates or unreviewed translations are invented.
5. Existing `qa:international-seo` now checks article coverage, indexable link chain, responsible language and canonical JSON-LD, alongside prior hreflang and noindex guards.

## Free traffic launch sequence (no bot or paid subscriptions)

### First 7 days after verified production deployment
- Owner: Open free Google Search Console at `https://search.google.com/search-console/`, verify the actual `https://www.naksharix.com/` site or domain property, and submit `https://www.naksharix.com/sitemap.xml` once. Use URL Inspection on `/free-kundli`, `/learn`, `/blog/lagna-vs-rashi` and `/blog/panchang-five-elements`. **Submission does not guarantee indexing.**
- Owner: Verify the official Bing Webmaster Tools property at `https://www.bing.com/webmasters/` and submit the same sitemap. This is optional but free; do not re-submit blindly each hour.
- Publish 3 short Hindi videos that demonstrate the free tools: (1) Lagna vs Rashi, (2) Guna Milan score, (3) local Panchang. Each link points to the one corresponding **real** calculator/article, not an unrelated landing page.
- Use the website's blog and learning pages as the canonical educational sources. No scraped articles, stolen images, bought followers or guaranteed-results headlines.

### Weeks 2–4
- Publish 2 additional useful original guides per week **only after an editorial fact check**. Choose user questions that live support actually receives; prioritize existing free calculators and their limitations.
- Release 2 short educational reels per week and 1 detailed practical tutorial, alternating Hindi and English while ensuring the landing page is readable in that language. Don't create empty regional-language doorway pages.
- Share genuinely helpful answers in relevant online communities **only where self-promotion is permitted**; disclose site ownership when linking. Avoid repetitive backlink spam.
- For blog distribution, use clear title + URL; enable previews through existing Open Graph metadata. Do not purchase links or promise that any channel will produce a fixed traffic level.
- Add attribution only after an official consent-aware analytics configuration is authorized; never put birth details or URLs with query strings in analytics.

### Days 30–90
- Weekly: review Search Console clicks, impressions, query/page CTR, indexed/non-indexed page reasons, and official Core Web Vitals **using actual collected data**. Compare 28-day windows, not small daily fluctuations.
- Improve pages with actual impressions but weak CTR by making titles match the page answer; enrich pages where queries do not match the body. Do not simply stuff keywords.
- Measure free-Kundli starts, completed results, blog-to-calculator clicks, contact requests and approved consultations **only with consent and privacy-safe events**.
- Seek legitimate editorial citations from reputable Hindu calendar, local education or non-commercial cultural organizations. Only request backlinks to useful content, not link farms.
- Review cultural and linguistic accuracy; keep Marathi/Bengali/Spanish/French drafts noindex until reviewed. Do not pretend all-language support exists.

## Measurement contract
| KPI | Source | Baseline today | Review |
|---|---|---|---|
| Search clicks / impressions / CTR | Official Search Console | Not connected or verified in this run | Weekly |
| Indexed URL count and exclusions | Official Search Console | Unknown | Weekly |
| Search query-to-page matches | Official Search Console | Unknown | Fortnightly |
| Real visitors and engagement | Consent-aware analytics | Unconfigured | Weekly once deployed |
| Guide -> free-tool engagement | First-party consent-aware events | Not instrumented / verified | Weekly |
| Organic leads -> fulfilled orders | Admin operational logs | Real partner/payment acceptance absent | Monthly |

**No fabricated numeric growth guarantees or artificial vanity metrics.** Targets should be established only after a reliable baseline (e.g. week-4 vs prior four weeks), with seasonality and source limitations recorded.

## Technical and business blockers (external evidence, not code PASS)
- Search Console property ownership and sitemap retrieval/indexing must be done with authorized Google account. GSC Wizard paid plugin is optional, not required for free Google Search Console.
- Native editorial review for indexable non-English localizations.
- Central error notifications: Sentry DSN/provider receipt and tested on-call alerts if owner enables; otherwise safe console logging remains.
- Analytics: owner-controlled GA4 property, valid measurement ID, regional consent and browser proof. Do not silently enable tracking.
- Redis: optional paid/free provider; core public-auth, AI and Shop/Puja quotas already have PostgreSQL-backed fail-closed protection, but this does not certify every multi-instance route.
- The production `_prisma_migrations` ledger is absent; never run an unreviewed migration or manufacture a migration pass.
- Email: perform an authenticated admin-only test and inspect a receiving mailbox, SPF/DKIM/DMARC and spam placement.
- Product/SKU photography: need exact genuine SKU and licensed rights, price, supplier, stock, shipping/tax, dispatch and return evidence; representative category photos are not SKU authenticity.
- Pandit: verify identity, permissions, contracts, availability, ceremony completion and prasad service when advertised. Currently no verified partners.
- Razorpay: controlled authorized sandbox and merchant tests for capture, webhook authentication/idempotency, partial/full refund, chargebacks and reconciliation; do not charge real customers to prove a code-only gate.
- Manual reports: admin-approved fees, named operator and realistic deliverable/SLA before accepting payment.
- Mobile app store release needs owner's own store account and store review, independent of website launch.

## Release rule
Keep `complete-production-polish` as authoritative site branch; do not merge diverged `main` into it. Require exact head CI, independent preview checks and explicit production deployment authorization where required. Never call an account/provider integration *complete* without provider-side proof.
