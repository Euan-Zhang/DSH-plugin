# dsh-skill-manager

为 DeepSeek Harness 增加「技能管理」能力：在设置页左侧新增「技能」页，让你自定义
**Agent 可加载的技能（skill）**，配置后立即生效，并持久化到 `~/.dsh/skills/`。

## 功能

- 技能的增删改查（CRUD），自定义名称、描述、调用时机（whenToUse）；
- 启用 / 禁用（禁用即下线，且不会被其它技能通过 `@技能名` 引用）；
- 技能正文为 Markdown，直接注入模型 system prompt，可指引模型调用**任意可见插件工具**；
- 技能内嵌 **Python 脚本**（可多个、可配解释器命令），模型按需用 `pwsh` 执行；
- 技能间 **互相调用**：正文中用 `@技能名` 引用其它技能，加载时自动递归展开（循环防护、深度上限 6）；
- **能力引用**：引用接口工具（api-tools 等注册的 Agent 工具）/ 数据库表 / SQL 命令，
  渲染时展开成调用指引注入正文；
- 配置变更（保存 / 删除 / 启用切换）后自动热更新技能集，无需重启。

## 架构

- **host 半部**（`lib/index.js`）：扫描 `~/.dsh/skills/` 技能目录，把已启用技能经
  `ctx.skills.register` 注册成运行时 skill，并提供 `/api/dsh-skill-manager` HTTP API
  （list / save / remove / catalog）。技能同时落盘为标准 frontmatter Markdown 文件，
  即使本插件卸载，其它 skill provider（如 skill-filesystem）仍可发现。
- **client 半部**（`lib/client.js`）：注册 `settings.section`（id `dsh-skill-manager`），
  渲染技能管理 UI，经同源 `fetch` 调用 host API。
- 包同时声明 `dsh.bundle`（cordis.patch.yml insert）与 `dsh.client`（浏览器 roster 扫描）。

## 安装

> 推荐直接使用随附的一键安装脚本（复制到共享 node_modules 并登记 cordis.patch.yml，
> DSH 运行时会热加载，刷新浏览器即可生效，通常无需重启进程）。

### Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

### macOS / Linux

```bash
chmod +x install.sh && ./install.sh
```

### 手动安装

1. 将本插件目录复制到 `$DSH_HOME/profiles/node_modules/dsh-skill-manager`；
2. 在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 中登记：

```yaml
- insert:
    - id: dsh-skill-manager
      name: dsh-skill-manager
      inject: [skills, webServer]
```

3. 重启 `dsh web`（或依赖 DSH 的热加载），刷新浏览器后打开「设置 → 技能」。

## 卸载

删除 `$DSH_HOME/profiles/node_modules/dsh-skill-manager`，并从
`$DSH_HOME/profiles/<profile>/cordis.patch.yml` 移除其 insert 条目。

> 已配置的技能文件保存在 `~/.dsh/skills/`，卸载插件不会自动删除它们；如需彻底清除，
> 请一并删除该目录下由本插件创建的技能文件。

## 使用示例

- 新建技能 `code-review`，正文写「先按 @code-style 检查风格，再执行 @run-tests」——
  加载时会自动带上另外两个技能的完整指令。
- 给技能添加一个 Python 脚本（如数据清洗），模型执行该技能时可用 `pwsh` 运行它。
- 给技能添加「能力引用」：选一个接口工具（如 `api_tool_xxx`），模型调用该技能时
  就会按接口说明发起真实请求。
