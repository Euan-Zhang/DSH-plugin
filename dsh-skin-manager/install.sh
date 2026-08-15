#!/usr/bin/env bash
# DSH 皮肤管理器 - 一键安装（macOS / Linux）
# 用法：chmod +x install.sh && ./install.sh
#
# 安装方式为「cordis.patch.yml insert」：复制插件到共享 node_modules，并在
# profile 的 cordis.patch.yml 登记一行（inject: webServer）。DSH 正在运行时会
# 热加载该文件，刷新浏览器即可生效，通常无需重启进程。

set -euo pipefail

PLUGIN="dsh-skin-manager"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE="${DSH_SKIN_PROFILE:-web}"
# 旧的「常驻覆盖」式皮肤插件，会与皮肤管理器的切换叠加冲突，安装时一并清除。
CONFLICTS="dsh-skin-deepseek dsh-skin-wukong"

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$DSH_HOME/profiles/node_modules/$PLUGIN"
PATCH="$DSH_HOME/profiles/$PROFILE/cordis.patch.yml"

echo "== DSH 皮肤管理器 安装 =="
echo "DSH_HOME : $DSH_HOME"
echo "Profile  : $PROFILE"
echo ""

if [ ! -f "$PATCH" ]; then
  echo "error: not found: $PATCH - 请先运行一次 'dsh web'，或设置 DSH_SKIN_PROFILE。" >&2
  exit 1
fi

# 0) 清理旧冲突插件目录（cordis.patch.yml 条目在下面统一处理）。
for c in $CONFLICTS; do
  if [ -d "$DSH_HOME/profiles/node_modules/$c" ]; then
    rm -rf "$DSH_HOME/profiles/node_modules/$c"
    echo "[0/3] removed old plugin dir: $c"
  fi
done

# 1) 先复制插件文件（确保登记 cordis.patch.yml 触发热加载时文件已就位）。
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC/package.json" "$DEST/"
cp -R "$SRC/lib" "$DEST/"
cp -R "$SRC/assets" "$DEST/"
echo "[1/3] copied plugin to $DEST"

# 2) 登记插件行，并从 cordis.patch.yml 移除旧冲突插件的 insert 子条目。
PLUGIN="$PLUGIN" python3 - "$PATCH" <<'PYEOF'
import os, re, sys
p = sys.argv[1]
plugin = os.environ['PLUGIN']

def remove_entry(s, cid):
    # 删除「- id: <cid>」行及其后更深缩进的子字段行，逐行处理避免误删相邻条目。
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
for c in ['dsh-skin-deepseek', 'dsh-skin-wukong']:
    s2 = remove_entry(s, c)
    if s2 != s:
        print(f"[2/3] removed '{c}' row from cordis.patch.yml")
        s = s2
if plugin not in s:
    entry = f"- insert:\n    - id: {plugin}\n      name: {plugin}\n      inject: [webServer]\n"
    if '[]' in s:
        s = s.replace('[]', entry.rstrip('\n'), 1)
    else:
        s = s.rstrip('\n') + '\n' + entry
    print(f"[2/3] registered row in {p}")
else:
    print(f"[2/3] already registered in {p}, skip.")
open(p, 'w', encoding='utf-8').write(s)
PYEOF

echo ""
echo "完成！生效方式："
echo "  - 若 dsh web 正在运行：DSH 会自动热加载 cordis.patch.yml，"
echo "    刷新浏览器（Ctrl+Shift+R）后打开「设置 -> 皮肤」即可。"
echo "  - 若未自动生效：重启 dsh web（Ctrl+C 停掉后再运行 dsh web）。"
echo ""
echo "卸载：删除 $DEST，并从 $PATCH 里移除其 insert 条目。"
echo "已导入的皮肤数据保存在 profiles/skins/，如需彻底清除可一并删除。"
