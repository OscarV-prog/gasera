# Fix operations.ts specifically
$file = "c:\antigravity\gasera\packages\api\src\router\operations.ts"
$lines = Get-Content $file -Encoding UTF8
$output = @()
$inBillingProc = $false
$foundTenantId = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $output += $line
    
    # Track when we're in listBillingRequests
    if ($line -match 'listBillingRequests:') {
        $inBillingProc = $true
        Write-Host "Found listBillingRequests procedure" -ForegroundColor Yellow
    }
    
    # Look for the specific pattern with optional chaining
    if ($inBillingProc -and $line -match 'const tenantId = ctx\.session\?\.user\?\.tenantId;') {
        $foundTenantId = $true
        Write-Host "Found tenantId definition at line $($i+1)" -ForegroundColor Yellow
    }
    
    # After we find the input destructuring line, add validation
    if ($foundTenantId -and $line -match 'const \{ limit, cursor, status') {
        # Check if validation doesn't already exist
        if ($lines[$i+1] -notmatch 'Return empty if no tenant') {
            $output += ""
            $output += "      // Return empty if no tenant (user not fully set up)"
            $output += "      if (!tenantId) {"
            $output += "        return { data: [], total: 0, hasMore: false };"
            $output += "      }"
            Write-Host "Added validation after line $($i+1)" -ForegroundColor Green
            $foundTenantId = $false
            $inBillingProc = $false
        }
    }
}

$output | Out-File -FilePath $file -Encoding UTF8
Write-Host "operations.ts fixed!" -ForegroundColor Green
