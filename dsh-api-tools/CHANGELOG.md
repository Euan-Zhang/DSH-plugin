# 变更记录（Changelog）

## 1.0.0 —— 2026-08-15

### 首次发布

- 设置页新增「API 调用」管理页：API 工具增删改查、参数定义（位置 / 类型 / 值来源 /
  必填 / 中文说明）、草稿测试、启用开关。
- 支持「手动配置」与「粘贴 cURL」两种接入方式：cURL 自动解析方法、接口地址、
  Bearer 认证与 Body JSON，并把 Body 字段转成参数后填充到可编辑表单。
- 每个「已启用」的第三方 API 配置注册成一个独立 Agent 工具，支持数据查询与控制指令下发。
- 密钥只保存引用名（环境变量名样式），经 DSH `credentials` 服务按次解析，不进普通配置、
  Agent 上下文或调用轨迹。

### 本版修复

- 「草稿测试」接口 `/test` 改用 `result` 字段包裹 HTTP 层结果，避免与 API 层 `ok` 字段
  冲突。否则 HTTP 请求失败（如第三方返回 4xx/5xx）会被 client 端 `api()` 误判为「接口
  调用失败」，从而抛异常、无法把真实状态码与响应体展示给用户。
- 修复编辑已保存工具时 `fixed` / `credential` / `default` 来源参数的 `value` 丢失：
  `toView` 不再清空非 agent 来源参数的值，保证「列表 → 编辑 → 保存」往返不丢数据。

### 安装实测（2026-08-15，Windows + DSH web profile）

- 需使用 DSH 声明的包管理器 **pnpm@11.7.0（store v11）与 Node 22+**。PATH 中较旧的
  pnpm（store v10）会报 `ERR_PNPM_UNEXPECTED_STORE Unexpected store location`。
  可用 Node 22 直接运行 corepack 的 pnpm 11 完成安装：

  ```bash
  node "<Node22路径>" "<corepack>/pnpm/11.7.0/dist/pnpm.mjs" add "<tgz绝对路径>"
  ```

- 安装需写入 DSH profile 目录（`$DSH_HOME/profiles/web`）与 pnpm store
  （`AppData\Local\pnpm\store`），均在工作区之外；若运行环境启用了文件沙箱，需先授予
  相应写权限，否则报 `EPERM: operation not permitted`。
- 若某个已安装插件的 `file:` 依赖路径与锁文件记录不一致（例如 tgz 被移动到子目录），
  `pnpm add` 重新解析依赖树时会报 `ENOENT`；需先把该 tgz 复制回锁文件记录的路径，再执行
  安装。
- `dsh plugin add` 等价于「`pnpm add <tgz>` + 把包名写入 `dsh.profile.bundles`」。若手动
  用 pnpm 安装，需自行完成第二步：把包名追加到 web profile `package.json` 的
  `dsh.profile.bundles` 列表。
