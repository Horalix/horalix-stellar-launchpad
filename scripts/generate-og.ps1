# Builds the shared social card plus one card per key route.
#
# Cards are generated as committed assets rather than at request time so they do not
# depend on the vinext beta's ImageResponse support. Page definitions live in
# assets/source/og-pages.json, which app/_data/metadata.ts imports as well, so the two
# never drift.
#
# Windows-only (System.Drawing). Run manually after a headline or brand change:
#   pwsh -File scripts/generate-og.ps1

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$platePath = Join-Path $projectRoot "assets\source\og-plate.png"
$markPath = Join-Path $projectRoot "public\brand\horalix-mark-white.png"
$pagesPath = Join-Path $projectRoot "assets\source\og-pages.json"
$ogDir = Join-Path $projectRoot "public\og"
if (-not (Test-Path $ogDir)) { New-Item -ItemType Directory -Path $ogDir | Out-Null }

# The original layered source art (social-preview-background.png) was committed truncated
# and could not be recovered, so it was removed. assets/source/og-plate.png is the last
# good full render and now serves as the plate: per-page cards keep its right-hand imagery
# and repaint the left column before new type is drawn. The plate lives outside public/ so
# its weight never ships; the served cards are the JPEGs in public/og/.
$plate = [System.Drawing.Bitmap]::FromFile($platePath)
$plateCopy = New-Object System.Drawing.Bitmap($plate)
$plate.Dispose()
$mark = [System.Drawing.Bitmap]::FromFile($markPath)

function New-Card {
  param([string]$Headline, [string]$Support, [string]$Status, [string]$OutputPath)

  $canvas = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $graphics.DrawImage($plateCopy, (New-Object System.Drawing.Rectangle(0, 0, 1200, 630)))

  # Cover the previous type completely, then feather back into the retained imagery.
  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 4, 16, 25))), 0, 0, 672, 630)
  $leftFade = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle(672, 0, 268, 630)),
    [System.Drawing.Color]::FromArgb(255, 4, 16, 25),
    [System.Drawing.Color]::FromArgb(0, 4, 16, 25),
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
  )
  $graphics.FillRectangle($leftFade, 672, 0, 268, 630)

  $graphics.DrawImage($mark, (New-Object System.Drawing.Rectangle(70, 52, 55, 73)))
  $brandFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Point)
  $lineCount = ($Headline -split "`n").Count
  $headlineSize = if ($lineCount -ge 3) { 38 } elseif ($Headline.Length -gt 52) { 43 } else { 51 }
  $headlineFont = New-Object System.Drawing.Font("Georgia", $headlineSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Point)
  $supportFont = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Point)
  $statusFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Point)
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 248))
  $muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(194, 207, 210))
  $aqua = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(118, 224, 211))

  $graphics.DrawString("H O R A L I X", $brandFont, $white, 148, 75)
  $graphics.DrawString($Headline, $headlineFont, $white, 66, 178)
  $graphics.DrawString($Support, $supportFont, $muted, 70, 377)
  $graphics.DrawLine((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(65, 118, 224, 211), 1)), 70, 493, 542, 493)
  $graphics.DrawString($Status, $statusFont, $aqua, 70, 518)

  # JPEG, not PNG: social crawlers fetch these raw (they bypass the image pipeline), and
  # the echo photography compresses to roughly a fifth of the size with no visible loss.
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]86)
  $canvas.Save($OutputPath, $encoder, $encoderParams)
  $encoderParams.Dispose()

  $statusFont.Dispose(); $supportFont.Dispose(); $headlineFont.Dispose(); $brandFont.Dispose()
  $aqua.Dispose(); $muted.Dispose(); $white.Dispose(); $leftFade.Dispose()
  $graphics.Dispose(); $canvas.Dispose()
  Write-Output $OutputPath
}

# Site-wide card: the plate re-encoded as JPEG. The PNG plate is ~9x heavier for no
# visible gain on photographic artwork, and crawlers fetch this file raw.
$siteCard = New-Object System.Drawing.Bitmap($plateCopy)
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$siteParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$siteParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]86)
$siteCard.Save((Join-Path $projectRoot "public\og.jpg"), $jpegEncoder, $siteParams)
$siteParams.Dispose(); $siteCard.Dispose()
Write-Output (Join-Path $projectRoot "public\og.jpg")

$pages = Get-Content $pagesPath -Raw | ConvertFrom-Json
foreach ($page in $pages) {
  New-Card -Headline $page.headline `
    -Support "AI-assisted echocardiography workflow" `
    -Status "$($page.eyebrow)   /   PILOT-STAGE" `
    -OutputPath (Join-Path $ogDir "$($page.file).jpg")
}

$mark.Dispose()
$plateCopy.Dispose()
