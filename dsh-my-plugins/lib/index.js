/**
 * 「我的插件」基础插件 —— host 半部（纯 ESM）。
 *
 * 本插件只贡献浏览器侧 UI：在侧栏底部「设置」上方登记一个「我的插件」按钮，
 * 并声明 `my-plugins.section` 子 slot（其余插件把它们的设置页注册到那里）。
 * host 侧无需任何服务与逻辑，apply 留空即可。
 *
 * 设计取舍：本插件是「基础插件」，其余插件（技能 / 皮肤 / 数据库连接 / API 调用）
 * 检测 `my-plugins.section` 是否已声明来决定注册位置——安装了本插件就显示在
 * 「我的插件」大面板里，未安装则回退到设置页（settings.section）。
 */

function apply(_ctx) {
  // 纯 client 插件：host 半部无逻辑。
}

export { apply }
