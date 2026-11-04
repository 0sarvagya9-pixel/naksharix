# Consented aggregate analytics

The deployed first-party collector counts public pageviews and allowlisted interactions after explicit consent. It is not Vercel Web Analytics and does not count unique visitors. No actor ID, email, birth data, private route, query string or arbitrary metadata is recorded. Dynamic public detail URLs are reduced to route categories. DNT and Global Privacy Control suppress collection.

Visitors can allow or decline in the footer privacy preferences. The choice stays in localStorage; no analytics visitor cookie is issued. Data is aggregated per UTC day, route category and event, retained 90 days, and is available only to authorized administrators at `/admin/operations` and `/api/admin/analytics`. CSRF, origin, strict body validation and per-instance rate protection apply to the collector.

Search Console impressions/clicks and Google indexing remain separate provider evidence. Do not present synthetic QA visits as organic growth or customer conversion.
