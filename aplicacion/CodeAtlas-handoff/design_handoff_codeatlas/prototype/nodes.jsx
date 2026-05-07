/* ============================================================
   CodeAtlas v2 — Custom React Flow nodes
   Expanded nodes: backend shows endpoints, frontend shows screens,
   screen shows route, db shows columns.
   ============================================================ */

const { Handle, Position } = window.ReactFlow;

const NODE_META = {
  backend:  { label: "backend",   icon: "server",   color: "var(--kind-backend)",  bg: "var(--kind-backend-bg)"  },
  frontend: { label: "frontend",  icon: "panel",    color: "var(--kind-frontend)", bg: "var(--kind-frontend-bg)" },
  screen:   { label: "screen",    icon: "monitor",  color: "var(--kind-screen)",   bg: "var(--kind-screen-bg)"   },
  database: { label: "db",        icon: "database", color: "var(--kind-database)", bg: "var(--kind-database-bg)" },
  flow:     { label: "flow",      icon: "workflow", color: "var(--kind-flow)",     bg: "var(--kind-flow-bg)"     },
  rules:    { label: "rules",     icon: "shield",   color: "var(--kind-rules)",    bg: "var(--kind-rules-bg)"    },
};

const HANDLE_STYLE = { opacity: 0, width: 6, height: 6 };

function NodeHeader({ kind, title, subtitle, count, countLabel }) {
  const meta = NODE_META[kind];
  return (
    <div style={{
      padding: "9px 11px",
      display: "flex", alignItems: "center", gap: 9,
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        background: meta.bg, color: meta.color,
        display: "grid", placeItems: "center",
        flexShrink: 0,
      }}>
        <Icon name={meta.icon} size={13} strokeWidth={2}/>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          color: meta.color,
          letterSpacing: "0.06em",
          fontWeight: 500,
          lineHeight: 1, marginBottom: 2,
        }}>
          {meta.label}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: "var(--fg)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          lineHeight: 1.2,
        }}>{title}</div>
      </div>
      {count !== undefined && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--fg-subtle)",
          background: "var(--bg-muted)",
          padding: "1px 6px",
          borderRadius: 4,
          flexShrink: 0,
        }} title={countLabel}>{count}</div>
      )}
    </div>
  );
}

function NodeShell({ children, selected, kind, width = 240 }) {
  const meta = NODE_META[kind];
  return (
    <div style={{
      width,
      background: "var(--surface)",
      border: `1px solid ${selected ? meta.color : "var(--border)"}`,
      borderRadius: "var(--r-md)",
      boxShadow: selected
        ? `0 0 0 3px ${meta.color}28, var(--shadow-md)`
        : "var(--shadow-sm)",
      overflow: "hidden",
      transition: "border-color 100ms, box-shadow 100ms",
      fontFamily: "var(--font-sans)",
      cursor: "pointer",
    }}>
      {children}
    </div>
  );
}

function DetailRow({ children, mono = true, accent }) {
  return (
    <div style={{
      padding: "5px 11px",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: 10.5,
      color: accent || "var(--fg-muted)",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      lineHeight: 1.35,
      borderTop: "1px solid var(--border-subtle)",
    }}>{children}</div>
  );
}

function MoreRow({ count }) {
  return (
    <div style={{
      padding: "4px 11px 6px",
      fontFamily: "var(--font-mono)", fontSize: 10,
      color: "var(--fg-faint)",
      letterSpacing: "0.04em",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--bg-subtle)",
    }}>+ {count} más</div>
  );
}

function MethodTag({ method }) {
  const colors = {
    GET:    "var(--kind-frontend)",
    POST:   "var(--kind-backend)",
    PUT:    "var(--kind-flow)",
    PATCH:  "var(--kind-flow)",
    DELETE: "#dc2626",
  };
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 9,
      fontWeight: 600,
      color: colors[method] || "var(--fg-subtle)",
      letterSpacing: "0.04em",
      display: "inline-block",
      width: 38,
      flexShrink: 0,
    }}>{method}</span>
  );
}

const HandleSet = () => (
  <>
    <Handle type="target" position={Position.Top} style={HANDLE_STYLE}/>
    <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE}/>
    <Handle type="target" position={Position.Left} style={HANDLE_STYLE} id="l"/>
    <Handle type="source" position={Position.Right} style={HANDLE_STYLE} id="r"/>
  </>
);

// ---------- BACKEND: shows API endpoints ----------
function BackendNode({ data, selected }) {
  const apis = data.api || [];
  const MAX = 5;
  const shown = apis.slice(0, MAX);
  const rest = apis.length - shown.length;
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="backend" width={250}>
        <NodeHeader kind="backend" title={data.name}
          count={apis.length} countLabel="endpoints"/>
        {shown.map((endpoint, i) => {
          const parts = endpoint.split(" ");
          const method = parts[0];
          const path = parts.slice(1).join(" ");
          return (
            <div key={i} style={{
              padding: "4px 11px",
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-mono)", fontSize: 10.5,
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              lineHeight: 1.35,
            }}>
              <MethodTag method={method}/>
              <span style={{
                color: "var(--fg-muted)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                flex: 1,
              }}>{path}</span>
            </div>
          );
        })}
        {rest > 0 && <MoreRow count={rest}/>}
      </NodeShell>
    </>
  );
}

// ---------- FRONTEND: shows screen names ----------
function FrontendNode({ data, selected }) {
  const screens = data.screens || [];
  const MAX = 5;
  const shown = screens.slice(0, MAX);
  const rest = screens.length - shown.length;
  // map id -> friendly name from window data if available
  const allScreens = window.CA_DATA?.diagrams?.[0]?.data?.screens || [];
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="frontend" width={230}>
        <NodeHeader kind="frontend" title={data.name}
          count={screens.length} countLabel="pantallas"/>
        {shown.map((sid, i) => {
          const scr = allScreens.find(s => s.id === sid);
          return (
            <div key={i} style={{
              padding: "4px 11px",
              display: "flex", alignItems: "center", gap: 7,
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              lineHeight: 1.35,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--kind-screen)", flexShrink: 0 }}/>
              <span style={{ fontSize: 11, color: "var(--fg)", fontWeight: 500, flexShrink: 0 }}>
                {scr?.name || sid}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--fg-faint)",
                marginLeft: "auto",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{scr?.route || ""}</span>
            </div>
          );
        })}
        {rest > 0 && <MoreRow count={rest}/>}
      </NodeShell>
    </>
  );
}

// ---------- SCREEN: shows route + auth ----------
function ScreenNode({ data, selected }) {
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="screen" width={220}>
        <NodeHeader kind="screen" title={data.name}/>
        <DetailRow>
          <span style={{ color: "var(--kind-screen)", marginRight: 6 }}>→</span>
          {data.route}
        </DetailRow>
        {data.requiresAuth !== undefined && (
          <div style={{
            padding: "4px 11px 6px",
            fontFamily: "var(--font-mono)", fontSize: 9.5,
            color: "var(--fg-subtle)",
            letterSpacing: "0.06em", textTransform: "uppercase",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Icon name={data.requiresAuth ? "lock" : "external"} size={9}/>
            {data.requiresAuth ? "auth" : "pública"}
          </div>
        )}
      </NodeShell>
    </>
  );
}

// ---------- DATABASE: shows all columns ----------
function DatabaseNode({ data, selected }) {
  const fields = data.fields || [];
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="database" width={230}>
        <NodeHeader kind="database" title={data.name}
          count={fields.length} countLabel="columnas"/>
        {fields.map((f, i) => (
          <div key={i} style={{
            padding: "4px 11px",
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
            lineHeight: 1.35,
          }}>
            <span style={{
              width: 14,
              fontSize: 9,
              fontWeight: 600,
              color: f.pk ? "var(--accent)" : f.fk ? "var(--kind-frontend)" : "var(--fg-faint)",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}>{f.pk ? "PK" : f.fk ? "FK" : f.unique ? "UQ" : ""}</span>
            <span style={{
              color: "var(--fg)",
              fontWeight: f.pk ? 600 : 400,
              flex: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{f.name}</span>
            <span style={{ color: "var(--fg-faint)", flexShrink: 0 }}>{f.type}</span>
          </div>
        ))}
      </NodeShell>
    </>
  );
}

// ---------- FLOW: shows step count + first 2 ----------
function FlowNode({ data, selected }) {
  const steps = data.steps || [];
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="flow" width={240}>
        <NodeHeader kind="flow" title={data.name}
          count={steps.length} countLabel="pasos"/>
        {data.trigger && (
          <DetailRow mono={false} accent="var(--fg-muted)">
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: "var(--kind-flow)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginRight: 6,
            }}>trigger</span>
            {data.trigger}
          </DetailRow>
        )}
      </NodeShell>
    </>
  );
}

// ---------- RULES ----------
function RulesNode({ data, selected }) {
  const total = (data.auth?.length || 0) + (data.navigation?.length || 0) + (data.conventions?.length || 0);
  return (
    <>
      <HandleSet/>
      <NodeShell selected={selected} kind="rules" width={220}>
        <NodeHeader kind="rules" title="Reglas del sistema"
          count={total} countLabel="reglas"/>
        {data.auth?.length > 0 && (
          <DetailRow>
            <span style={{ color: "var(--kind-rules)", marginRight: 6 }}>auth</span>
            <span style={{ color: "var(--fg-faint)" }}>{data.auth.length} reglas</span>
          </DetailRow>
        )}
        {data.navigation?.length > 0 && (
          <DetailRow>
            <span style={{ color: "var(--kind-rules)", marginRight: 6 }}>nav</span>
            <span style={{ color: "var(--fg-faint)" }}>{data.navigation.length} reglas</span>
          </DetailRow>
        )}
        {data.conventions?.length > 0 && (
          <DetailRow>
            <span style={{ color: "var(--kind-rules)", marginRight: 6 }}>conv</span>
            <span style={{ color: "var(--fg-faint)" }}>{data.conventions.length} reglas</span>
          </DetailRow>
        )}
      </NodeShell>
    </>
  );
}

const NODE_TYPES = {
  backend: BackendNode,
  frontend: FrontendNode,
  screen: ScreenNode,
  database: DatabaseNode,
  flow: FlowNode,
  rules: RulesNode,
};

Object.assign(window, { NODE_META, NODE_TYPES });
