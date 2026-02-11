Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$packageJsonPath = Join-Path $root "package.json"

if (-not (Test-Path $packageJsonPath)) {
    throw "package.json not found at: $packageJsonPath"
}

$package = Get-Content -Raw $packageJsonPath | ConvertFrom-Json

if ($package.main -ne "main.js") {
    throw "Invalid package.json main entry. Expected 'main.js', got '$($package.main)'."
}

$requiredBuildFiles = @(
    "main.js",
    "preload.js",
    "server-manager.js",
    "server-runner.js",
    "tray-manager.js",
    "logger.js",
    "dist-ui/**/*"
)

$buildFiles = @()
if ($null -ne $package.build -and $null -ne $package.build.files) {
    $buildFiles = @($package.build.files)
}

foreach ($required in $requiredBuildFiles) {
    if ($buildFiles -notcontains $required) {
        throw "Missing required build.files entry: '$required'."
    }
}

$legacySrcMain = Join-Path $root "src/main"
if (Test-Path $legacySrcMain) {
    throw "Deprecated path exists: 'src/main'. Remove legacy duplicate main-process sources."
}

$legacyRenderer = Join-Path $root "renderer.js"
if (Test-Path $legacyRenderer) {
    throw "Deprecated file exists: 'renderer.js'. Remove legacy DOM renderer file."
}

Write-Host "Entrypoint verification passed."
