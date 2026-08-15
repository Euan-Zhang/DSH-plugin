window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-api-tools",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let react = require("react");
    const {
      createElement: h,
      useState,
      useEffect,
      useCallback,
      Fragment
    } = react;

    // 依赖的 client 服务。
    const inject = ["slots"];

    // ---------- 常量 ----------
    const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const AUTH_TYPES = [
      { value: "none", label: "无需认证" },
      { value: "api-key", label: "API Key（接口密钥）" },
      { value: "bearer", label: "Bearer Token（持有者令牌）" },
      { value: "basic", label: "Basic Auth（基础认证）" }
    ];
    const LOCATIONS = [
      { value: "path", label: "Path（路径）" },
      { value: "query", label: "Query（查询）" },
      { value: "header", label: "Header（请求头）" },
      { value: "body", label: "Body（请求体）" }
    ];
    const TYPES = [
      { value: "string", label: "字符串" },
      { value: "number", label: "数字" },
      { value: "boolean", label: "布尔值" },
      { value: "object", label: "对象" },
      { value: "array", label: "数组" }
    ];
    const SOURCES = [
      { value: "agent", label: "Agent 输入" },
      { value: "fixed", label: "固定值" },
      { value: "credential", label: "凭据引用" },
      { value: "default", label: "默认值" }
    ];

    function emptyDraft() {
      return {
        id: "",
        name: "",
        toolId: "",
        purpose: "",
        method: "GET",
        url: "",
        auth: "none",
        credential: "",
        enabled: false,
        params: []
      };
    }

    function emptyParam() {
      return {
        name: "",
        location: "query",
        type: "string",
        source: "agent",
        required: false,
        description: "",
        value: ""
      };
    }

    function slugifyName(name) {
      const ascii = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      return ascii || `api_tool_${Date.now().toString(36)}`;
    }

    /** 调 host API。 */
    async function api(path, body) {
      const init = {
        method: body === undefined ? "GET" : "POST",
        headers: { "Content-Type": "application/json" }
      };
      if (body !== undefined) init.body = JSON.stringify(body);
      let res;
      try {
        res = await fetch(`/api/api-tools${path}`, init);
      } catch {
        throw new Error("无法连接到 DSH 后端服务");
      }
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error(`后端返回了非 JSON 响应（HTTP ${String(res.status)}）`);
      }
      if (json && typeof json === "object" && json.ok === false) throw new Error(json.error ?? "请求失败");
      return json;
    }

    // ---------- 样式 ----------
    const styles = {
      root: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "16px 20px",
        maxWidth: 1080,
        fontFamily: "inherit",
        color: "var(--color-text, #1f2328)"
      },
      title: { fontSize: 16, fontWeight: 600, margin: 0 },
      muted: { color: "var(--color-text-muted, #57606a)", fontSize: 12, lineHeight: 1.6 },
      card: {
        border: "1px solid var(--color-border, #d0d7de)",
        borderRadius: 8,
        background: "var(--color-bg-raised, #ffffff)",
        padding: 14
      },
      row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
      spacer: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
      field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10, minWidth: 0 },
      label: { fontSize: 12, color: "var(--color-text-muted, #57606a)" },
      input: {
        padding: "6px 8px",
        borderRadius: 6,
        border: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg, #ffffff)",
        color: "inherit",
        fontSize: 13,
        boxSizing: "border-box",
        width: "100%"
      },
      select: {
        padding: "6px 8px",
        borderRadius: 6,
        border: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg, #ffffff)",
        color: "inherit",
        fontSize: 13
      },
      textarea: {
        padding: "6px 8px",
        borderRadius: 6,
        border: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg, #ffffff)",
        color: "inherit",
        fontSize: 12,
        fontFamily: "monospace",
        boxSizing: "border-box",
        width: "100%",
        resize: "vertical",
        lineHeight: 1.5
      },
      button: {
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg-raised, #ffffff)",
        color: "inherit",
        cursor: "pointer",
        fontSize: 13
      },
      primary: { background: "var(--color-accent, #0969da)", borderColor: "var(--color-accent, #0969da)", color: "#ffffff" },
      danger: { background: "var(--color-danger, #d1242f)", borderColor: "var(--color-danger, #d1242f)", color: "#ffffff" },
      subtle: { background: "transparent", color: "var(--color-text-muted, #57606a)" },
      summary: { display: "flex", gap: 10, flexWrap: "wrap" },
      summaryItem: {
        flex: "1 1 140px",
        border: "1px solid var(--color-border, #d0d7de)",
        borderRadius: 8,
        padding: "10px 12px",
        background: "var(--color-bg-muted, #f6f8fa)"
      },
      summaryNum: { fontSize: 20, fontWeight: 600, display: "block", marginTop: 2 },
      apiList: { display: "flex", flexDirection: "column", gap: 8 },
      apiCard: {
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        border: "1px solid var(--color-border, #d0d7de)",
        borderRadius: 8,
        padding: "12px 14px",
        cursor: "pointer",
        background: "var(--color-bg-raised, #ffffff)",
        flexWrap: "wrap"
      },
      apiTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
      methodBadge: {
        display: "inline-flex",
        border: "1px solid var(--color-accent, #0969da)",
        color: "var(--color-accent, #0969da)",
        borderRadius: 4,
        padding: "1px 6px",
        fontSize: 11,
        fontWeight: 700
      },
      badge: { display: "inline-flex", borderRadius: 999, padding: "3px 8px", fontSize: 11, whiteSpace: "nowrap" },
      badgeEnabled: { color: "var(--color-success, #1a7f37)", background: "rgba(26,127,55,.12)" },
      badgeDraft: { color: "var(--color-text-muted, #57606a)", background: "rgba(87,96,106,.12)" },
      tableWrap: { overflowX: "auto", border: "1px solid var(--color-border, #d0d7de)", borderRadius: 6 },
      table: { borderCollapse: "collapse", width: "100%", minWidth: 860, fontSize: 12 },
      th: {
        textAlign: "left",
        padding: "6px 8px",
        borderBottom: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg-muted, #f6f8fa)"
      },
      td: { padding: "5px 8px", borderBottom: "1px solid var(--color-border-muted, #eaeef2)", verticalAlign: "middle" },
      tableInput: { width: "100%", padding: "4px 6px", borderRadius: 5, border: "1px solid var(--color-border, #d0d7de)", background: "var(--color-bg, #ffffff)", color: "inherit", fontSize: 12, boxSizing: "border-box" },
      tableSelect: { width: "100%", padding: "4px 6px", borderRadius: 5, border: "1px solid var(--color-border, #d0d7de)", background: "var(--color-bg, #ffffff)", color: "inherit", fontSize: 12 },
      code: {
        fontFamily: "monospace",
        fontSize: 12,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        background: "var(--color-bg-muted, #f6f8fa)",
        border: "1px solid var(--color-border, #d0d7de)",
        borderRadius: 6,
        padding: 10,
        maxHeight: 280,
        overflow: "auto",
        margin: 0
      },
      msg: { fontSize: 13, whiteSpace: "pre-wrap" },
      ok: { color: "var(--color-success, #1a7f37)" },
      error: { color: "var(--color-danger, #d1242f)" },
      grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
      gridUrl: { display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: 12 },
      gridAuth: { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 12 },
      sectionTitle: { fontSize: 14, fontWeight: 600, margin: "0 0 6px" },
      empty: {
        border: "1px dashed var(--color-border, #d0d7de)",
        borderRadius: 8,
        padding: "36px 16px",
        textAlign: "center",
        color: "var(--color-text-muted, #57606a)"
      },
      switch: {
        width: 40,
        height: 22,
        borderRadius: 999,
        position: "relative",
        border: "1px solid var(--color-border, #d0d7de)",
        background: "var(--color-bg-muted, #f6f8fa)",
        cursor: "pointer",
        appearance: "none",
        flexShrink: 0
      },
      switchOn: { background: "var(--color-accent, #0969da)", borderColor: "var(--color-accent, #0969da)" }
    };

    // ---------- 组件 ----------

    /** 顶部概览。 */
    function Summary({ tools }) {
      const total = tools.length;
      const enabled = tools.filter((t) => t.enabled).length;
      const attention = total - enabled;
      return h("div", { style: styles.summary }, [
        h("div", { key: "t", style: styles.summaryItem }, h("span", { style: styles.muted }, "已接入"), h("strong", { style: styles.summaryNum }, String(total))),
        h("div", { key: "e", style: styles.summaryItem }, h("span", { style: styles.muted }, "已启用给 Agent"), h("strong", { style: styles.summaryNum }, String(enabled))),
        h("div", { key: "a", style: styles.summaryItem }, h("span", { style: styles.muted }, "需处理"), h("strong", { style: styles.summaryNum }, String(attention)))
      ]);
    }

    /** API 工具列表视图。 */
    function ListView({ tools, onOpen, onNew }) {
      const [search, setSearch] = useState("");
      const [filter, setFilter] = useState("all");
      const keyword = search.trim().toLowerCase();
      const filtered = tools.filter((t) => {
        const matchFilter = filter === "all" || (filter === "enabled" ? t.enabled : !t.enabled);
        const hay = `${t.name} ${t.purpose} ${t.url} ${t.toolId}`.toLowerCase();
        return matchFilter && hay.includes(keyword);
      });

      return h(Fragment, null, [
        h(Summary, { key: "summary", tools }),
        h("div", { key: "toolbar", style: { ...styles.row, marginBottom: 4 } }, [
          h("div", { style: { flex: 1, minWidth: 220 } }, h("input", {
            style: styles.input,
            placeholder: "按名称、用途或接口地址搜索",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          })),
          h("button", {
            style: { ...styles.button, ...(filter === "all" ? styles.primary : {}) },
            onClick: () => setFilter("all")
          }, "全部"),
          h("button", {
            style: { ...styles.button, ...(filter === "enabled" ? styles.primary : {}) },
            onClick: () => setFilter("enabled")
          }, "已启用"),
          h("button", {
            style: { ...styles.button, ...(filter === "draft" ? styles.primary : {}) },
            onClick: () => setFilter("draft")
          }, "草稿")
        ]),
        filtered.length === 0
          ? h("div", { key: "empty", style: styles.empty }, "没有符合条件的 API 工具，可以新建一个。")
          : h("div", { key: "list", style: styles.apiList },
              filtered.map((t) => h("article", {
                key: t.id,
                style: styles.apiCard,
                onClick: () => onOpen(t.id)
              }, [
                h("div", { key: "info", style: { minWidth: 200 } }, [
                  h("h3", { style: styles.apiTitle }, t.name),
                  h("div", { style: { ...styles.row, gap: 6, marginTop: 6 } }, [
                    h("span", { style: styles.methodBadge }, t.method),
                    h("span", { style: styles.muted }, t.url),
                    h("span", { style: styles.muted }, `· ${t.params.length} 个参数`)
                  ])
                ]),
                h("div", { key: "right", style: styles.row }, [
                  h("span", { style: { ...styles.badge, ...(t.enabled ? styles.badgeEnabled : styles.badgeDraft) } }, t.enabled ? "已启用" : "草稿"),
                  h("span", { style: styles.button }, "编辑")
                ])
              ]))
            )
      ]);
    }

    /** 参数表格编辑。 */
    function ParamsTable({ params, onChange }) {
      const setParam = (index, patch) => {
        const next = params.map((p, i) => (i === index ? { ...p, ...patch } : p));
        onChange(next);
      };
      const removeParam = (index) => onChange(params.filter((_p, i) => i !== index));
      const addParam = () => onChange([...params, emptyParam()]);

      return h("div", null, [
        h("div", { style: { ...styles.row, justifyContent: "space-between", marginBottom: 8 } }, [
          h("span", { style: styles.sectionTitle }, "参数定义"),
          h("button", { type: "button", style: styles.button, onClick: addParam }, "添加参数")
        ]),
        params.length === 0
          ? h("div", { style: styles.muted }, "暂无参数。GET 查询通常添加 Query 参数，路径变量使用 Path，POST 提交内容使用 Body。")
          : h("div", { style: styles.tableWrap },
              h("table", { style: styles.table }, [
                h("thead", null, h("tr", null, ["参数名称", "位置", "类型", "值来源", "必填", "中文说明", "值", "操作"].map((x) => h("th", { key: x, style: styles.th }, x)))),
                h("tbody", null, params.map((p, index) => h("tr", { key: index }, [
                  h("td", { style: styles.td }, h("input", { style: styles.tableInput, value: p.name, onChange: (e) => setParam(index, { name: e.target.value }), placeholder: "city" })),
                  h("td", { style: styles.td }, h("select", { style: styles.tableSelect, value: p.location, onChange: (e) => setParam(index, { location: e.target.value }) },
                    LOCATIONS.map((o) => h("option", { key: o.value, value: o.value }, o.label)))),
                  h("td", { style: styles.td }, h("select", { style: styles.tableSelect, value: p.type, onChange: (e) => setParam(index, { type: e.target.value }) },
                    TYPES.map((o) => h("option", { key: o.value, value: o.value }, o.label)))),
                  h("td", { style: styles.td }, h("select", { style: styles.tableSelect, value: p.source, onChange: (e) => setParam(index, { source: e.target.value }) },
                    SOURCES.map((o) => h("option", { key: o.value, value: o.value }, o.label)))),
                  h("td", { style: styles.td }, h("input", { type: "checkbox", checked: p.required, onChange: (e) => setParam(index, { required: e.target.checked }) })),
                  h("td", { style: styles.td }, h("input", { style: styles.tableInput, value: p.description, onChange: (e) => setParam(index, { description: e.target.value }), placeholder: "城市名称" })),
                  h("td", { style: styles.td },
                    p.source === "agent"
                      ? h("span", { style: styles.muted }, "—")
                      : h("input", { style: styles.tableInput, value: p.value, onChange: (e) => setParam(index, { value: e.target.value }), placeholder: p.source === "credential" ? "凭据引用名" : "值" })),
                  h("td", { style: styles.td }, h("button", { type: "button", style: styles.button, onClick: () => removeParam(index) }, "删除"))
                ])))
              ])
            )
      ]);
    }

    /** 编辑器视图。 */
    function EditorView({ draft, isNew, onDraftChange, onBack, onSaved }) {
      const [testInput, setTestInput] = useState(() => buildSample(draft));
      const [testResult, setTestResult] = useState(null);
      const [testPassed, setTestPassed] = useState(false);
      const [busy, setBusy] = useState(false);
      const [message, setMessage] = useState(null);
      const [credentialStatus, setCredentialStatus] = useState(null);
      const [mode, setMode] = useState("manual");
      const [curlInput, setCurlInput] = useState("curl -X POST 'https://api.example.com/v1/orders' -H 'Authorization: Bearer demo-token' -H 'Content-Type: application/json' -d '{\"name\":\"测试工单\",\"priority\":\"normal\"}'");

      const setField = useCallback((patch) => onDraftChange({ ...draft, ...patch }), [draft, onDraftChange]);
      const setParams = useCallback((params) => onDraftChange({ ...draft, params }), [draft, onDraftChange]);

      const needsCredential = draft.auth !== "none";

      // 凭据引用变化时查询其配置状态。
      useEffect(() => {
        let cancelled = false;
        setCredentialStatus(null);
        if (!needsCredential || !draft.credential) return;
        api("/credential", { name: draft.credential })
          .then((r) => { if (!cancelled) setCredentialStatus(r); })
          .catch(() => { if (!cancelled) setCredentialStatus({ configured: false }); });
        return () => { cancelled = true; };
      }, [draft.auth, draft.credential, needsCredential]);

      const validate = useCallback(() => {
        const errors = [];
        if (!draft.name.trim()) errors.push("请填写工具名称");
        if (!draft.purpose.trim()) errors.push("请填写「何时调用」");
        try {
          const u = new URL(draft.url.trim());
          if (u.protocol !== "http:" && u.protocol !== "https:") errors.push("接口地址仅支持 HTTP 或 HTTPS");
        } catch {
          errors.push("请填写合法的接口地址");
        }
        if (needsCredential && !draft.credential.trim()) errors.push("请填写凭据引用");
        if (draft.params.some((p) => !p.name.trim())) errors.push("参数名称不能为空");
        return errors;
      }, [draft, needsCredential]);

      const runTest = useCallback(async () => {
        const errors = validate();
        if (errors.length) { setMessage({ kind: "error", text: errors[0] }); return; }
        let args;
        try { args = JSON.parse(testInput || "{}"); }
        catch { setMessage({ kind: "error", text: "输入参数不是合法 JSON" }); return; }
        setBusy(true);
        setMessage(null);
        try {
          const data = await api("/test", { tool: draft, args });
          const result = data.result ?? data;
          setTestResult(result);
          setTestPassed(result.ok === true);
          setMessage(result.ok === true
            ? { kind: "ok", text: `测试通过 · ${result.ms ?? "?"} 毫秒` }
            : { kind: "error", text: `测试失败 · HTTP ${result.status ?? "?"}` });
        } catch (e) {
          setTestResult({ ok: false, error: e && e.message ? e.message : String(e) });
          setTestPassed(false);
          setMessage({ kind: "error", text: e && e.message ? e.message : String(e) });
        } finally {
          setBusy(false);
        }
      }, [draft, testInput, validate]);

      const save = useCallback(async (enable) => {
        const errors = validate();
        if (errors.length) { setMessage({ kind: "error", text: errors[0] }); return; }
        if (enable && !testPassed) { setMessage({ kind: "error", text: "请先使用当前草稿完成测试" }); return; }
        setBusy(true);
        try {
          const data = await api("/save", { tool: { ...draft, enabled: enable, id: draft.id } });
          onSaved(data.tools ?? [], enable);
        } catch (e) {
          setMessage({ kind: "error", text: e && e.message ? e.message : String(e) });
        } finally {
          setBusy(false);
        }
      }, [draft, testPassed, validate, onSaved]);

      const handleParseCurl = useCallback(() => {
        const parsed = parseCurlCommand(curlInput);
        if (parsed.error) { setMessage({ kind: "error", text: parsed.error }); return; }
        const next = {
          ...draft,
          method: parsed.method,
          url: parsed.url,
          auth: parsed.auth,
          credential: parsed.credential,
          ...(parsed.params.length > 0 ? { params: parsed.params } : {})
        };
        if (!next.name.trim()) next.name = "新建接口工具";
        if (!next.purpose.trim()) next.purpose = "请补充：用户提出什么需求时调用该工具。";
        onDraftChange(next);
        setTestInput(buildSample(next));
        setTestResult(null);
        setTestPassed(false);
        setMode("manual");
        setMessage({
          kind: "ok",
          text: parsed.bodyJsonWarning ? "cURL 已解析（Body 非 JSON，请手动检查参数）" : "cURL 已解析，请检查参数和凭据引用"
        });
      }, [curlInput, draft, onDraftChange]);

      return h("div", null, [
        h("div", { style: { ...styles.row, marginBottom: 10 } }, [
          h("button", { type: "button", style: styles.button, onClick: onBack }, "返回列表"),
          h("h3", { style: { ...styles.title, margin: 0 } }, isNew ? "新建 API 工具" : `编辑：${draft.name}`)
        ]),

        // 快速接入
        h("div", { style: styles.card }, [
          h("h3", { style: styles.sectionTitle }, "快速接入"),
          h("div", { style: { ...styles.row, gap: 8, marginBottom: 10 } }, [
            h("button", { type: "button", style: { ...styles.button, ...(mode === "manual" ? styles.primary : {}) }, onClick: () => setMode("manual") }, "手动配置"),
            h("button", { type: "button", style: { ...styles.button, ...(mode === "curl" ? styles.primary : {}) }, onClick: () => setMode("curl") }, "粘贴 cURL")
          ]),
          mode === "curl" && h("div", { style: { marginBottom: 10 } }, [
            h("label", { style: styles.label }, "cURL（命令行网络请求）"),
            h("textarea", { style: { ...styles.textarea, minHeight: 84 }, value: curlInput, onChange: (e) => setCurlInput(e.target.value), spellCheck: false }),
            h("div", { style: { ...styles.row, justifyContent: "flex-end", marginTop: 8 } }, [
              h("button", { type: "button", style: { ...styles.button, ...styles.primary }, onClick: handleParseCurl }, "解析并填充")
            ])
          ]),
          h("div", { style: styles.grid2 }, [
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "工具名称"),
              h("input", { style: styles.input, value: draft.name, placeholder: "例如：查询当前天气", onChange: (e) => setField({ name: e.target.value }) })
            ]),
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "系统工具标识（Agent 工具名）"),
              h("input", {
                style: styles.input,
                value: draft.toolId,
                placeholder: "自动生成，例如 query_current_weather",
                onChange: (e) => setField({ toolId: e.target.value })
              })
            ])
          ]),
          h("div", { style: { ...styles.field, marginTop: 8 } }, [
            h("label", { style: styles.label }, "何时调用"),
            h("textarea", {
              style: { ...styles.textarea, minHeight: 56, fontFamily: "inherit" },
              value: draft.purpose,
              placeholder: "用一句中文告诉 Agent：用户提出什么需求时应调用该工具。",
              onChange: (e) => setField({ purpose: e.target.value })
            })
          ]),
          h("div", { style: { ...styles.gridUrl, marginTop: 8 } }, [
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "请求方法"),
              h("select", { style: styles.select, value: draft.method, onChange: (e) => setField({ method: e.target.value }) },
                METHODS.map((m) => h("option", { key: m, value: m }, m)))
            ]),
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "接口地址"),
              h("input", { style: styles.input, value: draft.url, placeholder: "https://api.example.com/v1/resource", onChange: (e) => setField({ url: e.target.value }) })
            ])
          ]),
          h("div", { style: { ...styles.gridAuth, marginTop: 8 } }, [
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "认证方式"),
              h("select", { style: styles.select, value: draft.auth, onChange: (e) => setField({ auth: e.target.value, credential: e.target.value === "none" ? "" : draft.credential }) },
                AUTH_TYPES.map((o) => h("option", { key: o.value, value: o.value }, o.label)))
            ]),
            h("div", { style: styles.field }, [
              h("label", { style: styles.label }, "凭据引用"),
              h("input", {
                style: styles.input,
                value: draft.credential,
                disabled: !needsCredential,
                placeholder: "例如：WEATHER_API_KEY",
                onChange: (e) => setField({ credential: e.target.value })
              })
            ])
          ]),
          h("div", { style: styles.muted },
            needsCredential
              ? (credentialStatus && credentialStatus.configured
                ? `凭据 ${draft.credential} 已配置（来源：${credentialStatus.source ?? "未知"}）。密钥只存引用，不进配置或调用轨迹。`
                : "密钥不会进入普通配置、Agent 上下文或调用轨迹；只保存引用名，实际值由凭据存储提供。")
              : "当前无需凭据。")
        ]),

        // 参数定义
        h("div", { style: styles.card }, h(ParamsTable, { params: draft.params, onChange: setParams })),

        // 草稿测试
        h("div", { style: styles.card }, [
          h("div", { style: { ...styles.row, justifyContent: "space-between", marginBottom: 8 } }, [
            h("h3", { style: styles.sectionTitle }, "草稿测试"),
            h("button", { type: "button", style: { ...styles.button, ...styles.primary }, disabled: busy, onClick: runTest }, busy ? "正在测试…" : "使用当前草稿测试")
          ]),
          h("div", { style: styles.grid2 }, [
            h("div", null, [
              h("label", { style: styles.label }, "输入参数（JSON）"),
              h("textarea", { style: { ...styles.textarea, minHeight: 120 }, value: testInput, onChange: (e) => setTestInput(e.target.value), spellCheck: false })
            ]),
            h("div", null, [
              h("label", { style: styles.label }, "运行结果"),
              h("pre", { style: styles.code }, testResult === null ? "配置完成后点击“使用当前草稿测试”。" : JSON.stringify(testResult, null, 2))
            ])
          ]),
          message && h("div", { style: { ...styles.msg, ...(message.kind === "ok" ? styles.ok : styles.error), marginTop: 8 } }, message.text)
        ]),

        // Agent 使用
        h("div", { style: styles.card }, [
          h("h3", { style: styles.sectionTitle }, "Agent 使用"),
          h("div", { style: styles.muted }, "测试通过后可启用。启用后，该配置会注册成一个有明确参数的独立 Agent 工具。"),
          h("div", { style: { ...styles.row, justifyContent: "space-between", marginTop: 8 } }, [
            h("span", { style: { fontSize: 13, fontWeight: 600 } }, "启用给 Agent"),
            h("input", {
              type: "checkbox",
              style: { ...styles.switch, ...(draft.enabled ? styles.switchOn : {}) },
              checked: draft.enabled,
              onChange: (e) => setField({ enabled: e.target.checked })
            })
          ])
        ]),

        // 底部操作
        h("div", { style: { ...styles.row, justifyContent: "flex-end", marginTop: 4 } }, [
          h("button", { type: "button", style: styles.button, onClick: onBack }, "取消"),
          h("button", { type: "button", style: styles.button, disabled: busy, onClick: () => save(false) }, "保存草稿"),
          h("button", { type: "button", style: { ...styles.button, ...styles.primary }, disabled: busy, onClick: () => save(true) }, "保存并启用")
        ])
      ]);
    }

    /** 生成示例输入 JSON。 */
    function buildSample(draft) {
      const sample = {};
      (draft.params || []).filter((p) => p.source === "agent" && p.name).forEach((p) => {
        sample[p.name] = p.type === "number" ? 1 : p.type === "boolean" ? true : p.type === "array" ? [] : p.type === "object" ? {} : `示例${p.description || p.name}`;
      });
      return JSON.stringify(sample, null, 2);
    }

    /** 从 cURL 命令解析 method / url / auth / body 参数。 */
    function parseCurlCommand(source) {
      const text = String(source || "").trim();
      if (!/^curl\s/i.test(text)) return { error: "请输入有效的 cURL 命令" };
      const methodMatch = text.match(/(?:-X|--request)\s+([A-Z]+)/i);
      const hasData = /(?:-d|--data(?:-raw)?)\s+/.test(text);
      let method = (methodMatch ? methodMatch[1] : (hasData ? "POST" : "GET")).toUpperCase();
      if (!METHODS.includes(method)) method = "GET";
      const urlMatch = text.match(/https?:\/\/[^\s'"]+/i);
      if (!urlMatch) return { error: "没有识别到接口地址" };
      const parsed = { method, url: urlMatch[0], auth: "none", credential: "", params: [] };
      const authMatch = text.match(/Authorization:\s*Bearer\s+([^'"\s]+)/i);
      if (authMatch) {
        parsed.auth = "bearer";
        parsed.credential = "EXTERNAL_API_TOKEN";
      }
      const dataMatch = text.match(/(?:-d|--data(?:-raw)?)\s+(['"])([\s\S]*?)\1/i);
      if (dataMatch) {
        try {
          const body = JSON.parse(dataMatch[2]);
          parsed.params = Object.entries(body).map(([name, value]) => ({
            name,
            location: "body",
            type: Array.isArray(value) ? "array" : value === null ? "string" : typeof value,
            source: "agent",
            required: true,
            description: "请补充中文说明",
            value: ""
          }));
        } catch {
          parsed.bodyJsonWarning = true;
        }
      }
      return parsed;
    }

    /** 主组件。 */
    function ApiToolsSection() {
      const [tools, setTools] = useState([]);
      const [view, setView] = useState("list");
      const [editingId, setEditingId] = useState("");
      const [draft, setDraft] = useState(emptyDraft());
      const [message, setMessage] = useState(null);

      const reload = useCallback(async () => {
        try {
          setTools((await api("/list")).tools ?? []);
        } catch (e) {
          setMessage({ kind: "error", text: e && e.message ? e.message : String(e) });
        }
      }, []);

      useEffect(() => { reload(); }, [reload]);

      const openEditor = useCallback((id) => {
        if (id) {
          const found = tools.find((t) => t.id === id);
          if (found) {
            setDraft({ ...emptyDraft(), ...found });
            setEditingId(id);
          }
        } else {
          setDraft(emptyDraft());
          setEditingId("");
        }
        setMessage(null);
        setView("editor");
      }, [tools]);

      const handleBack = useCallback(() => { setView("list"); setMessage(null); }, []);

      const handleSaved = useCallback((nextTools, enable) => {
        setTools(nextTools);
        setView("list");
        setMessage({ kind: "ok", text: enable ? "已保存并启用给 Agent" : "草稿已保存" });
      }, []);

      return h("div", { style: styles.root }, [
        h("div", { style: styles.spacer }, [
          h("div", null, [
            h("h3", { style: styles.title }, "API 调用"),
            h("p", { style: styles.muted }, "把外部接口接入为 Agent 可理解、可验证、可授权的工具。")
          ]),
          view === "list"
            ? h("button", { type: "button", style: { ...styles.button, ...styles.primary }, onClick: () => openEditor("") }, "新建 API 工具")
            : null
        ]),
        message && view === "list"
          ? h("div", { style: { ...styles.msg, ...(message.kind === "ok" ? styles.ok : styles.error) } }, message.text)
          : null,
        view === "list"
          ? h(ListView, { tools, onOpen: openEditor, onNew: () => openEditor("") })
          : h(EditorView, {
              draft,
              isNew: editingId === "",
              onDraftChange: setDraft,
              onBack: handleBack,
              onSaved: handleSaved
            })
      ]);
    }

    // ---------- 注册 ----------
    function apply(ctx) {
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "api-tools",
        order: 100,
        label: "API 调用"
      }, ApiToolsSection));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
