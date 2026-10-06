Add-Type -AssemblyName System.Drawing

# Generates the Open Graph images (1200x630) and the Apple touch icon (180x180).
# All user-facing text lives in og-content.json so this script stays ASCII-safe:
# Windows PowerShell reads .ps1 files as ANSI unless they carry a BOM, which would
# corrupt the Cyrillic strings.

$ErrorActionPreference = "Stop"

$Width = 1200
$Height = 630
$ScriptDir = $PSScriptRoot
$PublicDir = (Resolve-Path (Join-Path $ScriptDir "..\public")).Path
$ContentPath = Join-Path $ScriptDir "og-content.json"

# Brand palette taken from favicon.svg
$Violet = [System.Drawing.Color]::FromArgb(126, 20, 255)
$VioletDeep = [System.Drawing.Color]::FromArgb(91, 11, 196)
$Cyan = [System.Drawing.Color]::FromArgb(71, 191, 255)
$Ink = [System.Drawing.Color]::FromArgb(24, 18, 38)
$White = [System.Drawing.Color]::FromArgb(255, 255, 255)

function New-Font([string]$name, [float]$size, [System.Drawing.FontStyle]$style) {
    return New-Object System.Drawing.Font $name, $size, $style
}

# Picks the largest size that still fits the available width, so nothing is clipped.
function Fit-FontSize([System.Drawing.Graphics]$g, [string]$text, [float]$start, [string]$fontName, [System.Drawing.FontStyle]$style, [float]$maxWidth) {
    $size = $start
    while ($size -gt 18) {
        $font = New-Font $fontName $size $style
        $measured = $g.MeasureString($text, $font)
        $font.Dispose()
        if ($measured.Width -le $maxWidth) { break }
        $size -= 1
    }
    return $size
}

$entries = [System.IO.File]::ReadAllText($ContentPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

foreach ($property in $entries.PSObject.Properties) {
    $locale = $property.Name
    $content = $property.Value

    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient
    $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        (New-Object System.Drawing.Point 0, 0),
        (New-Object System.Drawing.Point $Width, $Height),
        $VioletDeep,
        $Ink
    )
    $g.FillRectangle($background, 0, 0, $Width, $Height)

    # Soft cyan glow, echoing the hero motif
    $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glowRect = New-Object System.Drawing.Rectangle 620, -220, 820, 720
    $glowPath.AddEllipse($glowRect)
    $glow = New-Object System.Drawing.Drawing2D.PathGradientBrush $glowPath
    $glow.CenterColor = [System.Drawing.Color]::FromArgb(90, 71, 191, 255)
    $glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 71, 191, 255))
    $g.FillEllipse($glow, $glowRect)

    # Time-flow grid
    $gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(38, 255, 255, 255)), 1
    for ($x = 0; $x -le $Width; $x += 60) { $g.DrawLine($gridPen, $x, 0, $x, $Height) }
    for ($y = 0; $y -le $Height; $y += 60) { $g.DrawLine($gridPen, 0, $y, $Width, $y) }

    # Drifting light columns
    $columnXs = @(96, 214, 352, 470, 604, 742, 880, 1012, 1128)
    $columnHeights = @(230, 400, 300, 470, 260, 430, 320, 380, 210)
    for ($i = 0; $i -lt $columnXs.Count; $i++) {
        $h = $columnHeights[$i]
        $x = $columnXs[$i]
        $columnBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
            (New-Object System.Drawing.Point $x, $Height),
            (New-Object System.Drawing.Point $x, ($Height - $h)),
            [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
            [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
        )
        $g.FillRectangle($columnBrush, (New-Object System.Drawing.Rectangle $x, ($Height - $h), 3, $h))
    }

    # Wordmark
    $wordmarkFont = New-Font "Segoe UI Semibold" 40 ([System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush $White
    $g.DrawString("3Talab", $wordmarkFont, $whiteBrush, (New-Object System.Drawing.PointF 96, 96))
    $wordmarkFont.Dispose()

    # Headline, each line auto-fitted to the available width
    $maxTextWidth = $Width - 192
    $headlineTop = 172.0
    $lineHeight = 74.0
    $lines = @(
        @{ text = $content.line1; brush = $whiteBrush },
        @{ text = $content.line2; brush = $whiteBrush },
        @{ text = $content.accent; brush = (New-Object System.Drawing.SolidBrush $Cyan) }
    )

    $index = 0
    foreach ($line in $lines) {
        $size = Fit-FontSize $g $line.text 62 "Segoe UI" ([System.Drawing.FontStyle]::Bold) $maxTextWidth
        $font = New-Font "Segoe UI" $size ([System.Drawing.FontStyle]::Bold)
        $g.DrawString($line.text, $font, $line.brush, (New-Object System.Drawing.PointF 92, ($headlineTop + $index * $lineHeight)))
        $font.Dispose()
        $index++
    }

    # Supporting line
    $subSize = Fit-FontSize $g $content.sub 29 "Segoe UI" ([System.Drawing.FontStyle]::Regular) $maxTextWidth
    $subFont = New-Font "Segoe UI" $subSize ([System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(226, 219, 235))
    $g.DrawString($content.sub, $subFont, $subBrush, (New-Object System.Drawing.PointF 96, ($headlineTop + 3 * $lineHeight + 14)))
    $subFont.Dispose()

    # CTA pill, sized to its label
    $ctaSize = Fit-FontSize $g $content.cta 29 "Segoe UI" ([System.Drawing.FontStyle]::Bold) ($maxTextWidth - 120)
    $ctaFont = New-Font "Segoe UI" $ctaSize ([System.Drawing.FontStyle]::Bold)
    $ctaBrush = New-Object System.Drawing.SolidBrush $Violet
    $ctaTextBounds = $g.MeasureString($content.cta, $ctaFont)
    $pillWidth = [float]$ctaTextBounds.Width + 64
    $pillRect = New-Object System.Drawing.Rectangle 92, 496, ([int]$pillWidth), 74
    $g.FillRectangle($ctaBrush, $pillRect)
    $g.DrawString($content.cta, $ctaFont, $whiteBrush, (New-Object System.Drawing.PointF 124, 514))
    $ctaFont.Dispose()

    $outPath = Join-Path $PublicDir $content.file
    $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bitmap.Dispose()
    Write-Output "Wrote $($content.file) ($locale)"
}

# Apple touch icon
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
$iconFont = New-Font "Segoe UI" 96 ([System.Drawing.FontStyle]::Bold)
$iconBrush = New-Object System.Drawing.SolidBrush $White
$iconGraphics.DrawString("3T", $iconFont, $iconBrush, (New-Object System.Drawing.PointF 26, 40))
$icon.Save((Join-Path $PublicDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$iconFont.Dispose()
$iconGraphics.Dispose()
$icon.Dispose()
Write-Output "Wrote apple-touch-icon.png"
