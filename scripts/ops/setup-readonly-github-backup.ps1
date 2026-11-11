# Owner-local bridge: Neon read-only credentials -> GitHub Actions secret.
# No private database URL is printed, written to a file, or committed.
# Run on the owner's trusted Windows machine with PowerShell 7.
[CmdletBinding()]
param(
    [string]$Repository = '0sarvagya9-pixel/naksharix',
    [switch]$SkipBackupRun
)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$project = 'delicate-star-51216895'
$branch = 'production'
$database = 'neondb'
$role = 'naksharix_github_backup_ro'
$expectedHost = 'ep-royal-glitter-aqy6jkqz.c-8.us-east-1.aws.neon.tech'
$workflow = 'free-encrypted-db-backup.yml'
if ($Repository -ne '0sarvagya9-pixel/naksharix') { throw 'Unexpected repository; refusing to handle production credentials.' }

function Refresh-UserPath {
    $env:PATH = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
        [Environment]::GetEnvironmentVariable('Path','User')
}
function Require-Gh {
    $command = Get-Command gh -ErrorAction SilentlyContinue
    if (!$command) {
        Write-Host 'Installing GitHub CLI from winget official package...'
        & winget install -e --id GitHub.cli --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI installation failed' }
        Refresh-UserPath
        $command = Get-Command gh -ErrorAction SilentlyContinue
        if (!$command) {
            $candidate = Join-Path $env:ProgramFiles 'GitHub CLI\gh.exe'
            if (Test-Path -LiteralPath $candidate) { $command = Get-Command $candidate }
        }
    }
    if (!$command) { throw 'GitHub CLI not found after installation. Open a new PowerShell window and run this script again.' }
    return $command.Source
}
function Require-Neon {
    $command = Get-Command neon -ErrorAction SilentlyContinue
    if (!$command) { $command = Get-Command neonctl -ErrorAction SilentlyContinue }
    if (!$command) {
        if (!(Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js/npm is required for official Neon CLI. Install Node.js LTS from nodejs.org.' }
        Write-Host 'Installing official Neon CLI...'
        & npm install --global neon@latest --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Neon CLI installation failed' }
        Refresh-UserPath
        $command = Get-Command neon -ErrorAction SilentlyContinue
        if (!$command) { $command = Get-Command neonctl -ErrorAction SilentlyContinue }
        if (!$command) {
            $candidate = Join-Path $env:APPDATA 'npm\neon.cmd'
            if (Test-Path -LiteralPath $candidate) { $command = Get-Command $candidate }
        }
    }
    if (!$command) { throw 'Neon CLI not found. Open a new PowerShell window and run this script again.' }
    return $command.Source
}
$gh = Require-Gh
$neon = Require-Neon

# Each provider handles its OWN interactive browser authorization.
& $gh auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Authorize the correct GitHub owner account in the official browser.'
    & $gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { throw 'GitHub authentication was not completed' }
}
$selectedRepo = (& $gh api "repos/$Repository" --jq '.full_name' 2>$null | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $selectedRepo -ne $Repository) {
    throw 'The signed-in GitHub identity cannot access the authorized NAKSHARIX repository'
}
Write-Host 'GitHub repository authorization: PASS'

# Neon CLI obtains the EXISTING dedicated SELECT-only production role.
# Its credential must NEVER be passed as a command-line flag or echoed.
Write-Host 'Neon account authorization may open its official browser.'
& $neon auth
if ($LASTEXITCODE -ne 0) { throw 'Neon authentication was not completed' }

$raw = @(& $neon connection-string $branch --project-id $project --role-name $role --database-name $database 2>$null)
$exit = $LASTEXITCODE
if ($exit -ne 0) { throw 'Unable to obtain dedicated Neon read-only connection; credentials were not changed' }
$candidates = @($raw | ForEach-Object { $_.ToString().Trim() } |
    Where-Object { $_ -match '^postgres(ql)?://' })
$raw = $null
if ($candidates.Count -ne 1) { throw 'Expected exactly one Neon database connection string' }
$connection = [string]$candidates[0]
$candidates = $null

try {
    if ($connection -match '[\x00-\x1f\x7f]') { throw 'Connection value contains invalid control characters' }
    $uri = [uri]$connection
    if ($uri.Scheme -notin @('postgres','postgresql') -or
        $uri.Host -ne $expectedHost -or
        $uri.AbsolutePath.Trim('/') -ne $database -or
        ([uri]::UnescapeDataString($uri.UserInfo.Split(':')[0])) -ne $role -or
        $uri.UserInfo.Split(':').Count -lt 2 -or
        $uri.Query -notmatch '(^|[?&])sslmode=(require|verify-full)(&|$)') {
        throw 'Neon connection failed exact read-only role, branch, host, database or TLS checks'
    }
    Write-Host 'Neon direct SSL read-only credential validation: PASS'

    # GitHub CLI encrypts Actions secrets locally. Redirect without newline:
    # do NOT put a secret in process argv, console, temporary file or history.
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $gh
    foreach ($arg in @('secret','set','BACKUP_DATABASE_URL','--repo',$Repository,'--app','actions')) {
        [void]$psi.ArgumentList.Add($arg)
    }
    $psi.UseShellExecute = $false
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $proc = [System.Diagnostics.Process]::new()
    $proc.StartInfo = $psi
    if (!$proc.Start()) { throw 'Unable to start encrypted GitHub secret writer' }
    try {
        $proc.StandardInput.Write($connection)
        $proc.StandardInput.Close()
        if (!$proc.WaitForExit(60000)) {
            $proc.Kill()
            throw 'GitHub secret update timed out'
        }
        if ($proc.ExitCode -ne 0) {
            throw 'GitHub secret update failed. Check GitHub login and repository permissions.'
        }
    } finally {
        $proc.Dispose()
    }
    Write-Host 'BACKUP_DATABASE_URL=STORED_SECURELY_IN_GITHUB'
} finally {
    Remove-Variable connection,uri -ErrorAction SilentlyContinue
}

$secretNames = @(& $gh secret list --repo $Repository --app actions --json name --jq '.[].name')
if ($LASTEXITCODE -ne 0 -or $secretNames -notcontains 'BACKUP_DATABASE_URL') {
    throw 'Protected GitHub Actions secret could not be confirmed'
}
Write-Host 'GITHUB_PROTECTED_SECRET_NAME=VERIFIED'

if (!$SkipBackupRun) {
    & $gh workflow run $workflow --repo $Repository --ref main
    if ($LASTEXITCODE -ne 0) { throw 'Could not dispatch encrypted backup workflow' }
    Write-Host 'BACKUP_WORKFLOW=DISPATCHED_NOT_YET_VERIFIED'
    Write-Host ('View result: https://github.com/' + $Repository + '/actions/workflows/' + $workflow)
} else {
    Write-Host 'BACKUP_WORKFLOW_DISPATCH=SKIPPED'
}
Write-Host 'Never paste Neon credentials, private age identity, or GitHub tokens into chat.'
