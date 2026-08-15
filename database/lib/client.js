window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-database-connections",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/DatabaseConnections.tsx
		/**
		* "数据库连接"设置页组件：连接列表、新建/编辑/删除、测试连接、
		* 浏览数据库/表、只读查询。所有数据经 host 半部的 HTTP API 往返。
		*/
		const DEFAULT_PORT = {
			mysql: 3306,
			clickhouse: 8123
		};
		function emptyForm(type = "mysql") {
			return {
				name: "",
				type,
				host: "",
				port: String(DEFAULT_PORT[type]),
				username: "",
				password: "",
				database: ""
			};
		}
		/** 调 host API：错误（ok=false 或网络失败）一律抛异常，成功返回解包后的 data。 */
		async function api(path, body) {
			const init = {
				method: body === void 0 ? "GET" : "POST",
				headers: { "Content-Type": "application/json" }
			};
			if (body !== void 0) init.body = JSON.stringify(body);
			let res;
			try {
				res = await fetch(`/api/database-connections${path}`, init);
			} catch {
				throw new Error("无法连接到 DSH 后端服务");
			}
			let json;
			try {
				json = await res.json();
			} catch {
				throw new Error(`后端返回了非 JSON 响应（HTTP ${String(res.status)}）`);
			}
			if (typeof json === "object" && json !== null && json.ok === false) throw new Error(json.error ?? "请求失败");
			return json;
		}
		const styles = {
			root: {
				display: "flex",
				flexDirection: "column",
				gap: 16,
				padding: "16px 20px",
				maxWidth: 980,
				fontFamily: "inherit",
				color: "var(--dsw-alias-label-primary)"
			},
			title: {
				fontSize: 16,
				fontWeight: 600,
				margin: 0
			},
			grid: {
				display: "flex",
				gap: 16,
				alignItems: "stretch",
				flexWrap: "wrap"
			},
			listPanel: {
				flex: "0 0 260px",
				minWidth: 220
			},
			formPanel: {
				flex: 1,
				minWidth: 340
			},
			card: {
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: 8,
				background: "var(--dsw-alias-bg-layer-2)",
				padding: 12
			},
			list: {
				listStyle: "none",
				margin: 0,
				padding: 0,
				maxHeight: 340,
				overflowY: "auto"
			},
			listItem: {
				padding: "8px 10px",
				borderRadius: 6,
				cursor: "pointer",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				gap: 8
			},
			listItemActive: { background: "var(--dsw-alias-interactive-bg-hover-accent)" },
			field: {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				marginBottom: 10
			},
			label: {
				fontSize: 12,
				color: "var(--dsw-alias-label-secondary)"
			},
			input: {
				padding: "6px 8px",
				borderRadius: 6,
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "inherit",
				fontSize: 13,
				boxSizing: "border-box",
				width: "100%"
			},
			select: {
				padding: "6px 8px",
				borderRadius: 6,
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "inherit",
				fontSize: 13
			},
			row: {
				display: "flex",
				gap: 8,
				flexWrap: "wrap"
			},
			button: {
				padding: "6px 12px",
				borderRadius: 6,
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-2)",
				color: "inherit",
				cursor: "pointer",
				fontSize: 13
			},
			primary: {
				background: "var(--dsw-alias-button-primary-fill)",
				borderColor: "var(--dsw-alias-button-primary-fill)",
				color: "var(--dsw-alias-button-primary-invert)"
			},
			danger: {
				background: "var(--dsw-alias-state-error-primary)",
				borderColor: "var(--dsw-alias-state-error-primary)",
				color: "#ffffff"
			},
			message: {
				fontSize: 13,
				whiteSpace: "pre-wrap"
			},
			ok: { color: "var(--dsw-alias-state-success-primary)" },
			error: { color: "var(--dsw-alias-state-error-primary)" },
			muted: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: 12
			},
			tableWrap: {
				overflowX: "auto",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: 6
			},
			table: {
				borderCollapse: "collapse",
				width: "100%",
				fontSize: 12
			},
			th: {
				textAlign: "left",
				padding: "6px 8px",
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				position: "sticky",
				top: 0
			},
			td: {
				padding: "5px 8px",
				borderBottom: "1px solid var(--dsw-alias-border-l1)"
			}
		};
		/** 把任意值转成单元格文本。 */
		function cellText(value) {
			if (value === null || value === void 0) return "";
			if (typeof value === "object") return JSON.stringify(value);
			return String(value);
		}
		/** "数据库连接"设置页。 */
		function DatabaseConnectionsSection(_props) {
			const [connections, setConnections] = (0, react.useState)([]);
			const [form, setForm] = (0, react.useState)(emptyForm());
			const [editingId, setEditingId] = (0, react.useState)("");
			const [message, setMessage] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [databases, setDatabases] = (0, react.useState)([]);
			const [tables, setTables] = (0, react.useState)([]);
			const [selectedDatabase, setSelectedDatabase] = (0, react.useState)("");
			const [sql, setSql] = (0, react.useState)("");
			const [result, setResult] = (0, react.useState)(null);
			const setField = (0, react.useCallback)((patch) => {
				setForm((prev) => ({
					...prev,
					...patch
				}));
			}, []);
			const showMessage = (0, react.useCallback)((kind, text) => {
				setMessage({
					kind,
					text
				});
			}, []);
			/** 拉取连接列表。 */
			const reload = (0, react.useCallback)(async () => {
				try {
					setConnections((await api("/list")).connections ?? []);
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				}
			}, [showMessage]);
			(0, react.useEffect)(() => {
				reload();
			}, [reload]);
			/** 新建连接。 */
			const handleNew = (0, react.useCallback)(() => {
				setForm(emptyForm());
				setEditingId("");
				setMessage(null);
				setDatabases([]);
				setTables([]);
				setResult(null);
			}, []);
			/** 选中连接并载入表单（密码留空，编辑时不改则保留原密码）。 */
			const handleSelect = (0, react.useCallback)((connection) => {
				setForm({
					name: connection.name,
					type: connection.type,
					host: connection.host,
					port: String(connection.port),
					username: connection.username,
					password: "",
					database: connection.database
				});
				setEditingId(connection.id);
				setMessage(null);
				setDatabases([]);
				setTables([]);
				setResult(null);
			}, []);
			/** 切换数据库类型时重置默认端口。 */
			const handleTypeChange = (0, react.useCallback)((type) => {
				setForm((prev) => ({
					...prev,
					type,
					port: String(DEFAULT_PORT[type])
				}));
			}, []);
			/** 组装当前表单的连接信息（提交给 host）。 */
			const currentConnection = (0, react.useCallback)(() => ({
				id: editingId,
				name: form.name.trim(),
				type: form.type,
				host: form.host.trim(),
				port: Number.parseInt(form.port, 10) || DEFAULT_PORT[form.type],
				username: form.username,
				password: form.password,
				database: form.database
			}), [editingId, form]);
			/** 保存（新建或更新）。 */
			const handleSave = (0, react.useCallback)(async () => {
				if (form.name.trim().length === 0) {
					showMessage("error", "请填写连接名称");
					return;
				}
				if (form.host.trim().length === 0) {
					showMessage("error", "请填写主机地址");
					return;
				}
				setBusy(true);
				try {
					const data = await api("/save", { connection: currentConnection() });
					setConnections(data.connections ?? []);
					const saved = (data.connections ?? []).find((c) => c.name === form.name.trim());
					if (saved !== void 0) setEditingId(saved.id);
					showMessage("ok", "已保存连接");
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [
				form,
				currentConnection,
				showMessage
			]);
			/** 删除当前编辑的连接。 */
			const handleDelete = (0, react.useCallback)(async () => {
				if (editingId.length === 0) return;
				if (!globalThis.confirm(`确定删除连接「${form.name}」吗？`)) return;
				setBusy(true);
				try {
					setConnections((await api("/delete", { id: editingId })).connections ?? []);
					handleNew();
					showMessage("ok", "已删除连接");
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [
				editingId,
				form.name,
				handleNew,
				showMessage
			]);
			/** 测试当前表单连接。 */
			const handleTest = (0, react.useCallback)(async () => {
				setBusy(true);
				setMessage(null);
				try {
					showMessage("ok", (await api("/test", { connection: currentConnection() })).message ?? "连接成功");
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [currentConnection, showMessage]);
			/** 加载数据库列表。 */
			const handleLoadDatabases = (0, react.useCallback)(async () => {
				setBusy(true);
				try {
					const data = await api("/databases", { connection: currentConnection() });
					setDatabases(data.rows ?? []);
					showMessage("ok", `发现 ${String((data.rows ?? []).length)} 个数据库`);
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [currentConnection, showMessage]);
			/** 加载某数据库的表。 */
			const handleLoadTables = (0, react.useCallback)(async (database) => {
				setSelectedDatabase(database);
				setBusy(true);
				try {
					setTables((await api("/tables", {
						connection: currentConnection(),
						database
					})).rows ?? []);
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [currentConnection, showMessage]);
			/** 执行查询。 */
			const handleQuery = (0, react.useCallback)(async (querySql) => {
				const finalSql = querySql ?? sql;
				if (finalSql.trim().length === 0) {
					showMessage("error", "请输入 SQL");
					return;
				}
				setBusy(true);
				try {
					const data = await api("/query", {
						connection: currentConnection(),
						sql: finalSql
					});
					setResult({
						columns: data.columns ?? [],
						rows: data.rows ?? []
					});
				} catch (error) {
					showMessage("error", error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			}, [
				sql,
				currentConnection,
				showMessage
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles.root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						style: styles.title,
						children: "数据库连接"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: styles.grid,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: styles.listPanel,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: styles.card,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										...styles.row,
										justifyContent: "space-between",
										marginBottom: 8
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: styles.muted,
										children: "已保存的连接"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: styles.button,
										onClick: handleNew,
										children: "新建"
									})]
								}), connections.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: styles.muted,
									children: "暂无连接"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									style: styles.list,
									children: connections.map((connection) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
										style: {
											...styles.listItem,
											...connection.id === editingId ? styles.listItemActive : {}
										},
										onClick: () => handleSelect(connection),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: connection.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: styles.muted,
											children: [
												connection.type === "mysql" ? "MySQL" : "ClickHouse",
												" · ",
												connection.host,
												":",
												connection.port
											]
										})] })
									}, connection.id))
								})]
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: styles.formPanel,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: styles.card,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											style: styles.label,
											children: "连接名称"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											style: styles.input,
											value: form.name,
											placeholder: "例如：生产库 MySQL",
											onChange: (e) => setField({ name: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.row,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												...styles.field,
												flex: 1
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
												style: styles.label,
												children: "数据库类型"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
												style: styles.select,
												value: form.type,
												onChange: (e) => handleTypeChange(e.target.value),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "mysql",
													children: "MySQL"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "clickhouse",
													children: "ClickHouse"
												})]
											})]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												...styles.field,
												flex: 1
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
												style: styles.label,
												children: "端口"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												style: styles.input,
												value: form.port,
												inputMode: "numeric",
												onChange: (e) => setField({ port: e.target.value })
											})]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											style: styles.label,
											children: "主机地址"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											style: styles.input,
											value: form.host,
											placeholder: "127.0.0.1",
											onChange: (e) => setField({ host: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.row,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												...styles.field,
												flex: 1
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
												style: styles.label,
												children: "用户名"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												style: styles.input,
												value: form.username,
												onChange: (e) => setField({ username: e.target.value })
											})]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												...styles.field,
												flex: 1
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												style: styles.label,
												children: ["密码", editingId !== "" ? "（留空则不修改）" : ""]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												style: styles.input,
												type: "password",
												value: form.password,
												onChange: (e) => setField({ password: e.target.value })
											})]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											style: styles.label,
											children: "默认数据库（可留空）"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											style: styles.input,
											value: form.database,
											onChange: (e) => setField({ database: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: styles.row,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												style: {
													...styles.button,
													...styles.primary
												},
												disabled: busy,
												onClick: handleSave,
												children: "保存连接"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												style: styles.button,
												disabled: busy,
												onClick: handleTest,
												children: "测试连接"
											}),
											editingId !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												style: {
													...styles.button,
													...styles.danger
												},
												disabled: busy,
												onClick: handleDelete,
												children: "删除"
											})
										]
									}),
									message !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: {
											...styles.message,
											...message.kind === "ok" ? styles.ok : styles.error,
											marginTop: 10
										},
										children: message.text
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: styles.card,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									...styles.row,
									marginBottom: 10
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: styles.button,
										disabled: busy,
										onClick: handleLoadDatabases,
										children: "浏览数据库"
									}),
									databases.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: styles.select,
										value: selectedDatabase,
										onChange: (e) => void handleLoadTables(e.target.value),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: "选择数据库…"
										}), databases.map((db) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: db,
											children: db
										}, db))]
									}),
									tables.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: styles.select,
										onChange: (e) => {
											const table = e.target.value;
											if (table.length > 0) handleQuery(`SELECT * FROM \`${table}\` LIMIT 100`);
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: "选择表…"
										}), tables.map((table) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: table,
											children: table
										}, table))]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: styles.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									style: styles.label,
									children: "SQL 查询（仅只读：SELECT / SHOW / DESCRIBE / EXPLAIN）"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									style: {
										...styles.input,
										minHeight: 64,
										fontFamily: "monospace",
										resize: "vertical"
									},
									value: sql,
									placeholder: "SELECT * FROM table LIMIT 100",
									onChange: (e) => setSql(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles.button,
									...styles.primary
								},
								disabled: busy,
								onClick: () => void handleQuery(),
								children: "执行查询"
							}),
							result !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: { marginTop: 10 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: styles.muted,
									children: [String(result.rows.length), " 行"]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: styles.tableWrap,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
										style: styles.table,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: result.columns.map((column) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
											style: styles.th,
											children: column
										}, column)) }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: result.rows.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: result.columns.map((column) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
											style: styles.td,
											children: cellText(row[column])
										}, column)) }, index)) })]
									})
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** 依赖的 client 服务。 */
		const inject = ["slots"];
		/** 注册设置页的"数据库连接"导航项。 */
		function apply(ctx) {
			// 目标 slot 二选一：安装了「我的插件」基础插件（声明 my-plugins.section）就
			// 注册到大面板里，否则回退到设置页（settings.section）。动态迁移，顺序无关。
			const MP = "my-plugins.section";
			const SETTINGS = "settings.section";
			let active = null;
			let activeTarget = null;

			const mount = () => {
				const target = ctx.slots.spec(MP) ? MP : SETTINGS;
				if (target === activeTarget && active !== null) return;
				if (active) { try { active(); } catch (e) {} active = null; }
				activeTarget = target;
				if (!ctx.slots.spec(target)) return;
				active = ctx.slots.register({
					name: target,
					id: "database-connections",
					order: 100,
					label: "数据库连接"
				}, DatabaseConnectionsSection);
			};

			ctx.effect(() => {
				const offMp = ctx.slots.subscribe(MP, mount);
				const offSettings = ctx.slots.subscribe(SETTINGS, mount);
				mount();
				return () => {
					offMp();
					offSettings();
					if (active) { try { active(); } catch (e) {} active = null; }
				};
			}, "database-connections: section target");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map