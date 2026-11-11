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

**1. Preserve and protect the existing owner-generated age identity.**

The owner has already run age-keygen on Windows. DO NOT overwrite or
regenerate the existing key; an old encrypted backup can be decrypted only
with the matching private identity. The confirmed owner public recipient is:

    age1avd5935xphjzsqec79h5fae3sqen2w8nnwzgnwdqmxga56h3mcjsd09atm

The key is stored locally in:

    $key = Join-Path $env:USERPROFILE "NAKSHARIX-Private-Recovery-Key\private-key.txt"

The initial age-keygen run warned that the file was world-readable. Tighten
the Windows NTFS file ACL before any real encrypted backup:

    $owner = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    if (!(Test-Path -LiteralPath $key -PathType Leaf)) { throw "Private key missing" }
    & icacls.exe $key /grant:r ("{0}:(F)" -f $owner)
    if ($LASTEXITCODE -ne 0) { throw "Cannot grant private-key owner access" }
    & icacls.exe $key /inheritance:r
    if ($LASTEXITCODE -ne 0) { throw "Cannot remove inherited permissions" }
    & icacls.exe $key

Check the ACL output for any remaining Everyone, Users or Authenticated Users
permissions and remove those if present; never paste the PRIVATE key content
in a chat, screenshot, GitHub repository, GitHub Actions secret, or build log.
Make a secure offline backup of the private key.

The public recipient above has been pinned as a NON-SECRET in the approved
GitHub Actions YAML, so no GitHub Repository Variable is needed.

**2. Configure ONE protected GitHub repository secret.**

Open
https://github.com/0sarvagya9-pixel/naksharix/settings/secrets/actions
while signed into the correct GitHub owner account. Add:

- **Repository secret BACKUP_DATABASE_URL**: a direct/unpooled production Neon
  PostgreSQL connection URL; use a dedicated read-only export role when
  available. The workflow verifies that the TLS-enabled URL uses the exact
  authorized source host and that the PostgreSQL session is read-only before
  any export. Obtain the secret from the official Neon Connect dialog or
  a secure credential manager. NEVER paste the database URL in ChatGPT, source
  files, pull requests, screenshots, or GitHub Variables (plaintext).

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
