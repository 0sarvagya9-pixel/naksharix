# NAKSHARIX Free-Plan Backup and Uptime Acceptance

## GitHub scheduled workflow branch

GitHub Actions cron schedules execute from repository default branch (main), NOT
the deployed application source branch complete-production-polish. The two
standalone workflow YAML files and the health-check module must be copied to
main separately after the PR passes. Never merge all application source from
complete-production-polish into main just to enable a scheduled job.

## Hourly uptime
Workflow free-public-uptime.yml checks six public routes, database health,
the actual production release branch, and exact Google ads.txt publisher.
Failures are retried three times. A GitHub issue opens on persistent failure
and closes when the next run succeeds. The workflow sends no user data.
GitHub Actions schedules are best effort, not guaranteed exact execution.

## Encrypted backup prerequisites
Daily free-encrypted-db-backup.yml uses PostgreSQL 17 pg_dump custom format,
streams directly into age public-key encryption and uploads ONLY ciphertext,
retained seven days in a private GitHub Actions artifact. The repository is
public, so age recipient confidentiality must rely on the offline private key.

In GitHub Settings / Secrets and variables / Actions, configure:
1. Secret BACKUP_DATABASE_URL: dedicated least-privilege READ-ONLY Neon
   database connection string for the production database. Use the unpooled
   direct Neon hostname as recommended for pg_dump. Do not publish this URL,
   paste it into a chat, or reuse a privileged DB administrator password.
2. Repository variable BACKUP_AGE_RECIPIENT: an age1 public recipient from a
   freshly generated age keypair. Keep the corresponding private key offline,
   with safe physical backup, not in GitHub/Vercel/chats.
3. Restrict Actions permission, monitor run failures, and verify GitHub's
   artifact retention and quota for your account.

Before publishing ready-for-recovery:
- Run the backup manually at least once and inspect an actual encrypted artifact.
- In an isolated trusted environment decrypt with the offline private age key,
  validate pg_restore -l, and restore to a disposable PostgreSQL 17 database.
- Compare non-PII schema/table counts and safely exercise one sample query.
- Add separately approved durable encrypted off-site retention for serious
  recovery; seven-day GitHub artifacts alone are NOT durable DR.
- Confirm scheduled recurrence and alert receipt. Without these the status is
  BACKUP_WORKFLOW_PREPARED, NOT BACKUP_OPERATIONAL.
- Preserve the existing manual 2026-10-27 Neon snapshot and never delete it.

## Provider, supplier and review boundaries

Google AdSense Sites status Getting ready remains Google-controlled; ads.txt
Authorized is not ad-serving approval. Certified consent management and actual
Google-generated manual ad unit IDs require owner acceptance. Physical product
stock/rights, real Pandit schedules and payment capture/refund evidence must
not be faked. Native editorial QA is necessary before indexing any of the
remaining language pages. GSC Wizard paid connector is optional: the official
Google Search Console dashboard remains accessible independently.
