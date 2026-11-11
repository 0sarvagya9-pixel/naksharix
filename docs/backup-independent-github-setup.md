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

**1. Create the owner encryption identity locally and save it offline.**

On the owner's Windows computer, open PowerShell and run:

    winget install -e --id FiloSottile.age --accept-package-agreements --accept-source-agreements

Open a new PowerShell terminal if the commands are not immediately found, then:

    $backupKeyDir = Join-Path $env:USERPROFILE "Documents\NAKSHARIX-Private-Recovery-Key"
    New-Item -Path $backupKeyDir -ItemType Directory -Force | Out-Null
    age-keygen -o (Join-Path $backupKeyDir "private-recovery-age-key.txt")
    age-keygen -y (Join-Path $backupKeyDir "private-recovery-age-key.txt")

Keep **private-recovery-age-key.txt** safe and make an offline backup (e.g., encrypted
USB drive). Never paste, upload or commit the private key. The final command prints
a public age1... recipient, which is safe to share with GitHub as a variable.

**2. Configure two GitHub repository settings.**

Open
https://github.com/0sarvagya9-pixel/naksharix/settings/secrets/actions
while signed into the correct repository owner account.

- **Repository secret BACKUP_DATABASE_URL**: a direct/unpooled production Neon
  PostgreSQL connection string; use a dedicated read-only export role when
  available. It must use TLS (sslmode=require or verify-full) and the expected
  verified Neon source hostname. Obtain it from the official Neon Connect dialog
  or a verified credential manager. Do not paste the URL into ChatGPT, source,
  pull requests, or screenshots.
- **Repository variable BACKUP_AGE_RECIPIENT**: the age1... public recipient
  printed locally above; never the private key.

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
