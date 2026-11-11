import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const script=readFileSync("scripts/ops/setup-readonly-github-backup.ps1","utf8");
const backup=readFileSync(".github/workflows/free-encrypted-db-backup.yml","utf8");
assert.ok(script.includes("$role = 'naksharix_github_backup_ro'"));
assert.ok(script.includes("$branch = 'production'"));
assert.ok(script.includes("$project = 'delicate-star-51216895'"));
assert.ok(script.includes("$database = 'neondb'"));
assert.ok(script.includes("$expectedHost = 'ep-royal-glitter-aqy6jkqz.c-8.us-east-1.aws.neon.tech'"));
assert.ok(script.includes("gh") && script.includes("auth login") && script.includes("neon auth"));
assert.ok(script.includes("Resolve-NeonCmd") && script.includes("Get-Command -Name neon.cmd"),
  "Windows must use npm-created neon.cmd, not neon.ps1.");
assert.ok(script.includes("npm install --global neon@latest --no-audit --no-fund | Out-Null"),
  "npm installation output must not contaminate the function's return value.");
assert.ok(script.includes("winget install -e --id GitHub.cli --accept-package-agreements --accept-source-agreements | Out-Null"),
  "winget output must not contaminate the GitHub CLI path.");
assert.ok(script.includes("connection-string $branch --project-id $project --role-name $role"));
assert.ok(script.includes("RedirectStandardInput = $true"));
assert.ok(script.includes("$proc.StandardInput.Write($connection)"));
assert.ok(script.includes("BACKUP_DATABASE_URL','--repo'"));
assert.ok(script.includes("Never paste Neon credentials"));
assert.ok(!script.includes("AGE-SECRET-KEY-"));
assert.ok(!/postgres(?:ql)?:\/\/[^"'\n]{4,}@/.test(script), "Never embed a production connection");
assert.ok(!script.includes("--body $connection"), "Never place database secret in process arguments");
assert.ok(!script.includes("Write-Host $connection"), "Never print database URL");
assert.ok(backup.includes("secrets.BACKUP_DATABASE_URL"));
assert.ok(backup.includes("BACKUP_AGE_RECIPIENT: age1"));
assert.ok(script.includes("$uri.Host -ne $expectedHost") && script.includes("$uri.UserInfo"));
assert.ok(script.includes("workflow run $workflow --repo $Repository --ref main"));
console.log("NAKSHARIX_OWNER_LOCAL_SECRET_BRIDGE_CONTRACT=PASS;NO_EMBEDDED_DATABASE_SECRET=YES");
