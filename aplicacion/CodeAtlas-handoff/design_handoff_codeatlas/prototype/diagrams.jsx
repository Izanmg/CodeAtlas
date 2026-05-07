/* ============================================================
   CodeAtlas v2 — Diagrams (upload + canvas)
   - Auto-layout dagre-like (layered, top→down by dependency depth)
   - Top toolbar with breadcrumbs, search, theme, filters
   - Side panel with tabs (Resumen / Conexiones / Detalles)
   - Focus mode: click node, dim everything else
   ============================================================ */

const { ReactFlow: RFCanvas, Background, Controls, MiniMap,
        useNodesState, useEdgesState, MarkerType, useReactFlow, ReactFlowProvider } = window.ReactFlow;

// =================================================================
// 1. DIAGRAM NEW — file upload & generation
// =================================================================
function DiagramNewScreen({ project, onBack, onGenerated }) {
  const [files, setFiles] = React.useState([]);
  const [name, setName] = React.useState("Arquitectura " + new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
  const [dragActive, setDragActive] = React.useState(false);
  const [state, setState] = React.useState("idle");
  const [progress, setProgress] = React.useState(0);
  const [phaseLabel, setPhaseLabel] = React.useState("");
  const inputRef = React.useRef(null);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).filter((f) => f.name.endsWith(".md") || f.name.endsWith(".markdown"));
    const mapped = arr.map((f) => ({ id: f.name + Math.random(), name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const onDrop = (e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); };
  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const generate = () => {
    if (!files.length || !name.trim()) return;
    setState("loading"); setProgress(0);
    const ticks = [
      { p: 14, label: "Subiendo archivos" },
      { p: 38, label: "Analizando markdown" },
      { p: 64, label: "Construyendo modelo" },
      { p: 88, label: "Renderizando diagrama" },
      { p: 100, label: "Listo" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      setProgress(ticks[i].p); setPhaseLabel(ticks[i].label);
      i++;
      if (i >= ticks.length) {
        clearInterval(interval);
        setTimeout(() => onGenerated({ name }), 300);
      }
    }, 420);
  };

  const loadSample = () => {
    setFiles([
      { id: "s1", name: "auth.md", size: 2840 },
      { id: "s2", name: "projects.md", size: 4120 },
      { id: "s3", name: "diagrams.md", size: 5630 },
      { id: "s4", name: "database-schema.md", size: 1950 },
      { id: "s5", name: "system-rules.md", size: 1280 },
    ]);
  };

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 760, margin: "0 auto" }}>
      <PageHeader
        eyebrow="generar diagrama"
        title="Sube tu documentación"
        description="Archivos .md que describan módulos, pantallas, base de datos y flujos. Construiremos un diagrama navegable a partir de ellos."
      />

      {state === "loading" ? (
        <LoadingState progress={progress} fileCount={files.length} phaseLabel={phaseLabel}/>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Drop zone */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "44px 24px",
              border: `1.5px dashed ${dragActive ? "var(--accent)" : "var(--border-strong)"}`,
              background: dragActive ? "var(--accent-soft)" : "var(--surface)",
              borderRadius: "var(--r-lg)",
              textAlign: "center",
              cursor: "pointer",
              transition: "background 120ms, border-color 120ms",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "var(--r-md)",
              background: dragActive ? "var(--accent)" : "var(--bg-muted)",
              color: dragActive ? "var(--accent-fg)" : "var(--fg-muted)",
              display: "grid", placeItems: "center",
              margin: "0 auto 12px",
              transition: "background 120ms, color 120ms",
            }}>
              <Icon name="upload" size={18}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.01em" }}>
              Arrastra tus archivos .md aquí
            </div>
            <div style={{ color: "var(--fg-subtle)", margin: "4px 0 14px", fontSize: 12.5 }}>
              o haz clic para seleccionarlos · acepta varios archivos
            </div>
            <Button variant="secondary" size="sm" icon="folder">Seleccionar archivos</Button>
            <input ref={inputRef} type="file" accept=".md,.markdown" multiple style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}/>
          </div>

          {files.length > 0 && (
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              background: "var(--surface)",
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-subtle)",
              }}>
                <span style={{ fontSize: 11.5, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {files.length} {files.length === 1 ? "archivo" : "archivos"}
                </span>
                <button onClick={() => setFiles([])} style={{
                  color: "var(--fg-subtle)", fontSize: 11.5, padding: 2,
                }}>Quitar todos</button>
              </div>
              {files.map((f, i) => (
                <div key={f.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px",
                  borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <Icon name="fileText" size={13} style={{ color: "var(--fg-faint)" }}/>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, flex: 1, color: "var(--fg)" }}>{f.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-subtle)" }}>
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                  <button onClick={() => removeFile(f.id)}
                    style={{ color: "var(--fg-faint)", padding: 4, display: "grid", placeItems: "center", borderRadius: 4 }}>
                    <Icon name="x" size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <Field label="Nombre del diagrama" htmlFor="dn-name">
            <Input id="dn-name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="ej. Arquitectura general"/>
          </Field>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 8,
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 8,
          }}>
            <button onClick={loadSample} style={{
              fontSize: 11.5, color: "var(--fg-subtle)",
              fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
              padding: "4px 0",
            }}>↳ cargar muestra</button>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" onClick={onBack}>Cancelar</Button>
              <Button variant="primary" icon="network" onClick={generate}
                disabled={files.length === 0 || !name.trim()}>
                Generar diagrama
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState({ progress, fileCount, phaseLabel }) {
  return (
    <div style={{
      padding: "48px 32px",
      border: "1px solid var(--border)",
      background: "var(--surface)",
      borderRadius: "var(--r-lg)",
      textAlign: "center",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--r-md)",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        display: "grid", placeItems: "center",
        margin: "0 auto 18px",
      }}>
        <Icon name="loader" size={20} strokeWidth={2}
          style={{ animation: "ca-spin 0.9s linear infinite" }}/>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.01em" }}>
        {phaseLabel || "Procesando…"}
      </div>
      <div style={{ color: "var(--fg-subtle)", margin: "4px 0 20px", fontSize: 12.5 }}>
        {fileCount} {fileCount === 1 ? "archivo" : "archivos"}
      </div>
      <div style={{
        width: 320, maxWidth: "100%", margin: "0 auto",
        height: 3, background: "var(--bg-muted)", borderRadius: 4, overflow: "hidden",
      }}>
        <div style={{
          width: `${progress}%`, height: "100%",
          background: "var(--accent)",
          transition: "width 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}/>
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        color: "var(--fg-faint)",
        letterSpacing: "0.06em",
      }}>{progress}%</div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ca-spin { to { transform: rotate(360deg) } }`}}/>
    </div>
  );
}

// =================================================================
// 2. AUTO-LAYOUT — layered (BFS by dependency depth)
// =================================================================
function autoLayout(model) {
  // Each node gets a "kind layer" base (DB→Backend→Frontend→Screens),
  // then within its kind, a sub-layer based on dep depth.
  const KIND_LAYER = { database: 0, backend: 1, flow: 2, frontend: 3, screen: 4, rules: 0 };

  // Collect all nodes flat
  const all = [];
  model.database.forEach(t => all.push({ id: `db-${t.id}`, kind: "database", data: t, deps: [] }));
  model.modules.backend.forEach(m => all.push({
    id: `mod-${m.id}`, kind: "backend", data: m,
    deps: (m.dependsOn || []).map(d => `mod-${d}`),
  }));
  model.modules.frontend.forEach(m => all.push({
    id: `mod-${m.id}`, kind: "frontend", data: m,
    deps: [
      ...(m.dependsOn || []).map(d => `mod-${d}`),
      ...(m.consumesApi || []).map(d => `mod-${d}`),
    ],
  }));
  model.screens.forEach(s => all.push({
    id: `scr-${s.id}`, kind: "screen", data: s,
    deps: [`mod-${s.module}`],
  }));
  model.flows.forEach(f => all.push({ id: `flow-${f.id}`, kind: "flow", data: f, deps: [] }));
  all.push({ id: "rules", kind: "rules", data: model.systemRules, deps: [] });

  // Group by kind into columns. Wider columns + taller rows to fit expanded nodes.
  const COL_X = { database: 80, backend: 520, flow: 520, frontend: 1000, screen: 1440, rules: 80 };
  // node heights vary; use generous gap so expanded backend/db nodes don't overlap
  const ROW_GAP = 230;
  const TOP = 80;

  const result = [];
  const groupBy = (kind) => all.filter(n => n.kind === kind);

  const place = (kind, startY = TOP, gap = ROW_GAP) => {
    const items = groupBy(kind);
    items.forEach((n, i) => {
      result.push({
        id: n.id, type: kind,
        position: { x: COL_X[kind], y: startY + i * gap },
        data: { ...n.data, kind, _model: n.data },
      });
    });
    return startY + items.length * gap;
  };

  // Heights tuned for expanded nodes (header ~46 + N rows × ~22)
  const dbBottom = place("database", TOP, 230);
  result.push({
    id: "rules", type: "rules",
    position: { x: COL_X.rules, y: dbBottom + 60 },
    data: { ...model.systemRules, kind: "rules", _model: model.systemRules, name: "Reglas del sistema" },
  });

  const backendBottom = place("backend", TOP, 220);
  groupBy("flow").forEach((n, i) => {
    result.push({
      id: n.id, type: "flow",
      position: { x: COL_X.flow, y: backendBottom + 60 + i * 140 },
      data: { ...n.data, kind: "flow", _model: n.data },
    });
  });

  place("frontend", TOP, 220);

  // Screens — line up next to their parent frontend module
  const frontendModules = model.modules.frontend;
  let screenY = TOP;
  frontendModules.forEach((m) => {
    const screensForMod = model.screens.filter(s => s.module === m.id);
    screensForMod.forEach((s) => {
      result.push({
        id: `scr-${s.id}`, type: "screen",
        position: { x: COL_X.screen, y: screenY },
        data: { ...s, kind: "screen", _model: s },
      });
      screenY += 130;
    });
    if (screensForMod.length > 0) screenY += 30;
  });

  // ---- EDGES ----------------------------------------------------
  const edges = [];
  const edgeBase = (kind) => {
    const colors = {
      "consumes":         { stroke: "var(--kind-frontend)", w: 1.4, dash: undefined, op: 0.7 },
      "uses-db":          { stroke: "var(--kind-database)", w: 1.2, dash: "3 3", op: 0.6 },
      "contains-screen":  { stroke: "var(--kind-screen)",   w: 1.1, dash: undefined, op: 0.5 },
      "navigates":        { stroke: "var(--kind-screen)",   w: 1, dash: "2 4", op: 0.4 },
      "backend-dep":      { stroke: "var(--kind-backend)",  w: 1.2, dash: "4 3", op: 0.55 },
      "frontend-dep":     { stroke: "var(--kind-frontend)", w: 1.1, dash: "4 3", op: 0.45 },
    };
    return colors[kind];
  };

  // backend → backend dependencies
  model.modules.backend.forEach((m) => {
    (m.dependsOn || []).forEach((target) => {
      const c = edgeBase("backend-dep");
      edges.push({
        id: `e-bd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "backend-dep" },
      });
    });
  });
  // frontend → frontend dependencies
  model.modules.frontend.forEach((m) => {
    (m.dependsOn || []).forEach((target) => {
      const c = edgeBase("frontend-dep");
      edges.push({
        id: `e-fd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "frontend-dep" },
      });
    });
  });

  model.modules.frontend.forEach((m) => {
    (m.consumesApi || []).forEach((target) => {
      const c = edgeBase("consumes");
      edges.push({
        id: `e-${m.id}-${target}`,
        source: `mod-${m.id}`, sourceHandle: "l",
        target: `mod-${target}`, targetHandle: "r",
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "consumes" },
      });
    });
  });
  model.modules.backend.forEach((m) => {
    (m.database || []).forEach((tableId) => {
      const c = edgeBase("uses-db");
      edges.push({
        id: `e-${m.id}-${tableId}`,
        source: `mod-${m.id}`, sourceHandle: "l",
        target: `db-${tableId}`, targetHandle: "r",
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "uses-db" },
      });
    });
  });
  model.modules.frontend.forEach((m) => {
    (m.screens || []).forEach((scrId) => {
      const c = edgeBase("contains-screen");
      edges.push({
        id: `e-${m.id}-scr-${scrId}`,
        source: `mod-${m.id}`, sourceHandle: "r",
        target: `scr-${scrId}`, targetHandle: "l",
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "contains-screen" },
      });
    });
  });
  model.screens.forEach((s) => {
    (s.navigatesTo || []).forEach((target) => {
      const c = edgeBase("navigates");
      edges.push({
        id: `e-nav-${s.id}-${target}`,
        source: `scr-${s.id}`, target: `scr-${target}`,
        type: "smoothstep",
        style: { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash },
        data: { kind: "navigates" },
      });
    });
  });

  return { nodes: result, edges };
}

// =================================================================
// 3. CANVAS CHROME
// =================================================================
function FilterChip({ kind, on, count, onToggle }) {
  const meta = NODE_META[kind];
  return (
    <button onClick={onToggle}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "0 8px", height: 24,
        background: on ? "var(--surface)" : "transparent",
        border: `1px solid ${on ? "var(--border)" : "transparent"}`,
        borderRadius: "var(--r-sm)",
        boxShadow: on ? "var(--shadow-xs)" : "none",
        color: on ? "var(--fg)" : "var(--fg-subtle)",
        fontSize: 11.5, fontWeight: 500,
        transition: "all 100ms",
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: 2,
        background: meta.color,
        opacity: on ? 1 : 0.35,
      }}/>
      {meta.label}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-faint)" }}>{count}</span>
    </button>
  );
}

function CanvasToolbar({ visible, onToggle, counts, onResetView, onFitView, onToggleMinimap, minimapOn, focusActive, onClearFocus }) {
  return (
    <div style={{
      position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
      zIndex: 5,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      padding: 4,
      display: "flex", alignItems: "center", gap: 4,
      boxShadow: "var(--shadow-md)",
    }}>
      {Object.keys(NODE_META).map((k) => (
        <FilterChip key={k} kind={k} on={visible[k]} count={counts[k] || 0}
          onToggle={() => onToggle(k)}/>
      ))}

      <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }}/>

      <button onClick={onFitView} title="Ajustar vista" style={iconBtnStyle()}>
        <Icon name="maximize" size={13}/>
      </button>
      <button onClick={onToggleMinimap} title="Minimapa" style={iconBtnStyle(minimapOn)}>
        <Icon name="layout" size={13}/>
      </button>
      {focusActive && (
        <>
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }}/>
          <button onClick={onClearFocus}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "0 8px", height: 24,
              background: "var(--accent-soft)", color: "var(--accent)",
              border: "1px solid transparent",
              borderRadius: "var(--r-sm)",
              fontSize: 11.5, fontWeight: 500,
            }}>
            <Icon name="focus" size={11}/> Salir de foco
            <kbd style={{ marginLeft: 2 }}>esc</kbd>
          </button>
        </>
      )}
    </div>
  );
}

function iconBtnStyle(active) {
  return {
    width: 24, height: 24, display: "grid", placeItems: "center",
    background: active ? "var(--bg-muted)" : "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--r-sm)",
    color: active ? "var(--fg)" : "var(--fg-subtle)",
  };
}

// ---- Legend ------------------------------------------------------
function CanvasLegend() {
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{
          position: "absolute", bottom: 12, left: 12, zIndex: 5,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          padding: "5px 9px",
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--fg-subtle)",
          letterSpacing: "0.04em", textTransform: "uppercase",
          boxShadow: "var(--shadow-xs)",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
        <Icon name="alert" size={11}/> Leyenda
      </button>
    );
  }
  return (
    <div style={{
      position: "absolute", bottom: 12, left: 12, zIndex: 5,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      boxShadow: "var(--shadow-md)",
      width: 220,
      overflow: "hidden",
    }}>
      <button onClick={() => setOpen(false)} style={{
        width: "100%", padding: "8px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        color: "var(--fg-subtle)",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        Tipos de bloque
        <Icon name="chevronDown" size={11}/>
      </button>
      <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        {Object.entries(NODE_META).map(([k, m]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: m.color, flexShrink: 0 }}/>
            <span style={{ color: "var(--fg-muted)" }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div style={{
        padding: "8px 12px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-subtle)",
        fontSize: 11, color: "var(--fg-subtle)",
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="var(--fg-muted)" strokeWidth="1.4"/></svg>
          <span>conexión directa</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="var(--fg-muted)" strokeWidth="1.4" strokeDasharray="3 3"/></svg>
          <span>uso indirecto</span>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 4. SIDE PANEL (with tabs)
// =================================================================
function SidePanel({ node, model, onClose, onSelectNode }) {
  const [tab, setTab] = React.useState("overview");
  React.useEffect(() => { setTab("overview"); }, [node?.id]);
  if (!node) return null;

  const meta = NODE_META[node.data.kind];
  const m = node.data._model;
  const kind = node.data.kind;

  // Compute connections
  const connections = computeConnections(node, model);

  const tabs = [
    { id: "overview", label: "Resumen" },
    { id: "connections", label: "Conexiones", count: connections.total },
    { id: "details", label: "Detalle" },
  ];

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 10,
      width: 380, maxWidth: "92vw",
      background: "var(--surface)",
      borderLeft: "1px solid var(--border)",
      boxShadow: "-12px 0 32px -16px rgba(0,0,0,0.10)",
      display: "flex", flexDirection: "column",
      animation: "ca-slide-in-r 200ms cubic-bezier(0.2,0.8,0.2,1)",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ca-slide-in-r { from { transform: translateX(16px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}}/>

      {/* Header */}
      <div style={{ padding: "14px 16px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "var(--r-sm)",
              background: meta.bg, color: meta.color,
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <Icon name={meta.icon} size={14}/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: meta.color,
                letterSpacing: "0.06em",
                fontWeight: 500,
                lineHeight: 1, marginBottom: 4,
              }}>{meta.label}</div>
              <h2 style={{
                fontSize: 15, fontWeight: 600,
                letterSpacing: "-0.01em", lineHeight: 1.2,
                margin: 0, color: "var(--fg)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{m.name || "Reglas del sistema"}</h2>
            </div>
          </div>
          <button onClick={onClose}
            style={{
              padding: 4, color: "var(--fg-muted)",
              display: "grid", placeItems: "center", borderRadius: 4,
              flexShrink: 0,
            }}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        {m.description && (
          <p style={{ color: "var(--fg-muted)", margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.5 }}>
            {m.description}
          </p>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "6px 8px", fontSize: 12.5,
              fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? "var(--fg)" : "var(--fg-subtle)",
              borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
              marginBottom: -1,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: tab === t.id ? "var(--fg-muted)" : "var(--fg-faint)",
                  background: tab === t.id ? "var(--bg-muted)" : "transparent",
                  padding: "0 5px", borderRadius: 3,
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {tab === "overview" && <OverviewTab node={node} m={m} model={model} onSelectNode={onSelectNode} connections={connections}/>}
        {tab === "connections" && <ConnectionsTab connections={connections} onSelectNode={onSelectNode}/>}
        {tab === "details" && <DetailsTab node={node} m={m} model={model}/>}
      </div>
    </div>
  );
}

function computeConnections(node, model) {
  const m = node.data._model;
  const kind = node.data.kind;
  const connections = { incoming: [], outgoing: [], total: 0 };

  const pushOut = (id, label, type, viaLabel) => {
    connections.outgoing.push({ id, label, type, viaLabel });
  };
  const pushIn = (id, label, type, viaLabel) => {
    connections.incoming.push({ id, label, type, viaLabel });
  };

  if (kind === "backend") {
    (m.database || []).forEach(t => {
      const tab = model.database.find(x => x.id === t);
      if (tab) pushOut(`db-${t}`, tab.name, "database", "usa tabla");
    });
    (m.dependsOn || []).forEach(d => {
      const dep = model.modules.backend.find(x => x.id === d);
      if (dep) pushOut(`mod-${d}`, dep.name, "backend", "depende de");
    });
    // who consumes me?
    model.modules.frontend.forEach(f => {
      if ((f.consumesApi || []).includes(m.id)) {
        pushIn(`mod-${f.id}`, f.name, "frontend", "consume API");
      }
    });
    model.modules.backend.forEach(b => {
      if ((b.dependsOn || []).includes(m.id)) {
        pushIn(`mod-${b.id}`, b.name, "backend", "depende de");
      }
    });
  } else if (kind === "frontend") {
    (m.screens || []).forEach(s => {
      const scr = model.screens.find(x => x.id === s);
      if (scr) pushOut(`scr-${s}`, scr.name, "screen", "contiene pantalla");
    });
    (m.consumesApi || []).forEach(b => {
      const back = model.modules.backend.find(x => x.id === b);
      if (back) pushOut(`mod-${b}`, back.name, "backend", "consume API");
    });
    (m.dependsOn || []).forEach(d => {
      const dep = model.modules.frontend.find(x => x.id === d);
      if (dep) pushOut(`mod-${d}`, dep.name, "frontend", "depende de");
    });
    model.modules.frontend.forEach(f => {
      if ((f.dependsOn || []).includes(m.id)) {
        pushIn(`mod-${f.id}`, f.name, "frontend", "depende de");
      }
    });
  } else if (kind === "screen") {
    const parent = model.modules.frontend.find(f => f.id === m.module);
    if (parent) pushIn(`mod-${parent.id}`, parent.name, "frontend", "pertenece a");
    (m.navigatesTo || []).forEach(s => {
      const to = model.screens.find(x => x.id === s);
      if (to) pushOut(`scr-${s}`, to.name, "screen", "navega a");
    });
    model.screens.forEach(s => {
      if ((s.navigatesTo || []).includes(m.id)) {
        pushIn(`scr-${s.id}`, s.name, "screen", "navega desde");
      }
    });
  } else if (kind === "database") {
    model.modules.backend.forEach(b => {
      if ((b.database || []).includes(m.id)) {
        pushIn(`mod-${b.id}`, b.name, "backend", "usa tabla");
      }
    });
    (m.relations || []).forEach(r => {
      const tab = model.database.find(x => x.id === r.target);
      if (tab) pushOut(`db-${r.target}`, tab.name, "database", r.type);
    });
  } else if (kind === "flow") {
    (m.modules || []).forEach(mid => {
      const back = model.modules.backend.find(x => x.id === mid);
      const front = model.modules.frontend.find(x => x.id === mid);
      const found = back || front;
      if (found) pushOut(`mod-${mid}`, found.name, back ? "backend" : "frontend", "usa módulo");
    });
    (m.screens || []).forEach(s => {
      const scr = model.screens.find(x => x.id === s);
      if (scr) pushOut(`scr-${s}`, scr.name, "screen", "pasa por");
    });
    (m.database || []).forEach(t => {
      const tab = model.database.find(x => x.id === t);
      if (tab) pushOut(`db-${t}`, tab.name, "database", "toca tabla");
    });
  }

  connections.total = connections.incoming.length + connections.outgoing.length;
  return connections;
}

function OverviewTab({ node, m, model, onSelectNode, connections }) {
  const kind = node.data.kind;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {kind === "backend" && (
          <>
            <Stat label="endpoints" value={m.api?.length || 0}/>
            <Stat label="tablas usadas" value={m.database?.length || 0}/>
          </>
        )}
        {kind === "frontend" && (
          <>
            <Stat label="pantallas" value={m.screens?.length || 0}/>
            <Stat label="APIs consumidas" value={m.consumesApi?.length || 0}/>
          </>
        )}
        {kind === "screen" && (
          <>
            <Stat label="ruta" value={m.route || "—"} mono/>
            <Stat label="auth" value={m.requiresAuth ? "sí" : "no"}/>
          </>
        )}
        {kind === "database" && (
          <>
            <Stat label="columnas" value={m.fields?.length || 0}/>
            <Stat label="relaciones" value={m.relations?.length || 0}/>
          </>
        )}
        {kind === "flow" && (
          <>
            <Stat label="pasos" value={m.steps?.length || 0}/>
            <Stat label="módulos" value={m.modules?.length || 0}/>
          </>
        )}
        {kind === "rules" && (
          <>
            <Stat label="auth" value={m.auth?.length || 0}/>
            <Stat label="navegación" value={m.navigation?.length || 0}/>
          </>
        )}
      </div>

      {/* Highlight: top connections */}
      {connections.total > 0 && (
        <div>
          <SectionHeader>Conexiones principales</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[...connections.outgoing.slice(0, 3), ...connections.incoming.slice(0, 3 - connections.outgoing.slice(0, 3).length)].map((c, i) => (
              <ConnectionRow key={i} c={c} dir={connections.outgoing.includes(c) ? "out" : "in"} onClick={() => onSelectNode(c.id)}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionsTab({ connections, onSelectNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {connections.outgoing.length > 0 && (
        <div>
          <SectionHeader count={connections.outgoing.length}>Saliente</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {connections.outgoing.map((c, i) => (
              <ConnectionRow key={i} c={c} dir="out" onClick={() => onSelectNode(c.id)}/>
            ))}
          </div>
        </div>
      )}
      {connections.incoming.length > 0 && (
        <div>
          <SectionHeader count={connections.incoming.length}>Entrante</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {connections.incoming.map((c, i) => (
              <ConnectionRow key={i} c={c} dir="in" onClick={() => onSelectNode(c.id)}/>
            ))}
          </div>
        </div>
      )}
      {connections.total === 0 && (
        <div style={{ color: "var(--fg-subtle)", fontSize: 12.5, textAlign: "center", padding: "32px 16px" }}>
          No tiene conexiones registradas.
        </div>
      )}
    </div>
  );
}

function ConnectionRow({ c, dir, onClick }) {
  const meta = NODE_META[c.type];
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "7px 9px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      textAlign: "left", width: "100%",
      transition: "border-color 100ms, background 100ms",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-subtle)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
      <div style={{
        width: 20, height: 20, borderRadius: 4,
        background: meta.bg, color: meta.color,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <Icon name={meta.icon} size={11}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--fg)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {c.label}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
          {dir === "out" ? "→" : "←"} {c.viaLabel}
        </div>
      </div>
      <Icon name="arrowRight" size={11} style={{ color: "var(--fg-faint)", flexShrink: 0 }}/>
    </button>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div style={{
      padding: "8px 10px",
      background: "var(--bg-subtle)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--r-sm)",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        color: "var(--fg-subtle)",
        letterSpacing: "0.06em", textTransform: "uppercase",
        marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontSize: 16, fontWeight: 600,
        color: "var(--fg)",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        letterSpacing: mono ? 0 : "-0.01em",
        lineHeight: 1.1,
      }}>{value}</div>
    </div>
  );
}

function SectionHeader({ children, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "var(--font-mono)", fontSize: 10,
      color: "var(--fg-subtle)",
      letterSpacing: "0.08em", textTransform: "uppercase",
      marginBottom: 8,
    }}>
      <span>{children}</span>
      {count !== undefined && <span style={{ color: "var(--fg-faint)" }}>{count}</span>}
    </div>
  );
}

function DetailsTab({ node, m, model }) {
  const kind = node.data.kind;
  if (kind === "backend") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {m.api && m.api.length > 0 && (
          <div>
            <SectionHeader count={m.api.length}>Endpoints</SectionHeader>
            <CodeList items={m.api}/>
          </div>
        )}
      </div>
    );
  }
  if (kind === "frontend") {
    const screens = (m.screens || []).map(id => model.screens.find(s => s.id === id)).filter(Boolean);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {screens.length > 0 && (
          <div>
            <SectionHeader count={screens.length}>Pantallas</SectionHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {screens.map(s => (
                <div key={s.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px",
                  background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--r-sm)", fontSize: 12.5,
                }}>
                  <span style={{ color: "var(--fg)", fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-subtle)" }}>{s.route}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  if (kind === "screen") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <SectionHeader>Ruta</SectionHeader>
          <CodeList items={[m.route]}/>
        </div>
        <div>
          <SectionHeader>Autenticación</SectionHeader>
          <Badge color={m.requiresAuth ? "backend" : "warning"} icon={m.requiresAuth ? "lock" : "external"}>
            {m.requiresAuth ? "Requiere login" : "Pública"}
          </Badge>
        </div>
      </div>
    );
  }
  if (kind === "database") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <SectionHeader count={m.fields.length}>Esquema</SectionHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={tableHeadStyle()}>Campo</th>
                <th style={tableHeadStyle()}>Tipo</th>
                <th style={tableHeadStyle("right")}>Mod</th>
              </tr>
            </thead>
            <tbody>
              {m.fields.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "6px 0", color: "var(--fg)", fontWeight: f.pk ? 600 : 400 }}>
                    {f.pk && <span style={{ color: "var(--accent)", marginRight: 4 }}>★</span>}
                    {f.name}
                  </td>
                  <td style={{ padding: "6px 0", color: "var(--fg-muted)" }}>{f.type}</td>
                  <td style={{ padding: "6px 0", color: "var(--fg-subtle)", textAlign: "right" }}>
                    {f.pk ? "PK" : f.fk ? "FK" : f.unique ? "UQ" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {m.relations && m.relations.length > 0 && (
          <div>
            <SectionHeader>Relaciones</SectionHeader>
            <CodeList items={m.relations.map(r => `${r.type} → ${r.target} (${r.field})`)}/>
          </div>
        )}
      </div>
    );
  }
  if (kind === "flow") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <SectionHeader>Disparador</SectionHeader>
          <p style={{ margin: 0, fontSize: 13, color: "var(--fg)", lineHeight: 1.5 }}>{m.trigger}</p>
        </div>
        <div>
          <SectionHeader count={m.steps.length}>Pasos</SectionHeader>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {m.steps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 9 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--kind-flow-bg)", color: "var(--kind-flow)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600,
                  flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: 12.5, color: "var(--fg)", paddingTop: 2, lineHeight: 1.45 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }
  if (kind === "rules") {
    const groups = [
      { label: "Autenticación", items: m.auth },
      { label: "Navegación", items: m.navigation },
      { label: "Convenciones", items: m.conventions },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map(g => g.items?.length > 0 && (
          <div key={g.label}>
            <SectionHeader count={g.items.length}>{g.label}</SectionHeader>
            <ul style={{ margin: 0, paddingLeft: 16, color: "var(--fg)", fontSize: 12.5, lineHeight: 1.55, display: "flex", flexDirection: "column", gap: 4 }}>
              {g.items.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function tableHeadStyle(align = "left") {
  return {
    textAlign: align,
    padding: "6px 0",
    color: "var(--fg-subtle)",
    fontWeight: 500,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontFamily: "var(--font-mono)",
  };
}

function CodeList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          fontFamily: "var(--font-mono)", fontSize: 11.5,
          padding: "5px 9px",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--r-sm)",
          color: "var(--fg)",
        }}>{it}</div>
      ))}
    </div>
  );
}

// =================================================================
// 5. DIAGRAM VIEW SCREEN
// =================================================================
function DiagramViewInner({ diagram, project, onBack, theme, onToggleTheme }) {
  const built = React.useMemo(() => autoLayout(diagram.data), [diagram]);
  const seededNodes = React.useMemo(() => built.nodes.map(n => ({
    ...n,
    width: n.type === "screen" || n.type === "database" ? 190 : 200,
    height: 56,
  })), [built]);

  const [nodes, setNodes, onNodesChange] = useNodesState(seededNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);
  const [selectedId, setSelectedId] = React.useState(null);
  const [minimapOn, setMinimapOn] = React.useState(true);
  const [visible, setVisible] = React.useState({
    backend: true, frontend: true, screen: true,
    database: true, flow: true, rules: true,
  });

  const rf = useReactFlow();
  const counts = React.useMemo(() => {
    const c = { backend: 0, frontend: 0, screen: 0, database: 0, flow: 0, rules: 0 };
    nodes.forEach(n => { c[n.data.kind] = (c[n.data.kind] || 0) + 1; });
    return c;
  }, [nodes]);

  const selectedNode = nodes.find(n => n.id === selectedId);

  // Compute focus set (ids of nodes related to selected)
  const focusSet = React.useMemo(() => {
    if (!selectedId) return null;
    const set = new Set([selectedId]);
    edges.forEach(e => {
      if (e.source === selectedId) set.add(e.target);
      if (e.target === selectedId) set.add(e.source);
    });
    return set;
  }, [selectedId, edges]);

  const filteredNodes = React.useMemo(
    () => nodes.map(n => ({
      ...n,
      hidden: !visible[n.data.kind],
      selected: n.id === selectedId,
      className: focusSet ? (focusSet.has(n.id) ? "rf-active" : "") : "",
    })),
    [nodes, visible, selectedId, focusSet]
  );
  const filteredEdges = React.useMemo(
    () => edges.map(e => {
      const src = nodes.find(n => n.id === e.source);
      const tgt = nodes.find(n => n.id === e.target);
      const hidden = !src || !tgt || !visible[src.data.kind] || !visible[tgt.data.kind];
      const isActive = focusSet ? (focusSet.has(e.source) && focusSet.has(e.target)) : false;
      return { ...e, hidden, className: isActive ? "rf-edge-active" : "" };
    }),
    [edges, nodes, visible, focusSet]
  );

  const toggleFilter = (k) => setVisible(v => ({ ...v, [k]: !v[k] }));

  // Esc clears selection
  React.useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape" && selectedId) { setSelectedId(null); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [selectedId]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--bg-canvas)" }}
      className={focusSet ? "rf-dim" : ""}>
      {/* Top bar with back + title */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 48,
        zIndex: 6,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        padding: "0 12px",
        gap: 12,
      }}>
        <button onClick={onBack} title="Volver al proyecto"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 28, padding: "0 10px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            color: "var(--fg-muted)",
            fontSize: 12, fontWeight: 500,
            transition: "background 100ms, color 100ms, border-color 100ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--fg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}>
          <Icon name="arrowLeft" size={13}/>
          Volver
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "var(--fg-subtle)",
          fontFamily: "var(--font-mono)",
          minWidth: 0, flex: 1,
        }}>
          <span style={{ color: "var(--fg-faint)" }}>{project?.name}</span>
          <span style={{ color: "var(--fg-faint)" }}>/</span>
          <span style={{
            color: "var(--fg)", fontWeight: 500,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{diagram.name}</span>
        </div>

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--fg-subtle)",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {nodes.length} bloques · {edges.length} conexiones
        </div>
      </div>

      <div style={{ position: "absolute", top: 48, left: 0, right: 0, bottom: 0 }}>
      <CanvasToolbar
        visible={visible} onToggle={toggleFilter} counts={counts}
        onFitView={() => rf.fitView({ padding: 0.12, duration: 400 })}
        onResetView={() => rf.setViewport({ x: 0, y: 0, zoom: 0.6 }, { duration: 400 })}
        onToggleMinimap={() => setMinimapOn(v => !v)}
        minimapOn={minimapOn}
        focusActive={!!focusSet}
        onClearFocus={() => setSelectedId(null)}
      />

      <CanvasLegend/>

      <RFCanvas
        style={{ width: "100%", height: "100%" }}
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, n) => setSelectedId(n.id)}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={{ padding: 0.14, maxZoom: 0.9, minZoom: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.55 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background gap={24} size={1} color="var(--border)" variant="dots"/>
        <Controls position="bottom-right" showInteractive={false}/>
        {minimapOn && (
          <MiniMap
            position="top-right"
            style={{ width: 160, height: 100, marginTop: 60, marginRight: 12 }}
            nodeColor={(n) => NODE_META[n.data?.kind]?.color || "#888"}
            maskColor="rgba(0,0,0,0.04)"
            pannable zoomable
          />
        )}
      </RFCanvas>

      <SidePanel
        node={selectedNode}
        model={diagram.data}
        onClose={() => setSelectedId(null)}
        onSelectNode={(id) => setSelectedId(id)}
      />
      </div>
    </div>
  );
}

function DiagramViewScreen(props) {
  return (
    <ReactFlowProvider>
      <DiagramViewInner {...props}/>
    </ReactFlowProvider>
  );
}

Object.assign(window, { DiagramNewScreen, DiagramViewScreen, autoLayout });
