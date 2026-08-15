/**
 * 数据库连接插件 —— host 半部。
 *
 * 提供：
 * 1. 连接列表的持久化（settings namespace `database-connections`，密码走
 *    role('secret')，不会被 wire 层的 describe 泄露）。
 * 2. /api/database-connections 前缀 HTTP API，供 client 端设置页调用：
 *    list / save / delete / test / databases / tables / query。
 * 3. 真实的 MySQL（mysql2）与 ClickHouse（@clickhouse/client）连接、探活与
 *    只读查询。
 *
 * 只读约束：query 仅放行 SELECT / SHOW / DESCRIBE / EXPLAIN / WITH 开头的语句，
 * 结果截断到 200 行，避免误执行写操作或拉取巨量数据。
 * @module @deepseek-ai/dsh-database-connections
 */
import { Context } from '@deepseek-ai/cordis';
/** 支持的数据库类型。 */
export type DatabaseKind = 'mysql' | 'clickhouse';
/** 一条数据库连接（持久化形态）。 */
export interface DatabaseConnection {
    id: string;
    /** 用户自定义的连接名称。 */
    name: string;
    type: DatabaseKind;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}
/** 返回给 client 的连接视图（不含密码）。 */
export interface DatabaseConnectionView {
    id: string;
    name: string;
    type: DatabaseKind;
    host: string;
    port: number;
    username: string;
    database: string;
    /** 该连接是否保存过密码（编辑时留空表示保留原密码）。 */
    hasPassword: boolean;
}
/** settings 持久化的完整配置节。 */
export interface Config {
    connections: DatabaseConnection[];
}
/**
 * 注册 host 半部：settings 持久化 + HTTP API。依赖 settings 与 webServer，
 * 两者都由 web profile 提供。
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map