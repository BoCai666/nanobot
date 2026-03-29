#Requires -Version 7.0
<#
.SYNOPSIS
    Build script for nanobot API sidecar executable using PyInstaller.

.DESCRIPTION
    This script builds a standalone executable for the nanobot API server
    that can be used as a Tauri sidecar. The output executable is named
    according to Tauri's sidecar naming convention.

.PARAMETER OutputDir
    Output directory for the built executable. Defaults to "dist".

.PARAMETER TauriBinDir
    Target directory for Tauri sidecar binaries. If specified, the built
    executable will be copied there with the platform-specific name.

.PARAMETER SkipClean
    Skip cleaning the dist directory before building.

.PARAMETER Verbose
    Enable verbose output.

.EXAMPLE
    .\scripts\build-sidecar.ps1

.EXAMPLE
    .\scripts\build-sidecar.ps1 -TauriBinDir "desktop/src-tauri/binaries"

.NOTES
    Requirements:
    - Python 3.11+
    - PyInstaller: pip install pyinstaller
    - UPX (optional, for compression): https://upx.github.io/

    Platform-specific output names for Tauri:
    - Windows:    nanobot-sidecar-x86_64-pc-windows-msvc.exe
    - macOS ARM:  nanobot-sidecar-aarch64-apple-darwin
    - macOS Intel: nanobot-sidecar-x86_64-apple-darwin
    - Linux:      nanobot-sidecar-x86_64-unknown-linux-gnu
#>

param(
    [string]$OutputDir = "dist",
    [string]$TauriBinDir = "",
    [switch]$SkipClean = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# 颜色输出辅助函数
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-WarningMsg { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-ErrorMsg { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# 获取平台特定的 sidecar 名称
function Get-SidecarName {
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLower()
    
    if ($IsWindows) {
        $targetArch = if ($arch -eq "x64") { "x86_64" } elseif ($arch -eq "arm64") { "aarch64" } else { $arch }
        return "nanobot-sidecar-$targetArch-pc-windows-msvc.exe"
    } elseif ($IsMacOS) {
        $targetArch = if ($arch -eq "x64") { "x86_64" } elseif ($arch -eq "arm64") { "aarch64" } else { $arch }
        return "nanobot-sidecar-$targetArch-apple-darwin"
    } elseif ($IsLinux) {
        $targetArch = if ($arch -eq "x64") { "x86_64" } elseif ($arch -eq "arm64") { "aarch64" } else { $arch }
        return "nanobot-sidecar-$targetArch-unknown-linux-gnu"
    } else {
        throw "Unsupported platform: $([System.Runtime.InteropServices.RuntimeInformation]::OSDescription)"
    }
}

# 检查 Python 环境
function Test-PythonEnvironment {
    Write-Info "Checking Python environment..."
    
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Python not found. Please install Python 3.11+ and add it to PATH."
    }
    Write-Success "Python version: $pythonVersion"
    
    # 检查 PyInstaller
    $pyinstaller = pip show pyinstaller 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-WarningMsg "PyInstaller not found. Installing..."
        pip install pyinstaller
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install PyInstaller."
        }
    }
    Write-Success "PyInstaller is available"
    
    # 检查项目依赖
    Write-Info "Checking project dependencies..."
    pip install -e . --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install project dependencies."
    }
    Write-Success "Project dependencies installed"
}

# 主构建流程
function Build-Sidecar {
    $scriptDir = $PSScriptRoot
    $projectRoot = Split-Path $scriptDir -Parent
    $specFile = Join-Path $projectRoot "nanobot-sidecar.spec"
    $distPath = Join-Path $projectRoot $OutputDir
    
    Push-Location $projectRoot
    try {
        # 检查环境
        Test-PythonEnvironment
        
        # 清理旧的构建文件
        if (-not $SkipClean) {
            Write-Info "Cleaning previous build artifacts..."
            if (Test-Path $distPath) {
                Remove-Item -Recurse -Force $distPath
            }
            $buildPath = Join-Path $projectRoot "build"
            if (Test-Path $buildPath) {
                Remove-Item -Recurse -Force $buildPath
            }
            Write-Success "Build artifacts cleaned"
        }
        
        # 检查 spec 文件
        if (-not (Test-Path $specFile)) {
            throw "Spec file not found: $specFile"
        }
        
        # 运行 PyInstaller
        Write-Info "Running PyInstaller..."
        $pyinstallerArgs = @(
            $specFile,
            "--noconfirm"
        )
        if ($Verbose) {
            $pyinstallerArgs += "--log-level=DEBUG"
        }
        
        & pyinstaller @pyinstallerArgs
        if ($LASTEXITCODE -ne 0) {
            throw "PyInstaller build failed with exit code $LASTEXITCODE"
        }
        
        # 获取生成的可执行文件名
        $originalExeName = if ($IsWindows) { "nanobot-sidecar.exe" } else { "nanobot-sidecar" }
        $originalExePath = Join-Path $distPath $originalExeName
        
        if (-not (Test-Path $originalExePath)) {
            throw "Built executable not found: $originalExePath"
        }
        
        # 重命名为平台特定名称
        $sidecarName = Get-SidecarName
        $finalExePath = Join-Path $distPath $sidecarName
        
        Write-Info "Renaming executable to $sidecarName..."
        if (Test-Path $finalExePath) {
            Remove-Item -Force $finalExePath
        }
        Move-Item -Path $originalExePath -Destination $finalExePath
        Write-Success "Executable renamed: $finalExePath"
        
        # 复制到 Tauri binaries 目录（如果指定）
        if ($TauriBinDir) {
            $tauriBinPath = Join-Path $projectRoot $TauriBinDir
            if (-not (Test-Path $tauriBinPath)) {
                New-Item -ItemType Directory -Force -Path $tauriBinPath | Out-Null
            }
            
            $targetPath = Join-Path $tauriBinPath $sidecarName
            Copy-Item -Path $finalExePath -Destination $targetPath -Force
            Write-Success "Copied to Tauri binaries: $targetPath"
        }
        
        # 显示文件大小
        $fileInfo = Get-Item $finalExePath
        $sizeInMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Success "Build complete! Size: ${sizeInMB} MB"
        Write-Success "Output: $finalExePath"
        
        return $finalExePath
    }
    finally {
        Pop-Location
    }
}

# 运行构建
try {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  nanobot Sidecar Builder" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $result = Build-Sidecar
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Build Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    exit 0
}
catch {
    Write-ErrorMsg $_.Exception.Message
    Write-ErrorMsg "Build failed!"
    exit 1
}
