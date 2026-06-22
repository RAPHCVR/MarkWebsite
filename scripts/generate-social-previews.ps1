Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$images = Join-Path $root "public/images"

function New-Brush([string] $hex) {
  return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen([string] $hex, [float] $width = 1) {
  return [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($hex), $width)
}

function Add-RoundedRectanglePath([System.Drawing.RectangleF] $rect, [float] $radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $arc = [System.Drawing.RectangleF]::new($rect.X, $rect.Y, $diameter, $diameter)
  $path.AddArc($arc, 180, 90)
  $arc.X = $rect.Right - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $rect.Bottom - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $rect.X
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRectangle(
  [System.Drawing.Graphics] $graphics,
  [System.Drawing.Brush] $brush,
  [float] $x,
  [float] $y,
  [float] $width,
  [float] $height,
  [float] $radius
) {
  $path = Add-RoundedRectanglePath ([System.Drawing.RectangleF]::new($x, $y, $width, $height)) $radius
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRectangle(
  [System.Drawing.Graphics] $graphics,
  [System.Drawing.Pen] $pen,
  [float] $x,
  [float] $y,
  [float] $width,
  [float] $height,
  [float] $radius
) {
  $path = Add-RoundedRectanglePath ([System.Drawing.RectangleF]::new($x, $y, $width, $height)) $radius
  $graphics.DrawPath($pen, $path)
  $path.Dispose()
}

function Draw-CoverImage(
  [System.Drawing.Graphics] $graphics,
  [System.Drawing.Image] $image,
  [float] $x,
  [float] $y,
  [float] $width,
  [float] $height,
  [float] $radius
) {
  $path = Add-RoundedRectanglePath ([System.Drawing.RectangleF]::new($x, $y, $width, $height)) $radius
  $state = $graphics.Save()
  $graphics.SetClip($path)

  $scale = [Math]::Max($width / $image.Width, $height / $image.Height)
  $drawWidth = $image.Width * $scale
  $drawHeight = $image.Height * $scale
  $drawX = $x + (($width - $drawWidth) / 2)
  $drawY = $y + (($height - $drawHeight) / 2)
  $graphics.DrawImage($image, $drawX, $drawY, $drawWidth, $drawHeight)

  $graphics.Restore($state)
  $path.Dispose()
}

function Set-Quality([System.Drawing.Bitmap] $bitmap, [string] $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-Canvas {
  $bitmap = [System.Drawing.Bitmap]::new(1200, 630)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, 1200, 630),
    [System.Drawing.ColorTranslator]::FromHtml("#fff7f9"),
    [System.Drawing.ColorTranslator]::FromHtml("#ffd4de"),
    35
  )
  $graphics.FillRectangle($background, 0, 0, 1200, 630)
  $background.Dispose()

  $graphics.FillEllipse((New-Brush "#ffe0e8"), -120, -100, 440, 320)
  $graphics.FillEllipse((New-Brush "#ffbfd1"), 940, 360, 360, 300)
  $graphics.FillEllipse((New-Brush "#ffffff"), 760, -120, 300, 220)

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-TitleFont([float] $size) {
  return [System.Drawing.Font]::new("Georgia", $size, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-BodyFont([float] $size, [System.Drawing.FontStyle] $style = [System.Drawing.FontStyle]::Regular) {
  return [System.Drawing.Font]::new("Segoe UI", $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Badge([System.Drawing.Graphics] $graphics, [string] $text, [float] $x, [float] $y, [float] $w) {
  Fill-RoundedRectangle $graphics (New-Brush "#ffffff") $x $y $w 42 21
  Draw-RoundedRectangle $graphics (New-Pen "#ffc9d6" 2) $x $y $w 42 21
  $graphics.DrawString($text, (New-BodyFont 17 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#be185d"), $x + 20, $y + 9)
}

function Draw-LinkPill(
  [System.Drawing.Graphics] $graphics,
  [string] $label,
  [string] $meta,
  [float] $x,
  [float] $y,
  [string] $accent,
  [float] $width = 382,
  [float] $height = 58
) {
  $radius = $height / 2
  Fill-RoundedRectangle $graphics (New-Brush "#ffffff") $x $y $width $height $radius
  Draw-RoundedRectangle $graphics (New-Pen "#ffd0db" 2) $x $y $width $height $radius
  $dotSize = [Math]::Min(38, $height - 18)
  $dotX = $x + 13
  $dotY = $y + (($height - $dotSize) / 2)
  $graphics.FillEllipse((New-Brush "#fff1f5"), $dotX, $dotY, $dotSize, $dotSize)
  $graphics.FillEllipse((New-Brush $accent), $dotX + (($dotSize - 12) / 2), $dotY + (($dotSize - 12) / 2), 12, 12)
  $graphics.DrawString($label, (New-BodyFont 21 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#4a102f"), $x + 64, $y + 8)
  $graphics.DrawString($meta, (New-BodyFont 14 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#9f6378"), $x + 64, $y + 32)
}

$logo = [System.Drawing.Image]::FromFile((Join-Path $images "marky-icon-512.png"))

try {
  $homeCanvas = New-Canvas
  $g = $homeCanvas.Graphics
  Fill-RoundedRectangle $g (New-Brush "#fff8fa") 70 58 1060 514 44
  Draw-RoundedRectangle $g (New-Pen "#ffc9d6" 3) 70 58 1060 514 44

  Draw-Badge $g "OFFICIAL CREATOR PLATFORM" 112 116 310
  $g.DrawString("Marky", (New-TitleFont 92), (New-Brush "#ec4899"), 108, 176)
  $g.DrawString("Your Kitten Master", (New-TitleFont 52), (New-Brush "#2d1022"), 112, 270)
  $g.DrawString("@markshnaknaks", (New-BodyFont 29 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#9f315d"), 116, 346)
  $g.DrawString("Digital access passes, official social links,`nprivate delivery and collabs.", (New-BodyFont 29 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#774157"), 116, 398)
  Fill-RoundedRectangle $g (New-Brush "#ec4899") 116 492 294 52 26
  $g.DrawString("markshnaknaks.com", (New-BodyFont 22 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#ffffff"), 143, 506)

  Fill-RoundedRectangle $g (New-Brush "#ffffff") 704 100 342 284 58
  Draw-RoundedRectangle $g (New-Pen "#ffd0db" 3) 704 100 342 284 58
  Draw-CoverImage $g $logo 760 130 230 230 46
  Draw-LinkPill $g "Instagram / TikTok" "official updates" 685 414 "#ec4899" 380 54
  Draw-LinkPill $g "Telegram Concierge" "support and access" 685 482 "#26a5e4" 380 54

  Set-Quality $homeCanvas.Bitmap (Join-Path $images "marky-home-og.png")
  $g.Dispose()
  $homeCanvas.Bitmap.Dispose()

  $linksCanvas = New-Canvas
  $g = $linksCanvas.Graphics
  Fill-RoundedRectangle $g (New-Brush "#ffffff") 70 54 1060 522 44
  Draw-RoundedRectangle $g (New-Pen "#ffc9d6" 3) 70 54 1060 522 44

  Fill-RoundedRectangle $g (New-Brush "#fff8fa") 104 92 432 442 38
  Draw-RoundedRectangle $g (New-Pen "#ffd0db" 3) 104 92 432 442 38
  Draw-CoverImage $g $logo 250 125 140 140 32
  $g.DrawString("Marky", (New-TitleFont 58), (New-Brush "#ec4899"), 240, 286)
  $g.DrawString("@markshnaknaks", (New-BodyFont 24 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#7f4058"), 222, 350)
  Draw-LinkPill $g "Instagram" "@markshnaknaks" 129 408 "#ec4899"
  Draw-LinkPill $g "Telegram" "t.me/markreyvakh" 129 478 "#26a5e4"

  Draw-Badge $g "LINK-IN-BIO HUB" 600 122 224
  $g.DrawString("Official links", (New-TitleFont 70), (New-Brush "#2d1022"), 596, 190)
  $g.DrawString("Socials, Telegram support`nand digital access passes.", (New-BodyFont 34 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#774157"), 602, 286)
  Fill-RoundedRectangle $g (New-Brush "#ec4899") 604 400 318 58 29
  $g.DrawString("Open the hub", (New-BodyFont 24 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#ffffff"), 656, 416)
  Fill-RoundedRectangle $g (New-Brush "#fff1f5") 604 480 378 54 27
  Draw-RoundedRectangle $g (New-Pen "#ffd0db" 2) 604 480 378 54 27
  $g.DrawString("markshnaknaks.com/links", (New-BodyFont 21 ([System.Drawing.FontStyle]::Bold)), (New-Brush "#be185d"), 636, 495)

  Set-Quality $linksCanvas.Bitmap (Join-Path $images "marky-links-og.png")
  $g.Dispose()
  $linksCanvas.Bitmap.Dispose()
}
finally {
  $logo.Dispose()
}
