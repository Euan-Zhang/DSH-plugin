# DSH 技能管理器 - 一键安装（Windows）
# 用法：右键此文件 -> 使用 PowerShell 运行
#   或：powershell -ExecutionPolicy Bypass -File .\install.ps1
#
# 安装方式为「cordis.patch.yml insert」：复制插件到共享 node_modules，并在
# profile 的 cordis.patch.yml 登记一行（inject: [skills, webServer]）。DSH 正在
# 运行时会热加载该文件，刷新浏览器即可生效，通常无需重启进程。

$ErrorActionPreference = 'Stop'

$PLUGIN   = 'dsh-skill-manager'
$DSH_HOME = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
$PROFILE  = if ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { 'web' }

$SRC   = Split-Path -Parent $MyInvocation.MyCommand.Path
$DEST  = Join-Path $DSH_HOME "profiles\node_modules\$PLUGIN"
$PATCH = Join-Path $DSH_HOME "profiles\$PROFILE\cordis.patch.yml"

# 从 patch 文本里移除某个 insert 子条目：删除「- id: <id>」行及其后更深缩进的子字段行。
function Remove-InsertEntry {
  param([string]$Text, [string]$Id)
  $lines = $Text -split "`n"
  $out = New-Object System.Collections.Generic.List[string]
  $skipping = $false
  $idPattern = '^\s*- id:\s*' + [regex]::Escape($Id) + '\s*$'
  foreach ($line in $lines) {
    $t = $line.TrimEnd("`r")
    if ($t -match $idPattern) {
      $skipping = $true
      continue
    }
    if ($skipping) {
      if ($t -match '^\s*- id:' -or $t -match '^\S') {
        $skipping = $false
      } else {
        continue
      }
    }
    $out.Add($t)
  }
  return ($out -join "`n")
}

Write-Host '== DSH 技能管理器 安装 =='
Write-Host "DSH_HOME : $DSH_HOME"
Write-Host "Profile  : $PROFILE"
Write-Host ''

if (-not (Test-Path $PATCH)) {
  Write-Error "not found: $PATCH - 请先运行一次 'dsh web'，或设置 DSH_PROFILE。"
}

# 1) 复制插件文件（确保登记 cordis.patch.yml 触发热加载时文件已就位）。
if (Test-Path $DEST) { Remove-Item $DEST -Recurse -Force }
New-Item -ItemType Directory -Force -Path $DEST | Out-Null
Copy-Item (Join-Path $SRC 'package.json') $DEST -Force
Copy-Item (Join-Path $SRC 'lib')         $DEST -Recurse -Force
Write-Host "[1/2] copied plugin to $DEST"

# 2) 在 cordis.patch.yml 登记插件行。
$content = Get-Content $PATCH -Raw
$changed = $false
$content = Remove-InsertEntry $content $PLUGIN
if ($content -ne (Get-Content $PATCH -Raw)) { $changed = $true }

if ($content -notmatch [regex]::Escape($PLUGIN)) {
  $entry = "- insert:`n    - id: $PLUGIN`n      name: $PLUGIN`n      inject: [skills, webServer]`n"
  if ($content -match '\[\]') {
    $content = $content.Replace('[]', $entry.TrimEnd())
  } else {
    $content = $content.TrimEnd() + "`n" + $entry
  }
  $changed = $true
  Write-Host "[2/2] registered row in $PATCH"
} else {
  Write-Host "[2/2] already registered in $PATCH, skip."
}

if ($changed) {
  Set-Content -Path $PATCH -Value $content -Encoding UTF8
}

Write-Host ''
Write-Host '完成！生效方式：'
Write-Host '  - 若 dsh web 正在运行：DSH 会自动热加载 cordis.patch.yml，'
Write-Host '    刷新浏览器（Ctrl+Shift+R）后打开「设置 -> 技能」即可。'
Write-Host '  - 若未自动生效：重启 dsh web（Ctrl+C 停掉后再运行 dsh web）。'
Write-Host ''
Write-Host "卸载：删除 $DEST，并从 $PATCH 里移除其 insert 条目。"
Write-Host '已配置的技能文件保存在 ~/.dsh/skills/，如需彻底清除可一并删除。'
