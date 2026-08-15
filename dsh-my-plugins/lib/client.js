window.__ModuleLoader__.load({
  id: "dsh-my-plugins",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react = require("react");
    const {
      createElement: h,
      useState,
      useEffect,
      useRef,
      useSyncExternalStore,
      Fragment
    } = react;

    const inject = ["slots"];

    // 「我的插件」面板消费的子 slot：其余插件把它们的设置页注册到这里。
    // 未安装本插件时，其余插件会回退到 settings.section（见各自 client.js）。
    const SECTION = "my-plugins.section";

    // -------------------------------------------------------------------------
    // 样式（内联；颜色走 DSW 主题令牌，与设置面板一致）
    // -------------------------------------------------------------------------

    const S = {
      // 侧栏底部按钮：尽量对齐设置按钮的紧凑节奏（wide 34px 行 / rail 36px 圆）。
      layer: { position: "relative", display: "flex", flexDirection: "column" },
      trigger: {
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        height: 34,
        margin: "4px 0",
        padding: "6px 2px 6px 10px",
        boxSizing: "border-box",
        border: "none",
        borderRadius: 12,
        background: "transparent",
        cursor: "pointer",
        overflow: "hidden",
        color: "var(--dsw-alias-label-primary)",
        fontFamily: "inherit",
        fontSize: 14,
        lineHeight: "22px",
      },
      triggerHover: { background: "var(--dsw-alias-interactive-bg-hover)" },
      triggerRail: {
        width: 36,
        height: 36,
        margin: "8px 0 10px",
        justifyContent: "center",
        gap: 0,
        padding: 0,
        borderRadius: "50%",
      },
      triggerLabel: { overflow: "hidden", whiteSpace: "nowrap" },

      // 全视口遮罩层。
      overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      mask: {
        position: "absolute",
        inset: 0,
        background: "var(--dsw-alias-bg-mask-1)",
        backdropFilter: "var(--dsw-mask-blur)",
      },

      // 面板：默认约 80% 视口，右下角可拖拽调整。
      panel: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "calc(100vh - 24px)",
        minWidth: 360,
        minHeight: 240,
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--dsw-alias-bg-layer-2)",
        boxShadow: "var(--dsw-shadow-lv3)",
        "--dsh-scrollbar-thumb": "var(--dsw-alias-scrollbar-bg-l2)",
        "--dsh-scrollbar-thumb-hover": "var(--dsw-alias-scrollbar-hover-l2)",
      },

      // 左侧导航。
      nav: {
        flex: "none",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: 188,
        padding: "22px 12px 0",
        boxSizing: "border-box",
      },
      navTitle: {
        padding: "0 12px",
        fontSize: 16,
        lineHeight: "24px",
        fontWeight: 500,
        color: "var(--dsw-alias-label-primary)",
      },
      navList: { display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" },
      navCell: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        padding: "9px 16px 9px 12px",
        boxSizing: "border-box",
        border: "none",
        borderRadius: 12,
        background: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        lineHeight: "22px",
        fontWeight: 400,
        color: "var(--dsw-alias-label-primary)",
        textAlign: "left",
      },
      navCellHover: { background: "var(--dsw-specific-sidebar-nav-item-hover)" },
      navCellActive: { background: "var(--dsw-specific-sidebar-nav-item-active)" },
      navLabel: { flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },

      // 右侧内容列。
      content: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" },
      header: {
        flex: "none",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
        height: 54,
        padding: "20px 14px 8px 10px",
        boxSizing: "border-box",
      },
      close: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        padding: 0,
        border: "none",
        borderRadius: 28,
        background: "transparent",
        cursor: "pointer",
        color: "var(--dsw-alias-label-primary)",
      },
      options: { flex: 1, minHeight: 0, padding: "0 24px 24px", overflowY: "auto" },
      empty: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--dsw-alias-label-secondary, #57606a)",
        fontSize: 13,
      },

      // 右下角拖拽手柄。
      resizeHandle: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 20,
        height: 20,
        cursor: "se-resize",
        zIndex: 2,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "0 3px 3px 0",
        boxSizing: "border-box",
        color: "var(--dsw-alias-label-tertiary, #8b949e)",
      },
    };

    // -------------------------------------------------------------------------
    // 图标（内联 SVG，不依赖图标库）
    // -------------------------------------------------------------------------

    function PlugIcon({ size }) {
      return h("svg", {
        width: size, height: size, viewBox: "0 0 16 16",
        fill: "none", stroke: "currentColor", strokeWidth: 1.5,
        "aria-hidden": "true",
      },
        h("rect", { x: 2, y: 2, width: 5.5, height: 5.5, rx: 1.5 }),
        h("rect", { x: 8.5, y: 2, width: 5.5, height: 5.5, rx: 1.5 }),
        h("rect", { x: 2, y: 8.5, width: 5.5, height: 5.5, rx: 1.5 }),
        h("rect", { x: 8.5, y: 8.5, width: 5.5, height: 5.5, rx: 1.5 }),
      );
    }

    function CloseIcon({ size }) {
      return h("svg", {
        width: size, height: size, viewBox: "0 0 16 16",
        fill: "none", stroke: "currentColor", strokeWidth: 1.5,
        "aria-hidden": "true",
      },
        h("path", { d: "M4 4 L12 12 M12 4 L4 12", strokeLinecap: "round" }),
      );
    }

    // -------------------------------------------------------------------------
    // 导航投影：把 my-plugins.section 的 ledger 投影成有序导航行（uSES 源）。
    // -------------------------------------------------------------------------

    function makeSectionsStore(slots) {
      let version = -1;
      let rows = [];
      const getSnapshot = () => {
        const v = slots.getVersion(SECTION);
        if (v !== version) {
          version = v;
          rows = slots.entries(SECTION)
            .map((e) => {
              const label = e.options.label;
              const resolved = typeof label === "function" ? label() : label;
              return {
                id: e.options.id ?? "",
                order: e.options.order ?? 0,
                label: resolved ?? e.options.id ?? "",
              };
            })
            .sort((a, b) => a.order - b.order);
        }
        return rows;
      };
      const subscribe = (cb) => slots.subscribe(SECTION, cb);
      return { getSnapshot, subscribe };
    }

    // -------------------------------------------------------------------------
    // 面板组件
    // -------------------------------------------------------------------------

    function MyPluginsPanel(props) {
      const { wide, renderSlot, sectionsStore } = props;
      const [open, setOpen] = useState(false);
      const [activeId, setActiveId] = useState(undefined);
      const [hover, setHover] = useState(false);
      const [navHover, setNavHover] = useState({});
      const [box, setBox] = useState({ w: 0, h: 0 });
      const dragRef = useRef(null);

      const sections = useSyncExternalStore(
        sectionsStore.subscribe,
        sectionsStore.getSnapshot,
        sectionsStore.getSnapshot,
      );

      // 首次打开时确定默认尺寸：约 80% 视口。
      useEffect(() => {
        if (!open) return;
        if (box.w === 0 || box.h === 0) {
          setBox({
            w: Math.round(window.innerWidth * 0.8),
            h: Math.round(window.innerHeight * 0.8),
          });
        }
      }, [open]);

      // 拖拽调整大小。
      useEffect(() => {
        if (!open) return;
        const onMove = (e) => {
          const d = dragRef.current;
          if (!d) return;
          const w = Math.max(360, Math.min(window.innerWidth - 24, d.w0 + e.clientX - d.x0));
          const hgt = Math.max(240, Math.min(window.innerHeight - 24, d.h0 + e.clientY - d.y0));
          setBox({ w, h: hgt });
        };
        const onUp = () => { dragRef.current = null; };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        };
      }, [open]);

      const beginResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = {
          x0: e.clientX,
          y0: e.clientY,
          w0: box.w || Math.round(window.innerWidth * 0.8),
          h0: box.h || Math.round(window.innerHeight * 0.8),
        };
      };

      // Escape 关闭。
      useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [open]);

      const close = () => { setOpen(false); setActiveId(undefined); };

      // 选中的 section：activeId 失效时回退到第一个。
      const active = (sections.find((s) => s.id === activeId) || sections[0])?.id;

      const w = box.w || Math.round(window.innerWidth * 0.8);
      const hgt = box.h || Math.round(window.innerHeight * 0.8);

      return h("div", { style: S.layer },
        h("button", {
          type: "button",
          style: {
            ...S.trigger,
            ...(wide ? {} : S.triggerRail),
            ...(hover ? S.triggerHover : {}),
          },
          "aria-haspopup": "dialog",
          "aria-expanded": open,
          "aria-label": "我的插件",
          onClick: () => setOpen((v) => !v),
          onMouseEnter: () => setHover(true),
          onMouseLeave: () => setHover(false),
        },
          h(PlugIcon, { size: wide ? 16 : 18 }),
          wide ? h("span", { style: S.triggerLabel }, "我的插件") : null,
        ),
        open ? h("div", { style: S.overlay, role: "presentation" },
          h("div", { style: S.mask, "aria-hidden": "true", onClick: close }),
          h("div", {
            role: "dialog",
            "aria-modal": "true",
            "aria-label": "我的插件",
            style: { ...S.panel, width: w, height: hgt },
          },
            h("nav", { style: S.nav },
              h("div", { style: S.navTitle }, "我的插件"),
              h("div", { style: S.navList },
                sections.length === 0
                  ? h("div", { style: { padding: "0 12px", fontSize: 13, color: "var(--dsw-alias-label-secondary, #57606a)" } }, "暂无插件")
                  : sections.map((row) => h("button", {
                    key: row.id,
                    type: "button",
                    style: {
                      ...S.navCell,
                      ...(row.id === active ? S.navCellActive : {}),
                      ...(row.id !== active && navHover[row.id] ? S.navCellHover : {}),
                    },
                    "aria-current": row.id === active ? "true" : undefined,
                    onClick: () => setActiveId(row.id),
                    onMouseEnter: () => setNavHover((m) => ({ ...m, [row.id]: true })),
                    onMouseLeave: () => setNavHover((m) => ({ ...m, [row.id]: false })),
                  }, h("span", { style: S.navLabel }, row.label))),
              ),
            ),
            h("div", { style: S.content },
              h("div", { style: S.header },
                h("div", { style: { flex: 1 } }),
                h("button", { type: "button", style: S.close, "aria-label": "关闭", onClick: close },
                  h(CloseIcon, { size: 14 }),
                ),
              ),
              h("div", { style: S.options },
                active !== undefined
                  ? renderSlot(SECTION, { close }, { only: active })
                  : h("div", { style: S.empty }, "安装插件后，它们的设置页会出现在这里。"),
              ),
            ),
            h("div", {
              style: S.resizeHandle,
              title: "拖拽调整大小",
              onMouseDown: beginResize,
            },
              h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": "true" },
                h("path", { d: "M10 2 L2 10 M10 6 L6 10 M10 10 L10 10", strokeLinecap: "round" }),
              ),
            ),
          ),
        ) : null,
      );
    }

    // -------------------------------------------------------------------------
    // 注册
    // -------------------------------------------------------------------------

    function apply(ctx) {
      const sectionsStore = makeSectionsStore(ctx.slots);

      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "my-plugins",
        order: -100,
        children: { [SECTION]: { kind: "list", scope: "root" } },
      }, (props) => h(MyPluginsPanel, { ...props, sectionsStore })));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
