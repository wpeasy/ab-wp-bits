# WordPress Plugin ZIP Creator
# Creates a production-ready ZIP file with UNIX/Linux-compatible forward-slash paths

# Get plugin directory name and version
$pluginDir = Split-Path -Leaf $PSScriptRoot
$mainFile = Get-ChildItem -Path $PSScriptRoot -Filter "*.php" | Where-Object { $_.Name -eq "$pluginDir.php" } | Select-Object -First 1

if (-not $mainFile) {
    Write-Error "Main plugin file not found: $pluginDir.php"
    exit 1
}

# Extract version from main plugin file
$content = Get-Content $mainFile.FullName -Raw
if ($content -match 'Version:\s*([^\s]+)') {
    $version = $matches[1]
} else {
    Write-Error "Could not find version in $($mainFile.Name)"
    exit 1
}

# Create plugin subfolder
$outputDir = Join-Path $PSScriptRoot "plugin"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Remove old ZIP files
Get-ChildItem -Path $outputDir -Filter "*.zip" | Remove-Item -Force

# ZIP file name
$zipName = "$pluginDir-$version.zip"
$zipPath = Join-Path $outputDir $zipName

Write-Host "Creating ZIP: $zipName" -ForegroundColor Cyan

# Temporary directory for staging
$tempDir = Join-Path $env:TEMP "wp-plugin-zip-$([Guid]::NewGuid().ToString())"
$pluginTempDir = Join-Path $tempDir $pluginDir
New-Item -ItemType Directory -Path $pluginTempDir -Force | Out-Null

# Files and folders to exclude (patterns)
$excludePatterns = @(
    '*.md',
    'node_modules',
    'admin\svelte\src',
    'admin\svelte\node_modules',
    'admin\svelte\package.json',
    'admin\svelte\package-lock.json',
    'admin\svelte\tsconfig.json',
    'admin\svelte\vite*.config.ts',
    'admin\svelte\svelte.config.js',
    '.git',
    '.gitignore',
    'plugin',
    'create-plugin-zip.ps1',
    '.claude'
)

# Copy files recursively, excluding patterns
function Copy-ExcludingPatterns {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [string[]]$Exclude
    )

    Get-ChildItem -Path $SourcePath -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourcePath.Length + 1)

        # Check if path matches any exclude pattern
        $shouldExclude = $false
        foreach ($pattern in $Exclude) {
            if ($relativePath -like "$pattern*") {
                $shouldExclude = $true
                break
            }
        }

        if (-not $shouldExclude) {
            $destItemPath = Join-Path $DestPath $relativePath

            if ($_.PSIsContainer) {
                if (-not (Test-Path $destItemPath)) {
                    New-Item -ItemType Directory -Path $destItemPath -Force | Out-Null
                }
            } else {
                $destItemDir = Split-Path $destItemPath -Parent
                if (-not (Test-Path $destItemDir)) {
                    New-Item -ItemType Directory -Path $destItemDir -Force | Out-Null
                }
                Copy-Item $_.FullName -Destination $destItemPath -Force
            }
        }
    }
}

# Copy files to temp directory
Copy-ExcludingPatterns -SourcePath $PSScriptRoot -DestPath $pluginTempDir -Exclude $excludePatterns

# Create ZIP using Compress-Archive
Compress-Archive -Path $pluginTempDir -DestinationPath $zipPath -CompressionLevel Optimal -Force

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "[SUCCESS] ZIP created successfully: plugin\$zipName" -ForegroundColor Green
Write-Host "Location: $zipPath" -ForegroundColor Gray
