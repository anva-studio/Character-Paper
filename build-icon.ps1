Add-Type -AssemblyName System.Drawing
$iconDir = Join-Path $PSScriptRoot 'build'
New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
$bitmap = New-Object Drawing.Bitmap 256,256
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.ScaleTransform(5.333333,5.333333)
$round = New-Object Drawing.Drawing2D.GraphicsPath
$round.AddArc(0,0,24,24,180,90)
$round.AddArc(24,0,24,24,270,90)
$round.AddArc(24,24,24,24,0,90)
$round.AddArc(0,24,24,24,90,90)
$round.CloseFigure()
$ink = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#29465b'))
$fold = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#b9c8c8'))
$graphics.FillPath($ink,$round)
$graphics.FillPolygon([Drawing.Brushes]::White,[Drawing.PointF[]]@([Drawing.PointF]::new(14,9),[Drawing.PointF]::new(28,9),[Drawing.PointF]::new(36,17),[Drawing.PointF]::new(36,39),[Drawing.PointF]::new(14,39)))
$graphics.FillPolygon($fold,[Drawing.PointF[]]@([Drawing.PointF]::new(28,9),[Drawing.PointF]::new(28,18),[Drawing.PointF]::new(36,18)))
$graphics.FillPolygon($ink,[Drawing.PointF[]]@([Drawing.PointF]::new(19,9),[Drawing.PointF]::new(24,9),[Drawing.PointF]::new(24,26),[Drawing.PointF]::new(21.5,24),[Drawing.PointF]::new(19,26)))
$pngPath = Join-Path $iconDir 'icon.png'
$bitmap.Save($pngPath,[Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bitmap.Dispose(); $ink.Dispose(); $fold.Dispose(); $round.Dispose()
$pngBytes = [IO.File]::ReadAllBytes($pngPath)
$stream = [IO.File]::Create((Join-Path $iconDir 'icon.ico'))
$writer = New-Object IO.BinaryWriter $stream
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]1)
$writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0)
$writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$pngBytes.Length); $writer.Write([uint32]22); $writer.Write($pngBytes)
$writer.Dispose()
