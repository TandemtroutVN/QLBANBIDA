$msg = $args -join ' '
if (-not $msg) { $msg = "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

git add .
git commit -m $msg
git push
if ($?) { Write-Host "Đã push lên GitHub thành công!" -ForegroundColor Green }
