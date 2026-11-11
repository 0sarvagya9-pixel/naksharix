# NAKSHARIX — Free encrypted backup recovery (GitHub Actions)

## Incident verified 2026-11-11

The Vercel Sandbox SANDBOX_START failure was independently reproduced using a safe
Sandbox create request with no Neon credentials or production data:
HTTP **402 payment_required**, "Hobby plan usage limit exceeded"; Vercel reports
reset **2026-12-01T00:00:00Z**. Changing a region or simply retrying cannot solve this
billing gate. Live site and production database health are separate from backup health.

The default-branch workflow (.github/workflows/free-encrypted-db-backup.yml)
runs on GitHub-hosted Ubuntu without Vercel Sandbox. It is independently scheduled
and does not modify the existing production Cron, application database or customer
transactions.

## Owner-only protected configuration (do NOT put secrets in chat)

**1. Rotate the old private encryption key (required).**

The original private recovery identity was uploaded to a chat. Its file ACL may
be restricted, but its secrecy can no longer be guaranteed. DO NOT encrypt new
backups for the previously pinned public recipient. Existing age ciphertext
encrypted with the older identity should be treated as potentially decryptable
by anyone who gained the leaked private key.

On the owner's trusted Windows device, install GitHub CLI if needed:

    winget install -e --id GitHub.cli

Use the reviewed LOCAL PowerShell helper in this repository:

    & .\scripts\ops\rotate-owner-age-key.ps1

It first verifies official GitHub CLI login. Then it creates a NEW private age
identity in a restricted NTFS directory, preserves the previous file for
archived-backup recovery, and saves ONLY the NEW PUBLIC recipient to GitHub
Actions Repository Variable BACKUP_AGE_RECIPIENT. The new private key is NEVER
transmitted to GitHub or the chat; make a secure OFFLINE copy.

The workflow fails closed when the new recipient is missing. NEVER re-enable
the previously pinned public recipient for new exports.

**2. Configure protected database access in GitHub (required).**

In GitHub repository Settings > Secrets and variables > Actions, set Repository
Secret BACKUP_DATABASE_URL to the production Neon direct/unpooled SSL-enabled
connection URL, preferably for a dedicated read-only export role. The source
hostname and transaction read-only setting are validated before any pg_dump.
Enter the private connection URL ONLY into GitHub's secret field, never here
in chat, GitHub Variables, public repository code, or screenshots.

**3. Verify one real backup before trusting it.**

Open
https://github.com/0sarvagya9-pixel/naksharix/actions/workflows/free-encrypted-db-backup.yml
and select Run workflow on default branch main, after the reviewed workflow is
merged.

Only a successful run with INDEPENDENT_ENCRYPTED_BACKUP_AND_RESTORE=PASS,
an uploaded naksharix-encrypted-postgres-<run id> artifact, and a restored
database schema make the independent GitHub backup **verified**. The ZIP artifact
contains age ciphertext only, retained seven days. Keep the owner private key
offline so restoration remains possible.

Until this acceptance succeeds, recovery is **NOT VERIFIED**. The existing
Vercel /api/ops/backup-status is a separate gate for its own private Blob +
Sandbox restore and may still return **HTTP 503** during the Vercel Hobby quota
outage. Never report the Vercel gate as healthy because GitHub code was merged.

## Security and cost properties

- Read-only PostgreSQL export with fixed Neon source hostname and TLS guard.
- No passwords, raw backups, user records, or private age identities in GitHub
  source, logs, notifications or uploaded artifacts.
- pg_dump stdout streams straight through age encryption.
- The owner-controlled recipient stays decryptable offline; the one-time
  verifier recipient decrypts the same encrypted archive and checks actual
  pg_restore in a disposable PostgreSQL 17 database.
- Isolated test Postgres and temporary proof key are deleted on completion.
- GitHub runner usage is subject to GitHub Actions quotas. No Vercel upgrade
  or billing action is taken automatically.
