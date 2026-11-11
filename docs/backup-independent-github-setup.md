# NAKSHARIX — Free encrypted backup recovery (GitHub Actions)

## One-step protected secret setup from the owner's Windows PC

The ChatGPT GitHub integration can publish repository code and read workflow logs,
but **cannot write GitHub Actions repository secrets**. Even with full project
permission, this is a connector capability boundary, not a missing DB grant.
Do not paste production database passwords, URLs, or private encryption keys
in chat to work around it.

The owner needs to run the reviewed helper once on their **own** trusted
Windows PC (PowerShell 7); it handles the rest securely. Run it from a checked
out copy of the reviewed NAKSHARIX repository, or download the script from the
specific reviewed commit instead of an unpinned URL:

    & .\scripts\ops\setup-readonly-github-backup.ps1

The helper:
1. Installs GitHub CLI through winget and Neon CLI through npm if missing.
2. Opens official GitHub and Neon browser authorization if required.
3. Reads the existing, verified production naksharix_github_backup_ro role
   connection in memory, checking the exact project, production branch,
   neondb database, unpooled source hostname, username and SSL.
4. Pipes the URI (without a newline) into the GitHub CLI local encryption
   process to create BACKUP_DATABASE_URL under Actions Repository Secrets.
   It does not print, write, commit, or send the credential through chat.
5. Confirms the secret's name, not its value, is present and dispatches
   free-encrypted-db-backup.yml on main.

**A dispatched job is not a verified backup.** Only actual successful
independent PostgreSQL decrypt/restore + ciphertext artifact can change
the recovery result to PASS. GitHub and Neon login/authorization are completed
on the owner's device; no remote agent can bypass those steps.

## Diagnosing GitHub Actions secret write failure safely

A verified Neon login and read-only URL do **not** prove that GitHub CLI has
permission to write encrypted Actions secrets. The owner-local bridge now
checks the repository admin permission and GitHub Actions Secrets public
encryption key **before** accessing any Neon database credential.

- `GH_REPO_ADMIN=NO`: the GitHub CLI identity cannot administer the
  NAKSHARIX repository; select the correct repository owner.
- `GH_ACTIONS_SECRETS_PUBLIC_KEY=DENIED`: the CLI token lacks the
  required repository Actions-secrets access. A token supplied by
  `GH_TOKEN` or `GITHUB_TOKEN` can override the stored `gh` login.
  Refresh GitHub CLI authorization to include repository access if needed,
  then rerun the bridge. Do not paste tokens or secret URLs.
- `GH_ACTIONS_SECRET_WRITE=FAIL;ERROR_CLASS=...`: the script reports only
  a sanitized category and exit code; never paste the raw GitHub CLI error
  or database URL into chat.
- `GH_ACTIONS_SECRET_WRITE=PASS` and
  `GITHUB_PROTECTED_SECRET_NAME=VERIFIED`: the secret write and
  independent name check succeeded, but a real encrypted backup and restore
  still require a successful workflow run.

Official GitHub CLI behavior: `gh secret set NAME --repo owner/repo`
reads the value from stdin and encrypts it locally. The Actions secret
application is the default; no `--app` argument is required.

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

**1. Owner's currently selected age recipient**

The owner explicitly chose to continue using the existing age identity generated on
their Windows machine. Only the **public recipient** is pinned in the workflow.
No GitHub Repository Variable is needed for BACKUP_AGE_RECIPIENT.

**Security risk:** The corresponding private-key file was uploaded to a chat.
Its access control list on Windows has been tightened, but that does not undo the
past upload. Copies of encrypted customer-data backups could potentially be
decrypted by anyone who obtained the private key. This setup is NOT
confidentiality-verified. Generate a new offline identity before handling
sensitive production backups if maximum protection is required. The optional
local rotation script is in scripts/ops/rotate-owner-age-key.ps1 and will require
updating GitHub Actions to read a new public recipient from a repository
variable. Never upload a private age key or paste it into logs.

**2. Set protected database access in GitHub**

In GitHub repository Settings > Secrets and variables > Actions, add a
Repository Secret named BACKUP_DATABASE_URL with a direct/unpooled, TLS-enabled
Neon production PostgreSQL connection URL, preferably from a dedicated
read-only export role. The workflow restricts the host and requires a
read-only PostgreSQL session before running pg_dump.

Do not put the database URL in chat, a public GitHub repository or GitHub
Repository Variables. Only the GitHub repository's protected Secret field is
suitable for this operation.

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
