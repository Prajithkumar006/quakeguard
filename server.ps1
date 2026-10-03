# Lightweight PowerShell Static HTTP Web Server for QuakeGuard
param([int]$Port = 8080)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "QuakeGuard Web Server running at http://localhost:$Port/"

$rootPath = $PSScriptRoot

# Launch browser
Start-Process "http://localhost:$Port/index.html"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath)) { $localPath = "index.html" }

        $filePath = [System.IO.Path]::Combine($rootPath, $localPath)

        if ([System.IO.File]::Exists($filePath)) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length

            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".mjs"  { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".png"  { $response.ContentType = "image/png" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }

            # Allow CORS for module loading
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.Close()
    } catch {
        # Catch cancellation or exit
    }
}
