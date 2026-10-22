# Builds the square icon set from the brand master.
#
# The supplied brand marks are 653x863 / 1024x1024 with generous padding, which browsers
# squash and Google's favicon crawler rejects. This composites the white mark onto a
# square ink tile so the icon stays legible at 32px and passes the square requirement.
#
# Windows-only (System.Drawing). Run manually after a brand-asset change:
#   pwsh -File scripts/generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$markPath = Join-Path $projectRoot "public\brand\horalix-mark-white.png"
$outputDir = Join-Path $projectRoot "public\brand"
$mark = [System.Drawing.Bitmap]::FromFile($markPath)
$ink = [System.Drawing.Color]::FromArgb(255, 7, 20, 29)

function New-IconBitmap {
  param([int]$Size)
  $canvas = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($ink)

  # Fill ~72% of the tile height so the mark still reads at 32px.
  $targetHeight = [int]($Size * 0.72)
  $targetWidth = [int]($targetHeight * $mark.Width / $mark.Height)
  $x = [int](($Size - $targetWidth) / 2)
  $y = [int](($Size - $targetHeight) / 2)
  $graphics.DrawImage($mark, (New-Object System.Drawing.Rectangle($x, $y, $targetWidth, $targetHeight)))
  $graphics.Dispose()
  return $canvas
}

$sizes = @(32, 48, 180, 192, 512)
foreach ($size in $sizes) {
  $bitmap = New-IconBitmap -Size $size
  $path = Join-Path $outputDir "horalix-icon-$size.png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  Write-Output $path
}

# Multi-size .ico with PNG-compressed entries (supported by every current browser).
$icoSizes = @(16, 32, 48)
$pngBlobs = @()
foreach ($size in $icoSizes) {
  $bitmap = New-IconBitmap -Size $size
  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngBlobs += , $stream.ToArray()
  $stream.Dispose()
  $bitmap.Dispose()
}

$icoPath = Join-Path $projectRoot "public\favicon.ico"
$output = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($output)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$icoSizes.Count)
$offset = 6 + (16 * $icoSizes.Count)
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
  $writer.Write([byte]$icoSizes[$i])
  $writer.Write([byte]$icoSizes[$i])
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$pngBlobs[$i].Length)
  $writer.Write([uint32]$offset)
  $offset += $pngBlobs[$i].Length
}
foreach ($blob in $pngBlobs) { $writer.Write($blob) }
$writer.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $output.ToArray())
$writer.Dispose()
$output.Dispose()
$mark.Dispose()
Write-Output $icoPath
