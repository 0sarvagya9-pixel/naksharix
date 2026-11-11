# Simulate multiple Windows gh identities WITHOUT contacting GitHub or Neon.
# The real script must choose the repository OWNER before acquiring DB credentials.
$ErrorActionPreference = 'Stop'
$source = 'scripts/ops/setup-readonly-github-backup.ps1'
$tokens = $null; $errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile(
    $source, [ref]$tokens, [ref]$errors)
if ($errors.Count) { throw 'Owner-login script failed PowerShell parser' }
$nodes = @($ast.FindAll({
    param($node)
    $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
    $node.Name -eq 'Ensure-BackupGithubOwner'
}, $true))
if ($nodes.Count -ne 1) { throw 'Ensure-BackupGithubOwner function not found' }
. ([scriptblock]::Create($nodes[0].Extent.Text))
function Get-ChromeExecutable { return 'C:\mock\chrome.exe' }
function MockGh {
    $invocation = @($args) -join ' '
    $global:LASTEXITCODE = 0
    if ($invocation -match '^api user(?:\s|$)') {
        Write-Output $global:MOCK_GH_USER
        return
    }
    if ($invocation -like 'api repos/0sarvagya9-pixel/naksharix*') {
        if ($global:MOCK_GH_USER -eq '0sarvagya9-pixel') {
            Write-Output 'true'
        } else {
            Write-Output 'false'
        }
        return
    }
    if ($invocation -like 'auth switch*') {
        $global:MOCK_SWITCHES++
        if ($global:MOCK_GH_OWNER_STORED) {
            $global:MOCK_GH_USER = '0sarvagya9-pixel'
        } else {
            $global:LASTEXITCODE = 1
        }
        return
    }
    if ($invocation -like 'config set browser*') {
        $global:MOCK_CHROME_CONFIGURED = $true
        return
    }
    if ($invocation -like 'auth login*') {
        if (!$global:MOCK_CHROME_CONFIGURED) {
            throw 'Owner OAuth did not select Chrome'
        }
        $global:MOCK_BROWSER_LOGINS++
        $global:MOCK_GH_OWNER_STORED = $true
        $global:MOCK_GH_USER = '0sarvagya9-pixel'
        return
    }
    if ($invocation -like 'auth refresh*') {
        throw 'Unexpected token refresh in mock'
    }
    throw ('Unexpected gh invocation: ' + $invocation)
}
$repo = '0sarvagya9-pixel/naksharix'
# Case 1: Both identities are saved and ravanmusic001 is active.
$global:MOCK_GH_USER = 'ravanmusic001'
$global:MOCK_GH_OWNER_STORED = $true
$global:MOCK_SWITCHES = 0
$global:MOCK_BROWSER_LOGINS = 0
$global:MOCK_CHROME_CONFIGURED = $false
Ensure-BackupGithubOwner -Github 'MockGh' -TargetRepository $repo
if ($global:MOCK_GH_USER -ne '0sarvagya9-pixel' -or
    $global:MOCK_SWITCHES -ne 1 -or $global:MOCK_BROWSER_LOGINS -ne 0) {
    throw 'Stored admin account auto-switch failed'
}
Write-Host 'GH_ALREADY_STORED_ADMIN_AUTOSWITCH=PASS'

# Case 2: Only ravanmusic001 has authenticated, requires one browser OAuth.
$global:MOCK_GH_USER = 'ravanmusic001'
$global:MOCK_GH_OWNER_STORED = $false
$global:MOCK_SWITCHES = 0
$global:MOCK_BROWSER_LOGINS = 0
$global:MOCK_CHROME_CONFIGURED = $false
Ensure-BackupGithubOwner -Github 'MockGh' -TargetRepository $repo
if ($global:MOCK_GH_USER -ne '0sarvagya9-pixel' -or
    $global:MOCK_BROWSER_LOGINS -ne 1 -or !$global:MOCK_CHROME_CONFIGURED) {
    throw 'Owner Chrome OAuth fallback failed'
}
Write-Host 'GH_OWNER_CHROME_OAUTH_FALLBACK=PASS'

# Case 3: Correct owner is already active; avoid needless auth.
$global:MOCK_GH_USER = '0sarvagya9-pixel'
$global:MOCK_GH_OWNER_STORED = $true
$global:MOCK_SWITCHES = 0
$global:MOCK_BROWSER_LOGINS = 0
Ensure-BackupGithubOwner -Github 'MockGh' -TargetRepository $repo
if ($global:MOCK_SWITCHES -ne 0 -or $global:MOCK_BROWSER_LOGINS -ne 0) {
    throw 'Existing owner login should be reused'
}
Write-Host 'GH_EXISTING_OWNER_REUSED=PASS'
