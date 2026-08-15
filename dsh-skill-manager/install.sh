#!/usr/bin/env bash
# DSH 技能管理器 - 一键安装（macOS / Linux）
# 用法：chmod +x install.sh && ./install.sh
#
# 安装方式为「cordis.patch.yml insert」：复制插件到共享 node_modules，并在
# profile 的 cordis.patch.yml 登记一行（inject: [skills, webServer]）。DSH 正在
# 运行时会热加载该文件，刷新浏览器即可生效，通常无需重启进程。

set -euo pipefail

PLUGIN="dsh-skill-manager"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE="${DSH_PROFILE:-web}"

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$DSH_HOME/profiles/node_modules/$PLUGIN"
PATCH="$DSH_HOME/profiles/$PROFILE/cordis.patch.yml"

echo "== DSH 技能管理器 安装 =="
echo "DSH_HOME : $DSH_HOME"
echo "Profile  : $PROFILE"
echo ""

if [ ! -f "$PATCH" ]; then
  echo "error: not found: $PATCH - 请先运行一次 'dsh web'，或设置 DSH_PROFILE。" >&2
  exit 1
fi

# 1) 先复制插件文件（确保登记 cordis.patch.yml 触发热加载时文件已就位）。
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC/package.json" "$DEST/"
cp -R "$SRC/lib" "$DEST/"
echo "[1/2] copied plugin to $DEST"

# 2) 登记插件行，并从 cordis.patch.yml 移除旧的同 id 条目（幂等重装）。
PLUGIN="$PLUGIN" python3 - "$PATCH" <<'PYEOF'
import os, re, sys
p = sys.argv[1]
plugin = os.environ['PLUGIN']

def remove_entry(s, cid):
    lines = s.split('\n')
    out = []
    skipping = False
    id_pat = re.compile(r'^\s*- id:\s*' + re.escape(cid) + r'\s*$')
    for line in lines:
        if id_pat.match(line):
            skipping = True
            continue
        if skipping:
            if re.match(r'^\s*- id:', line) or re.match(r'^\S', line):
                skipping = False
            else:
                continue
        out.append(line)
    return '\n'.join(out)

s = open(p, encoding='utf-8').read()
s2 = remove_entry(s, plugin)
if s2 != s:
    print("[2/2] removed old row from cordis.patch.yml")
    s = s2
if plugin not in s:
    entry = f"- insert:\n    - id: {plugin}\n      name: {plugin}\n      inject: [skills, webServer]\n"
    if '[]' in s:
        s = s.replace('[]', entry.rstrip('\n'), 1)
    else:
        s = s.rstrip('\n') + '\n' + entry
    print(f"[2/2] registered row in {p}")
else:
    print(f"[2/2] already registered in {p}, skip.")
open(p, 'w', encoding='utf-8').write(s)
PYEOF

echo ""
echo "完成！生效方式："
echo "  - 若 dsh web 正在运行：DSH 会自动热加载 cordis.patch.yml，"
echo "    刷新浏览器（Ctrl+Shift+R）后打开「设置 -> 技能」即可。"
echo "  - 若未自动生效：重启 dsh web（Ctrl+C 停掉后再运行 dsh web）。"
echo ""
echo "卸载：删除 $DEST，并从 $PATCH 里移除其 insert 条目。"
echo "已配置的技能文件保存在 ~/.dsh/skills/，如需彻底清除可一并删除。"
