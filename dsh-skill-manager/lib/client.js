window.__ModuleLoader__.load({
  id: "dsh-skill-manager",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let react = require("react");
    const {
      createElement: h,
      useState,
      useEffect,
      Fragment
    } = react;

    const inject = ["slots"];

    // ---------- host API ----------

    async function api(path, body) {
      const init = {
        method: body === undefined ? "GET" : "POST",
        headers: { "Content-Type": "application/json" }
      };
      if (body !== undefined) init.body = JSON.stringify(body);
      let res;
      try {
        res = await fetch(`/api/dsh-skill-manager${path}`, init);
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
      root: { display: "flex", flexDirection: "column", gap: 14, padding: "16px 20px", maxWidth: 1080, fontFamily: "inherit", color: "var(--color-text, #1f2328)" },
      head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
      title: { fontSize: 16, fontWeight: 600, margin: 0 },
      muted: { color: "var(--color-text-muted, #57606a)", fontSize: 12, lineHeight: 1.6 },
      list: { display: "flex", flexDirection: "column", gap: 8 },
      row: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--color-border, #d0d7de)", borderRadius: 8 },
      rowMain: { flex: 1, minWidth: 0 },
      skillName: { fontWeight: 600 },
      skillNameOff: { fontWeight: 600, textDecoration: "line-through", opacity: 0.55 },
      desc: { color: "var(--color-text-muted, #57606a)", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
      btn: { border: "1px solid var(--color-border, #d0d7de)", background: "var(--color-bg-raised, #ffffff)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, color: "inherit" },
      btnDanger: { border: "1px solid var(--color-danger, #d1242f)", color: "var(--color-danger, #d1242f)", background: "transparent", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12 },
      btnPrimary: { color: "#ffffff", background: "var(--color-accent, #0969da)", border: "1px solid var(--color-accent, #0969da)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12 },
      switch: { position: "relative", width: 36, height: 20, borderRadius: 999, border: "none", cursor: "pointer", background: "var(--color-bg-muted, #eaeef2)", padding: 0, flexShrink: 0 },
      switchOn: { background: "var(--color-accent, #0969da)" },
      switchKnob: { position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", transition: "left 0.15s" },
      switchKnobOn: { position: "absolute", top: 2, left: 18, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", transition: "left 0.15s" },
      form: { display: "flex", flexDirection: "column", gap: 10, padding: 14, border: "1px solid var(--color-border, #d0d7de)", borderRadius: 8 },
      field: { display: "flex", flexDirection: "column", gap: 4 },
      label: { fontSize: 12, color: "var(--color-text-muted, #57606a)" },
      input: { background: "var(--color-bg, #ffffff)", border: "1px solid var(--color-border, #d0d7de)", borderRadius: 6, padding: "7px 9px", fontSize: 13, color: "inherit", width: "100%", boxSizing: "border-box" },
      textarea: { background: "var(--color-bg, #ffffff)", border: "1px solid var(--color-border, #d0d7de)", borderRadius: 6, padding: "7px 9px", fontSize: 13, color: "inherit", width: "100%", boxSizing: "border-box", resize: "vertical" },
      textareaSm: { background: "var(--color-bg, #ffffff)", border: "1px solid var(--color-border, #d0d7de)", borderRadius: 6, padding: "7px 9px", fontSize: 12, color: "inherit", width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "ui-monospace, monospace" },
      hint: { fontSize: 11, color: "var(--color-text-muted, #57606a)" },
      checks: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
      check: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
      actions: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" },
      error: { color: "var(--color-danger, #d1242f)", fontSize: 12 },
      note: { color: "var(--color-text-muted, #57606a)", fontSize: 12 },
      empty: { border: "1px dashed var(--color-border, #d0d7de)", borderRadius: 8, padding: "36px 16px", textAlign: "center", color: "var(--color-text-muted, #57606a)" },
      box: { display: "flex", flexDirection: "column", gap: 6, padding: 8, border: "1px dashed var(--color-border, #d0d7de)", borderRadius: 6 },
      boxHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
      refRow: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
      refTag: { fontSize: 11, color: "var(--color-text-muted, #57606a)" },
    };

    function Toggle({ on, onToggle, title }) {
      return h("button", {
        type: "button",
        title,
        style: { ...styles.switch, ...(on ? styles.switchOn : {}) },
        onClick: onToggle
      }, h("span", { style: on ? styles.switchKnobOn : styles.switchKnob }));
    }

    // ---------- 主组件 ----------

    function SkillManagerSection() {
      const [skills, setSkills] = useState([]);
      const [tools, setTools] = useState([]);
      const [editing, setEditing] = useState(null);
      const [error, setError] = useState("");
      const [busy, setBusy] = useState(false);
      const [confirmDel, setConfirmDel] = useState(null);

      const refresh = async () => {
        try {
          setSkills((await api("/list")).skills ?? []);
        } catch (e) {
          setError(e && e.message ? e.message : String(e));
        }
      };

      useEffect(() => {
        refresh();
        api("/catalog").then((c) => setTools((c && c.tools) || [])).catch(() => {});
      }, []);

      const doSave = async (rec, oldName) => {
        setBusy(true);
        setError("");
        try {
          const res = await api("/save", { record: rec, oldName });
          setEditing(null);
          await refresh();
          if (res.error) setError(res.error);
        } catch (e) {
          setError(e && e.message ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      };

      const doRemove = async (name) => {
        if (confirmDel !== name) { setConfirmDel(name); return; }
        setConfirmDel(null);
        setBusy(true);
        setError("");
        try {
          await api("/remove", { name });
          await refresh();
        } catch (e) {
          setError(e && e.message ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      };

      const doToggle = async (rec) => {
        const next = { ...rec, enabled: !rec.enabled };
        if (next.enabled && !next.modelInvocable && !next.userInvocable) {
          next.modelInvocable = true;
          next.userInvocable = true;
        }
        setBusy(true);
        setError("");
        try {
          const res = await api("/save", { record: next, oldName: rec.name });
          await refresh();
          if (res.error) setError(res.error);
        } catch (e) {
          setError(e && e.message ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      };

      const startNew = () => setEditing({
        name: "", description: "", whenToUse: "", interpreter: "python",
        modelInvocable: true, userInvocable: true, enabled: true,
        content: "", scripts: [], refs: []
      });

      const row = (rec) => h("div", { key: rec.name, style: styles.row },
        h("div", { style: styles.rowMain },
          h("div", { style: rec.enabled ? styles.skillName : styles.skillNameOff }, rec.name),
          h("div", { style: styles.desc }, rec.description)
        ),
        h(Toggle, { on: rec.enabled, title: rec.enabled ? "禁用" : "启用", onToggle: () => doToggle(rec) }),
        h("button", {
          style: styles.btn,
          onClick: () => { setConfirmDel(null); setEditing({ ...rec, scripts: rec.scripts || [], refs: rec.refs || [] }); }
        }, "编辑"),
        h("button", { style: styles.btnDanger, onClick: () => doRemove(rec.name) }, confirmDel === rec.name ? "确认删除" : "删除")
      );

      const form = () => {
        const rec = editing;
        const isNew = !skills.some((s) => s.name === rec.name);
        const set = (k) => (e) => setEditing({ ...rec, [k]: e.target.value });
        const setBool = (k) => (e) => setEditing({ ...rec, [k]: e.target.checked });

        const addScript = () => setEditing({ ...rec, scripts: (rec.scripts || []).concat([{ name: "", code: "" }]) });
        const removeScript = (i) => {
          const scripts = (rec.scripts || []).slice();
          scripts.splice(i, 1);
          setEditing({ ...rec, scripts });
        };
        const updateScript = (i, field, val) => {
          const scripts = (rec.scripts || []).slice();
          scripts[i] = { ...scripts[i], [field]: val };
          setEditing({ ...rec, scripts });
        };

        const addRef = (type) => {
          let ref;
          if (type === "tool") ref = { type: "tool", name: (tools[0] && tools[0].name) || "" };
          else if (type === "database") ref = { type: "database", connection: "", database: "", table: "" };
          else ref = { type: "sql", label: "", sql: "" };
          setEditing({ ...rec, refs: (rec.refs || []).concat([ref]) });
        };
        const removeRef = (i) => {
          const refs = (rec.refs || []).slice();
          refs.splice(i, 1);
          setEditing({ ...rec, refs });
        };
        const updateRef = (i, field, val) => {
          const refs = (rec.refs || []).slice();
          refs[i] = { ...refs[i], [field]: val };
          setEditing({ ...rec, refs });
        };

        const refEditor = (r, i) => {
          if (r.type === "tool") {
            return h("div", { key: i, style: styles.box },
              h("div", { style: styles.refRow },
                h("span", { style: styles.refTag }, "接口工具"),
                h("select", { style: { ...styles.input, flex: 1, minWidth: 180 }, value: r.name, onChange: (e) => updateRef(i, "name", e.target.value) },
                  tools.map((t) => h("option", { key: t.name, value: t.name }, t.name))),
                h("button", { style: styles.btnDanger, onClick: () => removeRef(i) }, "删除")
              )
            );
          }
          if (r.type === "database") {
            return h("div", { key: i, style: styles.box },
              h("div", { style: styles.refRow },
                h("span", { style: styles.refTag }, "数据库表"),
                h("input", { style: { ...styles.input, flex: 1, minWidth: 120 }, value: r.connection, placeholder: "连接名", onChange: (e) => updateRef(i, "connection", e.target.value) }),
                h("input", { style: { ...styles.input, flex: 1, minWidth: 100 }, value: r.database, placeholder: "库名（可选）", onChange: (e) => updateRef(i, "database", e.target.value) }),
                h("input", { style: { ...styles.input, flex: 1, minWidth: 100 }, value: r.table, placeholder: "表名（可选）", onChange: (e) => updateRef(i, "table", e.target.value) }),
                h("button", { style: styles.btnDanger, onClick: () => removeRef(i) }, "删除")
              )
            );
          }
          return h("div", { key: i, style: styles.box },
            h("div", { style: styles.refRow },
              h("span", { style: styles.refTag }, "SQL 命令"),
              h("input", { style: { ...styles.input, flex: 1, minWidth: 120 }, value: r.label, placeholder: "标签（如 查库存）", onChange: (e) => updateRef(i, "label", e.target.value) }),
              h("button", { style: styles.btnDanger, onClick: () => removeRef(i) }, "删除")
            ),
            h("textarea", { style: { ...styles.textareaSm, minHeight: 70 }, value: r.sql, placeholder: "SELECT ...", onChange: (e) => updateRef(i, "sql", e.target.value) })
          );
        };

        return h("div", { style: styles.form },
          h("div", { style: styles.field },
            h("label", { style: styles.label }, "名称（kebab-case）"),
            h("input", { style: styles.input, value: rec.name, disabled: !isNew, onChange: set("name"), placeholder: "my-review" })
          ),
          h("div", { style: styles.field },
            h("label", { style: styles.label }, "描述 *"),
            h("input", { style: styles.input, value: rec.description, onChange: set("description"), placeholder: "一句话说明这个技能做什么" })
          ),
          h("div", { style: styles.field },
            h("label", { style: styles.label }, "何时调用（whenToUse，可选）"),
            h("input", { style: styles.input, value: rec.whenToUse, onChange: set("whenToUse"), placeholder: "当用户要求代码审查时" })
          ),
          h("div", { style: styles.field },
            h("label", { style: styles.label }, "解释器命令"),
            h("input", { style: styles.input, value: rec.interpreter || "python", onChange: set("interpreter"), placeholder: "python" }),
            h("div", { style: styles.hint }, "执行 Python 脚本用的命令，如 python / python3 / py / 绝对路径。")
          ),
          h("div", { style: styles.checks },
            h("label", { style: styles.check },
              h("input", { type: "checkbox", checked: rec.modelInvocable, onChange: setBool("modelInvocable") }),
              "模型可自动调用"
            ),
            h("label", { style: styles.check },
              h("input", { type: "checkbox", checked: rec.userInvocable, onChange: setBool("userInvocable") }),
              "用户可 /name 调用"
            )
          ),
          h("div", { style: styles.field },
            h("label", { style: styles.label }, "技能正文（markdown）"),
            h("textarea", { style: { ...styles.textarea, minHeight: 120 }, value: rec.content, onChange: set("content"), placeholder: "在这里写技能指令……\n\n可以用 @技能名 引用其他技能。" }),
            h("div", { style: styles.hint }, "正文注入模型 system prompt；用 @技能名 引用其他技能（被禁用技能不会被引用）。")
          ),
          h("div", { style: styles.field },
            h("div", { style: styles.boxHead },
              h("label", { style: styles.label }, "Python 脚本（可选，可多个）"),
              h("button", { style: styles.btn, onClick: addScript }, "+ 添加脚本")
            ),
            (rec.scripts || []).map((s, i) =>
              h("div", { key: i, style: styles.box },
                h("input", { style: styles.input, value: s.name, placeholder: "脚本名称（如 数据清洗）", onChange: (e) => updateScript(i, "name", e.target.value) }),
                h("textarea", { style: { ...styles.textareaSm, minHeight: 70 }, value: s.code, placeholder: "Python 代码", onChange: (e) => updateScript(i, "code", e.target.value) }),
                h("button", { style: styles.btnDanger, onClick: () => removeScript(i) }, "删除脚本")
              )
            )
          ),
          h("div", { style: styles.field },
            h("div", { style: styles.boxHead },
              h("label", { style: styles.label }, "能力引用（可选，可多个）"),
              h("div", { style: { display: "flex", gap: 6 } },
                h("button", { style: styles.btn, onClick: () => addRef("tool") }, "+接口"),
                h("button", { style: styles.btn, onClick: () => addRef("database") }, "+数据库表"),
                h("button", { style: styles.btn, onClick: () => addRef("sql") }, "+SQL")
              )
            ),
            (rec.refs || []).map(refEditor),
            h("div", { style: styles.hint }, "引用其他插件的能力（接口工具 / 数据库表 / SQL），渲染时展开成调用指引注入正文。")
          ),
          h("div", { style: styles.actions },
            h("button", { style: styles.btn, onClick: () => setEditing(null) }, "取消"),
            h("button", { style: styles.btnPrimary, disabled: busy, onClick: () => doSave(rec, isNew ? undefined : rec.name) }, busy ? "保存中…" : "保存")
          )
        );
      };

      return h("div", { style: styles.root },
        h("div", { style: styles.head },
          h("div", null,
            h("h3", { style: styles.title }, "技能（Skill）配置"),
            h("p", { style: styles.muted }, "自定义技能：正文 + Python 脚本 + @技能名 互调 + 引用接口/数据库/SQL，配置后立即生效。")
          ),
          editing === null ? h("button", { style: styles.btnPrimary, onClick: startNew }, "+ 新建技能") : null
        ),
        error ? h("div", { style: styles.error }, error) : null,
        editing !== null ? form() : null,
        skills.length === 0 && editing === null
          ? h("div", { style: styles.empty }, "还没有自定义技能，点击「新建技能」开始。")
          : editing === null ? h("div", { style: styles.list }, skills.map(row)) : null,
        h("div", { style: styles.note }, "技能持久化到 ~/.dsh/skills/，配置后立即生效。正文中可直接指引模型调用任意插件工具。")
      );
    }

    // ---------- 注册 ----------

    function apply(ctx) {
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "dsh-skill-manager",
        order: 25,
        label: "技能"
      }, SkillManagerSection));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
