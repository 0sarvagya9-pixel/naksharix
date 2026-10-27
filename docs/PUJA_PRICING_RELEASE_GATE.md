# Puja pricing subsystem review
- Adds admin-only `/admin/puja-offerings` and `/api/admin/puja-offerings` to edit offer fee, duration, availability, note.
- Puja directory and all detail pages show prices only when admin publishes a positive verified fee.
- No seed offers; no fabricated prices, providers, slots, or ceremonies. Existing Puja enquiry stays working.
- New additive Prisma model PujaOffering; reviewed DDL: docs/sql/20261027_puja_offering.sql.
- **Do not run production schema writes in this development PR.** Confirm backups and migrations separately before release. The public pages fail closed to unpublished price when table missing.
- A displayed fee is not a binding payment or proof of reservation; owner must verify operations and final order/inclusion terms.
