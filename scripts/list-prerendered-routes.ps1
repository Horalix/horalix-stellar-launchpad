$root = "c:\Users\neuma\OneDrive\Documents\GitHub\horalix-stellar-launchpad\dist"
Get-ChildItem -Path $root -Recurse -Filter index.html |
  ForEach-Object {
    $rel = $_.FullName.Substring($root.Length).TrimStart("\\")
    $route = $rel -replace "\\index.html$", "" -replace "\\", "/"
    if ([string]::IsNullOrWhiteSpace($route)) { $route = "/" } else { $route = "/" + $route }
    $route
  } |
  Sort-Object | Set-Content -Path (Join-Path $root "prerender-routes.txt")
