# Tests Chrome URL extraction and streamed OAuth event without network or real login.
$ErrorActionPreference='Stop'
$source='scripts/ops/setup-readonly-github-backup.ps1'
$tokens=$null; $parseErrors=$null
$ast=[System.Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$parseErrors)
if ($parseErrors.Count) { throw "Chrome OAuth script has invalid syntax" }

foreach($name in @('Get-ChromeExecutable','Get-SafeNeonOAuthUrl','Invoke-NeonAuthInChrome')) {
    $matching=@($ast.FindAll({
        param($node)
        $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name
    },$true))
    if ($matching.Count -ne 1) { throw "Expected one function named $name" }
    . ([scriptblock]::Create($matching[0].Extent.Text))
}
$url='https://oauth2.neon.tech/oauth2/auth?state=mock-chrome&redirect_uri=http%3A%2F%2F127.0.0.1%3A56649%2Fcallback&code_challenge=mock'
$line="Auth Url: $url"
$found=Get-SafeNeonOAuthUrl -Line $line
if ($found -ne $url) { throw 'Valid Neon OAuth browser URL could not be extracted' }
foreach($bad in @(
  'Auth Url: https://evil.example/oauth2/auth?redirect_uri=http%3A%2F%2F127.0.0.1%3A56649%2Fcallback',
  'Auth Url: http://oauth2.neon.tech/oauth2/auth?redirect_uri=http%3A%2F%2F127.0.0.1%3A56649%2Fcallback',
  'Auth Url: https://oauth2.neon.tech/oauth2/auth?redirect_uri=https%3A%2F%2Fevil.example%2Fcallback'
)) {
    $result=$null
    $rejected=$false
    try { $result=Get-SafeNeonOAuthUrl -Line $bad } catch { $rejected=$true }
    # Safe rejection can either throw or return no URL, but must never
    # yield an openable third-party or non-HTTPS redirect.
    if (!$rejected -and $null -ne $result) {
        throw 'Untrusted OAuth target was accepted'
    }
}
if ((Get-SafeNeonOAuthUrl -Line 'Awaiting authentication in web browser.') -ne $null) {
  throw 'Unrelated CLI output misparsed as OAuth URL'
}
# Start-ThreadJob output must arrive while the OAuth callback process remains
# alive. Simulate Neon CLI producing a live URL then waiting to finish.
$job=Start-ThreadJob -ArgumentList $line -ScriptBlock {
  param($message)
  Write-Output $message
  Start-Sleep -Seconds 2
  Write-Output 'MOCK_LOGIN_COMPLETED'
}
$seen=$false
try {
  $limit=[DateTime]::UtcNow.AddSeconds(6)
  while([DateTime]::UtcNow -lt $limit) {
    $messages=@(Receive-Job -Job $job -ErrorAction SilentlyContinue)
    foreach($msg in $messages) {
      if((Get-SafeNeonOAuthUrl -Line ([string]$msg)) -eq $url) {
        if($job.State -ne 'Running') { throw 'OAuth URL became visible only after mock CLI exited' }
        $seen=$true
      }
    }
    if($seen) { break }
    Start-Sleep -Milliseconds 150
  }
  if(!$seen) { throw 'Streaming Neon OAuth output was not captured in time' }
  Write-Output 'CHROME_OAUTH_URL_ALLOWLIST=PASS;STREAMING_CALLBACK=PASS;NO_REAL_ACCOUNT_USED=YES'
} finally {
  if($job.State -eq 'Running') { Stop-Job -Job $job -ErrorAction SilentlyContinue }
  Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
}
