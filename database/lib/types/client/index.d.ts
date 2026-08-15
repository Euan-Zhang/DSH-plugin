/**
 * 数据库连接插件 —— client 半部。
 *
 * 在设置页注册一个 "数据库连接" 导航项（settings.section），页面提供：
 * 连接列表、新建/编辑/删除、测试连接、浏览数据库/表、只读查询。
 * 通过 fetch 调用 host 半部的 /api/database-connections HTTP API。
 * @module @deepseek-ai/dsh-database-connections/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** 依赖的 client 服务。 */
export declare const inject: string[];
/** 注册设置页的"数据库连接"导航项。 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map