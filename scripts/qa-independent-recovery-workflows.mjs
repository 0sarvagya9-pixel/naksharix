import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const backup=readFileSync(".github/workflows/free-encrypted-db-backup.yml","utf8");
const watch=readFileSync(".github/workflows/encrypted-recovery-watch.yml","utf8");

// GitHub free runner is independent of the exhausted Vercel Hobby Sandbox.
assert.match(backup,/schedule:\s*\n\s+- cron: '43 4 \* \* \*'/);
assert.match(backup,/workflow_dispatch:/);
assert.match(backup,/BACKUP_DATABASE_URL: \$\{\{ secrets\.BACKUP_DATABASE_URL \}\}/);
const ownerPublicRecipient="age1avd5935xphjzsqec79h5fae3sqen2w8nnwzgnwdqmxga56h3mcjsd09atm";
assert.ok(backup.includes("BACKUP_AGE_RECIPIENT: "+ownerPublicRecipient),
  "Public recipient must match owner's verified age-keygen output.");
assert.ok(!backup.includes("vars.BACKUP_AGE_RECIPIENT"),
  "The public recipient is pinned; a missing repo variable must not block backup.");
assert.equal((backup.match(/BACKUP_AGE_RECIPIENT: age1/g)||[]).length,1,
  "Declare owner public recipient once at job scope.");
assert.match(backup,/EXPECTED_SOURCE_HOST: ep-royal-glitter-aqy6jkqz\.c-8\.us-east-1\.aws\.neon\.tech/);
assert.match(backup,/BACKUP_SOURCE_DIRECT_TLS_HOST_GUARD=PASS/);
assert.match(backup,/PGOPTIONS: -c default_transaction_read_only=on/);
assert.match(backup,/SHOW transaction_read_only/);
assert.match(backup,/--format=custom --no-owner --no-privileges/);
assert.match(backup,/age -r "\$BACKUP_AGE_RECIPIENT" -r "\$NAKSHARIX_VERIFY_RECIPIENT"/);
assert.match(backup,/age --decrypt --identity/);
assert.match(backup,/pg_restore[\s\S]{0,200}--exit-on-error/);
assert.match(backup,/SCHEMA_COUNTS=/);
assert.match(backup,/retention-days: 7/);
assert.match(backup,/if: env\.NAKSHARIX_VERIFIED_RESTORE == 'YES'/);
assert.match(backup,/shred -u/);
assert.ok(backup.indexOf("age --decrypt --identity") < backup.indexOf("actions/upload-artifact@v4"),
  "Artifact must be uploaded only AFTER a real ciphertext decrypt and independent restore.");
assert.ok(!backup.includes("--schema-only") && !backup.includes("BACKUP_ENCRYPTION_KEY"),
  "Backing up the schema alone or copying Vercel private encryption key is prohibited.");
assert.ok(!backup.includes("actions/download-artifact"),
  "Encrypted backup must be produced from the live direct read-only source, not a fixture.");

// Watcher must not accept a stale or synthetic job, or pretend the Vercel
// provider succeeded merely because the independently restored GitHub archive did.
assert.match(watch,/actions: read/);
assert.match(watch,/steps\.primary\.outcome == 'failure'/);
assert.match(watch,/workflow_runs/);
assert.match(watch,/x\.head_branch==='main'/);
assert.match(watch,/x\.status==='completed' && x\.conclusion==='success'/);
assert.match(watch,/Date\.now\(\)-36\*60\*60\*1000/);
assert.match(watch,/name='naksharix-encrypted-postgres-'\+id/);
assert.match(watch,/!x\.expired/);
assert.match(watch,/x\.workflow_run\?\.id===Number\(id\)/);
assert.match(watch,/steps\.primary\.outcome != 'success' && steps\.independent\.outcome != 'success'/);
assert.match(watch,/Vercel Sandbox primary remains separately quota-blocked; no Vercel receipt is claimed/);
console.log("NAKSHARIX_INDEPENDENT_ENCRYPTED_RECOVERY_WORKFLOW_CONTRACT=PASS;NO_LIVE_BACKUP_CLAIM=YES");
