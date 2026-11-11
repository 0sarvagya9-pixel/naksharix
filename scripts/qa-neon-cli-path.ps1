# Regression test: native npm install stdout must NEVER become the Neon path.
# Loads only selected function definitions. Does not authenticate or access secrets.
$ErrorActionPreference = 'Stop'
$path = 'scripts/ops/setup-readonly-github-backup.ps1'
$code = Get-Content -LiteralPath $path -Raw
$tokens=$null; $parseErrors=$null
$ast = [System.Management.Automation.Language.Parser]::ParseInput($code,[ref]$tokens,[ref]$parseErrors)
if ($parseErrors.Count) { throw 'PowerShell script cannot be parsed' }
$needed = @('Resolve-NeonCmd','Require-Neon')
foreach ($name in $needed) {
    $matches = @($ast.FindAll({
        param($node)
        $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
        $node.Name -eq $name
    },$true))
    if ($matches.Count -ne 1) { throw "Expected precisely one $name definition" }
    . ([scriptblock]::Create($matches[0].Extent.Text))
}
# The installer would print this exact noise to the PowerShell success stream.
# Mock npm to avoid installing anything or leaving runner credentials.
function npm {
    $mockPath = Join-Path $env:APPDATA 'npm\neon.cmd'
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $mockPath) | Out-Null
    Set-Content -LiteralPath $mockPath -Value 'mock executable' -NoNewline
    $global:LASTEXITCODE = 0
    Write-Output 'added 159 packages in 20s'
}
function Refresh-UserPath {}
$originalAppData = $env:APPDATA
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('naksharix-neon-qa-'+[guid]::NewGuid().ToString('N'))
try {
    New-Item -Path $temp -ItemType Directory -Force | Out-Null
    $env:APPDATA = $temp
    $found = @(Require-Neon)
    $expected = Join-Path $env:APPDATA 'npm\neon.cmd'
    if ($found.Count -ne 1 -or $found[0] -ne $expected) {
        throw 'Installer stdout contaminated the CLI executable path'
    }
    if ($found[0] -match 'added 159 packages' -or $found[0].EndsWith('neon.ps1')) {
        throw 'Detected original Neon CLI output/path bug'
    }
    # A second run must not trigger npm installation.
    $second = @(Require-Neon)
    if ($second.Count -ne 1 -or $second[0] -ne $expected) {
        throw 'Previously installed neon.cmd cannot be reused'
    }
    Write-Output 'NAKSHARIX_NEON_CLI_INSTALL_STDOUT_REGRESSION=PASS;NEON_CMD_SELECTED=PASS'
} finally {
    $env:APPDATA = $originalAppData
    Remove-Item -LiteralPath $temp -Force -Recurse -ErrorAction SilentlyContinue
}
