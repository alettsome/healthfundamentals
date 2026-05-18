param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$BackupRoot
)

$ErrorActionPreference = "Stop"

if (-not $BackupRoot) {
    $BackupRoot = Join-Path $ProjectRoot "Backups\Snapshots"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$snapshotPath = Join-Path $BackupRoot "$timestamp-full"

New-Item -ItemType Directory -Force -Path $snapshotPath | Out-Null

$robocopyArgs = @(
    $ProjectRoot
    $snapshotPath
    "/E"
    "/R:1"
    "/W:1"
    "/XD"
    "Backups"
    "node_modules"
    ".history"
    ".lh"
)

robocopy @robocopyArgs | Out-Null
$robocopyExitCode = $LASTEXITCODE

if ($robocopyExitCode -ge 8) {
    throw "Robocopy failed with exit code $robocopyExitCode."
}

$fileCount = (Get-ChildItem -LiteralPath $snapshotPath -Recurse -File | Measure-Object).Count
$manifestPath = Join-Path $snapshotPath "backup-manifest.txt"

@(
    "Backup created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "Project root: $ProjectRoot"
    "Snapshot path: $snapshotPath"
    "Robocopy exit code: $robocopyExitCode"
    "File count: $fileCount"
    "Excluded folders: Backups, node_modules, .history, .lh"
) | Set-Content -LiteralPath $manifestPath

[PSCustomObject]@{
    SnapshotPath = $snapshotPath
    ManifestPath = $manifestPath
    FileCount = $fileCount
    RobocopyExitCode = $robocopyExitCode
}
