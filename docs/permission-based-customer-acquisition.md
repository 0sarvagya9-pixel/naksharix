# Permission-based individual customer acquisition

This feature records explicit opt-in from a signed-in, verified ordinary customer account, not from account creation, checkout, browsing, scraped third-party lists, or inferred characteristics. It sends no marketing email and makes no Brevo contact writes.

## Deployment gates
- Review additive SQL and run it twice on disposable PostgreSQL. Rehearse subscription, explicit consent required, unverified customer rejected, user identity cannot be supplied, withdrawal, changed email invalidates permission, account deletion cascades, CSRF and anonymous access. The existing full CI, database rehearsal and browser tests must pass.
- Do not apply the migration to production until separately reviewed and exact schema backup is verified. Apply additive SQL before deploying code. Verify production anonymously and with an authorized test account; remove or exclude test contacts from acquisition metrics. Do not seed customer leads.
- Public email-updates page requires a verified customer account; footer links to it. After live verification, promote via consent-based content and free tools. Qualification reason is the user's selected interest + explicit adult opt-in + verified account email. This is evidence of interest, not proof of purchase.
- Export only matching current verified email, current consent version, and unrevoked consent. Deduplicate, exclude owner/test/admin accounts, honor all suppression records. Import to marketing provider only after official sender and double-opt-in/consent policy verified and a reliable two-way withdrawal/suppression reconciliation is implemented. Brevo unsubscribe link must work and Brevo unsubscribe/bounce suppression must be honored before any campaign, including changes made between export and sending. Do not send until this gate is met. No automated export or send exists here.
- Report acquisition count and verified paid report count separately. No purchased, scraped, inferred, or fabricated contacts.

## Offline suppression reconciliation

The read-only command below compares website consent with a complete, dated snapshot of one authorized Brevo marketing list. It returns aggregate counts by reason and self-selected interest. Supply the real provider total across pages as `count`, the `listId`, an ISO `capturedAt` timestamp and the combined `contacts` array. Each contact needs `email`, `emailBlacklisted`, `listIds` and `listUnsubscribed` for a positive match. Missing provider fields or incomplete pagination hold that contact or snapshot for review. Supply additional known owner and test addresses in `excludedEmails`. The configured administrator and QA recipient are excluded automatically.

```sh
node --experimental-strip-types scripts/audit-marketing-consent.mjs /private/authorized-list-snapshot.json
```

A website withdrawal paired with an active provider record increments the suppression-review count. The separate provider-only count identifies addresses without website-consent evidence. Correct any discrepancy under the applicable provider policy before outreach. Provider changes after the snapshot require another comparison. The command does not send, change list membership, modify a blocklist, or print a recipient list. Keep the private input outside the repository. [Brevo list-contact fields](https://developers.brevo.com/reference/get-contacts-from-list)
