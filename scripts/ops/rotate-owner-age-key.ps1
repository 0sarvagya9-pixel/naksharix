# Run LOCALLY on the owner's Windows device. Do not upload private keys.
# Usage: .\scripts\ops\rotate-owner-age-key.ps1
[CmdletBinding()]
param(
    [string]$Repository = '0sarvagya9-pixel/naksharix'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Get-Command age-keygen -ErrorAction Stop | Out-Null
Get-Command gh -ErrorAction Stop | Out-Null
& gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'GitHub authentication required. Complete the official gh browser login.'
    & gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { throw 'GitHub login failed' }
}

$owner = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$root = Join-Path $env:USERPROFILE 'NAKSHARIX-Private-Recovery-Key'
if (!(Test-Path -LiteralPath $root -PathType Container)) {
    New-Item -ItemType Directory -Path $root | Out-Null
}
$rotation = Join-Path $root ('ROTATED-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $rotation -ErrorAction Stop | Out-Null

# Apply restrictive folder ACL BEFORE creating the sensitive private key.
& icacls.exe $rotation /grant:r ("{0}:(OI)(CI)(F)" -f $owner) | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not grant owner folder permissions' }
& icacls.exe $rotation /inheritance:r | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not remove folder inherited permissions' }

$key = Join-Path $rotation 'private-key.txt'
if (Test-Path -LiteralPath $key) { throw 'Refusing to overwrite existing key' }
& age-keygen -o $key 2>$null
if ($LASTEXITCODE -ne 0) { throw 'age-keygen failed' }
& icacls.exe $key /grant:r ("{0}:(F)" -f $owner) | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not restrict key owner' }
& icacls.exe $key /inheritance:r | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not remove inherited private-key permissions' }

$publicRecipient = (& age-keygen -y $key | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $publicRecipient -notmatch '^age1[0-9a-z]{50,70}$') {
    throw 'Failed to derive public recipient'
}
# This is a public key, never the private AGE-SECRET-KEY identity.
& gh variable set BACKUP_AGE_RECIPIENT --repo $Repository --body $publicRecipient
if ($LASTEXITCODE -ne 0) { throw 'Could not set GitHub repository PUBLIC variable' }
$confirm = (& gh variable get BACKUP_AGE_RECIPIENT --repo $Repository | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $confirm -ne $publicRecipient) {
    throw 'GitHub public variable does not match the rotated identity'
}
Write-Host 'NAKSHARIX_OWNER_RECIPIENT_ROTATION=PASS;GITHUB_VARIABLE=PASS'
Write-Host ('NEW_PRIVATE_KEY_FILE=' + $key)
Write-Host 'Keep the new private key offline. NEVER paste or upload its contents.'
Write-Host 'Old exposed identity MUST NOT be used for new backups.'
Write-Host 'Next: set protected GitHub secret BACKUP_DATABASE_URL directly in repository settings.'
