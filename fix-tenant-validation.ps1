# Fix tenant validation - Simple line-by-line approach
Write-Host "Fixing tenant validation..." -ForegroundColor Cyan

# Fix tracking.ts
$file = "c:\antigravity\gasera\packages\api\src\router\tracking.ts"
$lines = Get-Content $file -Encoding UTF8
$output = @()
$fixed = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $output += $lines[$i]
    
    # After line with "const tenantId = ctx.session.user.tenantId;" in getFleetPositions
    if ($lines[$i] -match 'const tenantId = ctx\.session\.user\.tenantId;' -and !$fixed) {
        # Check if next lines don't already have the fix
        if ($lines[$i+1] -notmatch 'Return empty if no tenant') {
            $output += ""
            $output += "    // Return empty if no tenant (user not fully set up)"
            $output += "    if (!tenantId) {"
            $output += "      return [];"
            $output += "    }"
            $fixed = $true
            Write-Host "Added validation to tracking.ts" -ForegroundColor Green
        }
    }
}

$output | Out-File -FilePath $file -Encoding UTF8
Write-Host "tracking.ts done!" -ForegroundColor Green

# Fix operations.ts
$file2 = "c:\antigravity\gasera\packages\api\src\router\operations.ts"
$lines2 = Get-Content $file2 -Encoding UTF8
$output2 = @()
$inBillingProc = $false
$fixed2 = $false

for ($i = 0; $i -lt $lines2.Count; $i++) {
    $output2 += $lines2[$i]
    
    # Track when we enter listBillingRequests
    if ($lines2[$i] -match 'listBillingRequests:') {
        $inBillingProc = $true
    }
    
    # After tenantId definition in listBillingRequests
    if ($inBillingProc -and $lines2[$i] -match 'const tenantId = ctx\.session\.user\.tenantId;' -and !$fixed2) {
        if ($lines2[$i+1] -notmatch 'Return empty if no tenant') {
            $output2 += ""
            $output2 += "      // Return empty if no tenant (user not fully set up)"
            $output2 += "      if (!tenantId) {"
            $output2 += "        return { data: [], total: 0, hasMore: false };"
            $output2 += "      }"
            $fixed2 = $true
            $inBillingProc = $false
            Write-Host "Added validation to operations.ts" -ForegroundColor Green
        }
    }
}

$output2 | Out-File -FilePath $file2 -Encoding UTF8
Write-Host "operations.ts done!" -ForegroundColor Green
Write-Host "`nAll fixes applied!" -ForegroundColor Cyan
