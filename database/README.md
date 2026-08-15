# @deepseek-ai/dsh-database-connections

为 DeepSeek Harness 增加数据库连接管理能力：在设置页左侧新增「数据库连接」页，
支持 MySQL / ClickHouse 连接的增删改查、连接测试、以及只读数据查询。

## 功能

- 连接信息增删改查（CRUD），自定义连接名称；
- MySQL（mysql2）与 ClickHouse（@clickhouse/client）真实连接与探活；
- 测试连接通断（ClickHouse 走 `SELECT` 校验账号密码，MySQL 走 `ping`）；
- 浏览数据库 / 表，执行只读查询（`SELECT / SHOW / DESCRIBE / EXPLAIN / WITH`，结果上限 200 行）；
- 连接持久化到 DSH settings（`database-connections` 命名空间），密码以 `role('secret')` 标记、接口自动脱敏。

## 架构

- **host 半部**（`src/index.ts` → `lib/index.js`）：settings 持久化 +
  `/api/database-connections` HTTP API（list / save / delete / test / databases / tables / query）。
- **client 半部**（`src/client/*` → `lib/client.js`）：注册 `settings.section`（id
  `database-connections`），渲染连接管理 UI，经 `fetch` 调用 host API。
- 包同时声明 `dsh.bundle`（供 `dsh plugin add` 安装）与 `dsh.client`（供浏览器 roster 扫描）。

## 安装

```bash
dsh plugin --profile web add ./deepseek-ai-dsh-database-connections-1.0.0.tgz
# 然后重启 dsh web
```

详见随包分发的安装说明。

## 开发与构建

```bash
# 依赖（mysql2 / @clickhouse/client 已在 package.json）
pnpm --filter @deepseek-ai/dsh-database-connections install

# 类型 + 打包（node-half + client bundle）
pnpm exec tsc -b packages/database/database-connections/tsconfig.json
pnpm --filter @deepseek-ai/dsh-database-connections run bundle

# 打包为可分发 tarball
pnpm --dir packages/database/database-connections pack --pack-destination <输出目录>
```

## 卸载

```bash
dsh plugin --profile web remove @deepseek-ai/dsh-database-connections
```
