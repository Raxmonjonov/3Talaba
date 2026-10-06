Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$Width = 1200
$Height = 630
$PublicDir = (Resolve-Path (Join-Path $PSScriptRoot "..\public")).Path

# Brand palette (from favicon.svg): violet 7e14ff, deep 5b0bc4, cyan 47bfff
$Violet = [System.Drawing.Color]::FromArgb(126, 20, 255)
$VioletDeep = [System.Drawing.Color]::FromArgb(91, 11, 196)
$Cyan = [System.Drawing.Color]::FromArgb(71, 191, 255)
$Ink = [System.Drawing.Color]::FromArgb(24, 18, 38)
$InkSoft = [System.Drawing.Color]::FromArgb(78, 66, 102)
$White = [System.Drawing.Color]::FromArgb(255, 255, 255)

$bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# --- Background: deep violet gradient -------------------------------------
$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point $Width, $Height),
    $VioletDeep,
    $Ink
)
$graphics.FillRectangle($background, 0, 0, $Width, $Height)

# --- Soft glow, echoing the hero motif ------------------------------------
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowRect = New-Object System.Drawing.Rectangle 620, -220, 820, 720
$glowPath.AddEllipse($glowRect)
$glow = New-Object System.Drawing.Drawing2D.PathGradientBrush $glowPath
$glow.CenterColor = [System.Drawing.Color]::FromArgb(90, 71, 191, 255)
$glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 71, 191, 255))
$graphics.FillEllipse($glow, $glowRect)

# --- Time-flow grid -------------------------------------------------------
$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(38, 255, 255, 255)), 1
for ($x = 0; $x -le $Width; $x += 60) {
    $graphics.DrawLine($gridPen, $x, 0, $x, $Height)
}
for ($y = 0; $y -le $Height; $y += 60) {
    $graphics.DrawLine($gridPen, 0, $y, $Width, $y)
}

# --- Drifting light columns ----------------------------------------------
$columnXs = @(96, 214, 352, 470, 604, 742, 880, 1012, 1128)
$columnHeights = @(230, 400, 300, 470, 260, 430, 320, 380, 210)
for ($i = 0; $i -lt $columnXs.Count; $i++) {
    $h = $columnHeights[$i]
    $rect = New-Object System.Drawing.Rectangle $columnXs[$i], ($Height - $h), 3, $h
    $columnBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        (New-Object System.Drawing.Point $columnXs[$i], $Height),
        (New-Object System.Drawing.Point $columnXs[$i], ($Height - $h)),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
    )
    $graphics.FillRectangle($columnBrush, $rect)
}

# --- Wordmark -------------------------------------------------------------
$wordmarkFont = New-Object System.Drawing.Font "Segoe UI Semibold", 40, ([System.Drawing.FontStyle]::Bold)
$wordmarkBrush = New-Object System.Drawing.SolidBrush $White
$graphics.DrawString("3Talab", $wordmarkFont, $wordmarkBrush, 96, 96)

# --- Headline -------------------------------------------------------------
$headlineFont = New-Object System.Drawing.Font "Segoe UI", 62, ([System.Drawing.FontStyle]::Bold)
$graphics.DrawString("Bir yil ichida", $headlineFont, $wordmarkBrush, 92, 176)
$graphics.DrawString("nufuzli oliygohga", $headlineFont, $wordmarkBrush, 92, 252)

$accentFont = New-Object System.Drawing.Font "Segoe UI", 62, ([System.Drawing.FontStyle]::Bold)
$accentBrush = New-Object System.Drawing.SolidBrush $Cyan
$graphics.DrawString("tayyor bo'ling", $accentFont, $accentBrush, 92, 328)

# --- Supporting line ------------------------------------------------------
$subFont = New-Object System.Drawing.Font "Segoe UI", 29
$subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(226, 219, 235))
$graphics.DrawString("Daraja testi  ·  Kunlik reja  ·  AI-ustoz", $subFont, $subBrush, 96, 430)

# --- CTA pill -------------------------------------------------------------
$ctaRect = New-Object System.Drawing.Rectangle 96, 492, 452, 74
$ctaBrush = New-Object System.Drawing.SolidBrush $Violet
$graphics.FillRectangle($ctaBrush, $ctaRect)
$ctaFont = New-Object System.Drawing.Font "Segoe UI", 29, ([System.Drawing.FontStyle]::Bold)
$ctaTextBrush = New-Object System.Drawing.SolidBrush $White
$graphics.DrawString("Bepul darajamni aniqlayman", $ctaFont, $ctaTextBrush, 126, 511)

# --- Save -----------------------------------------------------------------
$pngPath = Join-Path $PublicDir "og-image.png"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Apple touch icon: 180x180, violet tile with rounded feel via solid brand color
$icon = New-Object System.Drawing.Bitmap 180, 180
$iconGraphics = [System.Drawing.Graphics]::FromImage($icon)
$iconGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$iconGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$iconBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point 180, 180),
    $Violet,
    $VioletDeep
)
$iconGraphics.FillRectangle($iconBackground, 0, 0, 180, 180)
$iconFont = New-Object System.Drawing.Font "Segoe UI", 96, ([System.Drawing.FontStyle]::Bold)
$iconTextBrush = New-Object System.Drawing.SolidBrush $White
$iconGraphics.DrawString("3T", $iconFont, $iconTextBrush, 26, 40)
$icon.Save((Join-Path $PublicDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$iconGraphics.Dispose()
$icon.Dispose()

Write-Output "Wrote og-image.png and apple-touch-icon.png"
