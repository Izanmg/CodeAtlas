/* ============================================================
   CodeAtlas v2 — Dashboard, Project detail, New project, Settings
   ============================================================ */

// -- App shell (Topbar + main) -----------------------------------
function AppShell({ current, onNav, theme, onToggleTheme, user, onLogout, breadcrumbs, onCommand, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "var(--bg)" }}>
      <Topbar current={current} onNav={onNav}
        theme={theme} onToggleTheme={onToggleTheme}
        user={user} onLogout={onLogout}
        breadcrumbs={breadcrumbs}
        onCommand={onCommand}/>
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

// -- Time formatter ----------------------------------------------
function timeAgo(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`;
  if (diff < 86400 * 7) return `hace ${Math.floor(diff/86400)} d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

// -- Project mini-thumbnail ---------------------------------------
function ProjectThumb({ project }) {
  const seed = project.id.charCodeAt(2) + project.id.charCodeAt(4);
  const variants = [
    { positions: [[20,30],[55,18],[88,30],[40,55],[72,55],[55,82]], links: [[0,1],[1,2],[0,3],[2,4],[3,4],[3,5],[4,5]] },
    { positions: [[18,25],[18,55],[18,82],[55,25],[55,55],[55,82],[88,55]], links: [[0,3],[1,4],[2,5],[3,6],[4,6],[5,6]] },
    { positions: [[20,50],[40,25],[60,50],[40,75],[80,25],[80,75]], links: [[0,1],[1,2],[2,3],[3,0],[1,4],[2,4],[2,5],[3,5]] },
  ];
  const v = variants[seed % variants.length];
  const colors = [
    "var(--kind-backend)", "var(--kind-frontend)", "var(--kind-screen)",
    "var(--kind-database)", "var(--kind-flow)", "var(--kind-rules)",
  ];

  return (
    <div className="dot-canvas" style={{
      width: "100%", height: 96,
      background: "var(--bg-subtle)",
      borderRadius: "var(--r-md)",
      border: "1px solid var(--border-subtle)",
      position: "relative", overflow: "hidden",
    }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <g stroke="var(--border-strong)" strokeWidth="0.4" opacity="0.7" fill="none">
          {v.links.map(([a, b], i) => {
            const [x1, y1] = v.positions[a];
            const [x2, y2] = v.positions[b];
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
          })}
        </g>
        {v.positions.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.4" fill={colors[(i + seed) % colors.length]}/>
            <circle cx={x} cy={y} r="3.4" fill={colors[(i + seed) % colors.length]} opacity="0.18" transform={`scale(2) translate(${-x/2} ${-y/2})`}/>
          </g>
        ))}
      </svg>
    </div>
  );
}

// -- Empty thumb (no diagrams) ------------------------------------
function EmptyThumb() {
  return (
    <div style={{
      width: "100%", height: 96,
      background: "var(--bg-subtle)",
      borderRadius: "var(--r-md)",
      border: "1px dashed var(--border-strong)",
      display: "grid", placeItems: "center",
      color: "var(--fg-faint)",
      fontFamily: "var(--font-mono)", fontSize: 10.5,
      letterSpacing: "0.06em",
    }}>
      sin diagramas
    </div>
  );
}

// -- Section label ------------------------------------------------
function SectionLabel({ children, count, action, style }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10.5, fontWeight: 500,
      color: "var(--fg-subtle)",
      letterSpacing: "0.06em", textTransform: "uppercase",
      marginBottom: 12,
      display: "flex", alignItems: "center", gap: 10,
      ...style,
    }}>
      <span>{children}</span>
      {count !== undefined && <span style={{ color: "var(--fg-faint)" }}>{count}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}/>
      {action}
    </div>
  );
}

// -- Stat ---------------------------------------------------------
function StatBlock({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--fg-subtle)",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

// =================================================================
// DASHBOARD
// =================================================================
function DashboardScreen({ user, projects, diagrams, onOpenProject, onNewProject, onOpenDiagram }) {
  const [filter, setFilter] = React.useState("");
  const filtered = projects.filter((p) =>
    !filter || p.name.toLowerCase().includes(filter.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(filter.toLowerCase())
  );
  const pinned = filtered.filter((p) => p.pinned);
  const rest = filtered.filter((p) => !p.pinned);

  const recentDiagrams = [...diagrams]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const totalDiagrams = diagrams.length;
  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1240, margin: "0 auto" }}>
      <PageHeader
        eyebrow={`hola, ${firstName.toLowerCase()}`}
        title="Tus proyectos"
        description="Cada proyecto agrupa los diagramas generados a partir de tu documentación markdown."
        actions={
          <>
            <div style={{ width: 220 }}>
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar proyectos…" icon="search"/>
            </div>
            <Button variant="primary" icon="plus" size="md" onClick={onNewProject}>Nuevo proyecto</Button>
          </>
        }
      />

      {/* Stats strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        marginBottom: 28,
        overflow: "hidden",
      }}>
        <StatCell label="Proyectos" value={projects.length} icon="folder" iconColor="var(--accent)"/>
        <StatCell label="Diagramas" value={totalDiagrams} icon="network" iconColor="var(--kind-backend)"/>
        <StatCell label="Última actividad" value={projects[0] ? timeAgo(projects[0].updatedAt) : "—"} icon="alert" iconColor="var(--kind-flow)"/>
        <StatCell label="Plan" value="Pro" icon="check" iconColor="var(--success)"/>
      </div>

      {pinned.length > 0 && (
        <>
          <SectionLabel count={pinned.length}>Fijados</SectionLabel>
          <ProjectGrid projects={pinned} onOpen={onOpenProject}/>
        </>
      )}

      {rest.length > 0 && (
        <>
          <SectionLabel count={rest.length} style={{ marginTop: pinned.length ? 28 : 0 }}>Todos los proyectos</SectionLabel>
          <ProjectGrid projects={rest} onOpen={onOpenProject}/>
        </>
      )}

      {recentDiagrams.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 32 }}>Diagramas recientes</SectionLabel>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}>
            {recentDiagrams.map((d, i) => {
              const proj = projects.find(p => p.id === d.projectId);
              return (
                <button key={d.id} onClick={() => onOpenDiagram(d)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
                  textAlign: "left",
                  transition: "background 100ms",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "var(--r-sm)",
                    background: "var(--accent-soft)", color: "var(--accent)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <Icon name="network" size={14}/>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>
                      <span style={{ fontFamily: "var(--font-mono)" }}>{proj?.name}</span> · {timeAgo(d.createdAt)}
                    </div>
                  </div>
                  <Icon name="arrowRight" size={13} style={{ color: "var(--fg-faint)" }}/>
                </button>
              );
            })}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div style={{
          padding: 60, textAlign: "center",
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--r-md)",
          color: "var(--fg-muted)",
        }}>
          No hay proyectos que coincidan con <span className="mono" style={{ color: "var(--fg)" }}>"{filter}"</span>.
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value, icon, iconColor }) {
  return (
    <div style={{
      padding: "14px 18px",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--r-sm)",
        background: "var(--bg-muted)", color: iconColor,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={15}/>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          color: "var(--fg-subtle)",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </div>
    </div>
  );
}

function ProjectGrid({ projects, onOpen }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
      {projects.map((p) => <ProjectCard key={p.id} project={p} onClick={() => onOpen(p)}/>)}
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <Card hoverable onClick={onClick} padding={14}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {project.diagramCount > 0 ? <ProjectThumb project={project}/> : <EmptyThumb/>}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, margin: 0,
            letterSpacing: "-0.01em", color: "var(--fg)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            flex: 1,
          }}>{project.name}</h3>
          {project.pinned && (
            <span style={{ color: "var(--accent)", display: "flex" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9 9 2 9 7 14 5 22 12 18 19 22 17 14 22 9 15 9z"/></svg>
            </span>
          )}
        </div>
        <p style={{
          fontSize: 12.5, color: "var(--fg-muted)",
          margin: 0, lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", minHeight: 36,
        }}>{project.description}</p>
      </div>
      <div style={{
        paddingTop: 9,
        borderTop: "1px solid var(--border-subtle)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--fg-subtle)",
        letterSpacing: "0.02em",
      }}>
        <span>{project.diagramCount} {project.diagramCount === 1 ? "diagrama" : "diagramas"}</span>
        <span>{timeAgo(project.updatedAt)}</span>
      </div>
    </Card>
  );
}

// =================================================================
// PROJECT DETAIL
// =================================================================
function ProjectDetailScreen({ project, diagrams, onBack, onOpenDiagram, onNewDiagram }) {
  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1240, margin: "0 auto" }}>
      <PageHeader
        eyebrow={<span className="mono">{project.id}</span>}
        title={project.name}
        description={project.description}
        actions={
          <Button variant="primary" icon="plus" size="md" onClick={onNewDiagram}>
            Nuevo diagrama
          </Button>
        }
      />

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        marginBottom: 28,
        overflow: "hidden",
      }}>
        <StatCell label="Diagramas" value={diagrams.length} icon="network" iconColor="var(--kind-backend)"/>
        <StatCell label="Última modif." value={timeAgo(project.updatedAt)} icon="alert" iconColor="var(--kind-flow)"/>
        <StatCell label="Creado" value={new Date(project.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })} icon="folder" iconColor="var(--accent)"/>
      </div>

      <SectionLabel count={diagrams.length}>Diagramas</SectionLabel>

      {diagrams.length === 0 ? (
        <EmptyState
          icon="upload"
          title="Aún no hay diagramas"
          description="Sube tus archivos .md de documentación para generar el primer diagrama de este proyecto."
          action={<Button variant="primary" icon="upload" onClick={onNewDiagram}>Subir documentación</Button>}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {diagrams.map((d) => <DiagramCard key={d.id} diagram={d} onClick={() => onOpenDiagram(d)}/>)}
        </div>
      )}
    </div>
  );
}

function DiagramCard({ diagram, onClick }) {
  const stats = React.useMemo(() => {
    const d = diagram.data;
    return {
      modules: (d.modules.backend.length + d.modules.frontend.length),
      screens: d.screens.length,
      tables: d.database.length,
      flows: d.flows.length,
    };
  }, [diagram]);
  return (
    <Card hoverable onClick={onClick} padding={14} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DiagramThumb diagram={diagram}/>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px", letterSpacing: "-0.01em", color: "var(--fg)" }}>{diagram.name}</h3>
        <p style={{ fontSize: 12.5, color: "var(--fg-muted)", margin: 0, lineHeight: 1.5 }}>{diagram.description}</p>
      </div>
      <div style={{
        paddingTop: 9,
        borderTop: "1px solid var(--border-subtle)",
        display: "flex", gap: 12,
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--fg-subtle)",
        letterSpacing: "0.02em",
      }}>
        <DCStat n={stats.modules} l="mod"/>
        <DCStat n={stats.screens} l="scr"/>
        <DCStat n={stats.tables} l="db"/>
        <DCStat n={stats.flows} l="flow"/>
        <span style={{ marginLeft: "auto" }}>{timeAgo(diagram.createdAt)}</span>
      </div>
    </Card>
  );
}

function DCStat({ n, l }) {
  return <span><b style={{ color: "var(--fg)", fontWeight: 600 }}>{n}</b> {l}</span>;
}

function DiagramThumb({ diagram }) {
  return (
    <div className="dot-canvas" style={{
      width: "100%", height: 130,
      background: "var(--bg-subtle)",
      borderRadius: "var(--r-md)",
      border: "1px solid var(--border-subtle)",
      position: "relative", overflow: "hidden",
    }}>
      <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <g stroke="var(--border-strong)" strokeWidth="0.6" fill="none" opacity="0.6">
          <path d="M40 30 L 100 60"/><path d="M100 60 L 160 30"/>
          <path d="M160 30 L 220 60"/>
          <path d="M100 60 L 100 100"/><path d="M160 60 L 160 100"/><path d="M220 60 L 220 100"/>
          <path d="M40 30 L 280 30"/>
        </g>
        {[20, 80, 140, 200, 260].map((x, i) => (
          <rect key={`f${i}`} x={x} y="14" width="40" height="13" rx="3"
            fill="var(--kind-frontend-bg)" stroke="var(--kind-frontend)" strokeWidth="0.7"/>
        ))}
        {[40, 100, 160, 220].map((x, i) => (
          <rect key={`b${i}`} x={x} y="50" width="40" height="13" rx="3"
            fill="var(--kind-backend-bg)" stroke="var(--kind-backend)" strokeWidth="0.7"/>
        ))}
        {[80, 140, 200].map((x, i) => (
          <rect key={`d${i}`} x={x} y="86" width="40" height="13" rx="3"
            fill="var(--kind-database-bg)" stroke="var(--kind-database)" strokeWidth="0.7"/>
        ))}
        {[60, 240].map((x, i) => (
          <circle key={`fl${i}`} cx={x} cy="118" r="6" fill="var(--kind-flow-bg)" stroke="var(--kind-flow)" strokeWidth="0.7"/>
        ))}
      </svg>
    </div>
  );
}

// =================================================================
// EMPTY STATE
// =================================================================
function EmptyState({ icon = "upload", title, description, action }) {
  return (
    <div style={{
      padding: "56px 24px", textAlign: "center",
      background: "var(--surface)",
      border: "1px dashed var(--border-strong)",
      borderRadius: "var(--r-lg)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--r-md)",
        background: "var(--bg-muted)", color: "var(--fg-faint)",
        display: "grid", placeItems: "center", marginBottom: 4,
      }}>
        <Icon name={icon} size={20}/>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: "var(--fg)" }}>{title}</h3>
      <p style={{ color: "var(--fg-muted)", margin: 0, maxWidth: 420, fontSize: 13 }}>{description}</p>
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}

// =================================================================
// NEW PROJECT MODAL
// =================================================================
function NewProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const create = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName(""); setDescription("");
  };
  return (
    <Modal open={open} onClose={onClose} title="Nuevo proyecto"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={create} disabled={!name.trim()}>Crear proyecto</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Nombre del proyecto" htmlFor="np-name">
          <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="ej. Lumen Analytics" autoFocus/>
        </Field>
        <Field label="Descripción" htmlFor="np-desc" optional>
          <Textarea id="np-desc" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué es este proyecto? Una frase es suficiente." rows={3}/>
        </Field>
      </div>
    </Modal>
  );
}

// =================================================================
// SETTINGS
// =================================================================
function SettingsScreen({ user, theme, onToggleTheme, onUpdateUser }) {
  const [tab, setTab] = React.useState("profile");
  const tabs = [
    { id: "profile", label: "Perfil", icon: "user" },
    { id: "password", label: "Contraseña", icon: "lock" },
    { id: "preferences", label: "Preferencias", icon: "settings" },
  ];
  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1040, margin: "0 auto" }}>
      <PageHeader
        eyebrow="cuenta"
        title="Configuración"
        description="Ajusta tu perfil, contraseña y preferencias de la herramienta."
      />
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 28 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "7px 10px",
                  background: active ? "var(--bg-muted)" : "transparent",
                  border: "1px solid transparent",
                  borderRadius: "var(--r-sm)",
                  color: active ? "var(--fg)" : "var(--fg-muted)",
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon name={t.icon} size={13} style={{ color: active ? "var(--accent)" : "var(--fg-faint)" }}/>
                {t.label}
              </button>
            );
          })}
        </nav>
        <div>
          {tab === "profile" && <ProfileTab user={user} onUpdateUser={onUpdateUser}/>}
          {tab === "password" && <PasswordTab/>}
          {tab === "preferences" && <PreferencesTab theme={theme} onToggleTheme={onToggleTheme}/>}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, description, children }) {
  return (
    <Card padding={20} style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", margin: "0 0 4px", color: "var(--fg)" }}>{title}</h2>
      {description && <p style={{ color: "var(--fg-muted)", margin: "0 0 18px", fontSize: 13 }}>{description}</p>}
      {children}
    </Card>
  );
}

function ProfileTab({ user, onUpdateUser }) {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    onUpdateUser({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsCard title="Perfil" description="Información que se muestra en tu cuenta.">
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--accent)", color: "var(--accent-fg)",
          display: "grid", placeItems: "center",
          fontSize: 18, fontWeight: 600, letterSpacing: "0.01em",
        }}>
          {user.initials}
        </div>
        <div>
          <Button variant="secondary" size="sm">Cambiar foto</Button>
          <div style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 5 }}>JPG o PNG · máx. 2 MB</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
        <Field label="Nombre" htmlFor="prof-name"><Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)}/></Field>
        <Field label="Email" htmlFor="prof-email"><Input id="prof-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/></Field>
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="primary" onClick={save}>Guardar cambios</Button>
        {saved && <span style={{ color: "var(--success)", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="check" size={13}/> Guardado
        </span>}
      </div>
    </SettingsCard>
  );
}

function PasswordTab() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  return (
    <SettingsCard title="Cambiar contraseña" description="Introduce tu contraseña actual y la nueva.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
        <Field label="Contraseña actual" htmlFor="pw-cur"><Input id="pw-cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} icon="lock"/></Field>
        <Field label="Nueva contraseña" htmlFor="pw-new" hint="Mínimo 8 caracteres."><Input id="pw-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} icon="lock"/></Field>
        <Field label="Confirmar nueva contraseña" htmlFor="pw-conf"><Input id="pw-conf" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} icon="lock"/></Field>
      </div>
      <div style={{ marginTop: 20 }}>
        <Button variant="primary" disabled={!current || !next || next !== confirm}>Actualizar contraseña</Button>
      </div>
    </SettingsCard>
  );
}

function PreferencesTab({ theme, onToggleTheme }) {
  return (
    <SettingsCard title="Preferencias" description="Apariencia e idioma de la aplicación.">
      <PrefRow
        label="Tema"
        description="Claro u oscuro. Puedes cambiarlo también desde la barra superior."
        control={
          <Segmented
            value={theme}
            onChange={(v) => v !== theme && onToggleTheme()}
            options={[
              { value: "light", label: "Claro", icon: "sun" },
              { value: "dark", label: "Oscuro", icon: "moon" },
            ]}
          />
        }
      />
      <PrefRow
        label="Idioma"
        description="El idioma de la interfaz."
        control={
          <select style={{
            padding: "7px 30px 7px 11px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            fontSize: 12.5,
            color: "var(--fg)",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}>
            <option>Español</option>
            <option>English</option>
          </select>
        }
      />
      <PrefRow
        label="Atajos de teclado"
        description="Cmd+K para buscar, Esc para salir de foco en un diagrama."
        control={
          <div style={{ display: "flex", gap: 4 }}>
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        }
        last
      />
    </SettingsCard>
  );
}

function PrefRow({ label, description, control, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      gap: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

Object.assign(window, {
  AppShell, DashboardScreen, ProjectDetailScreen, SettingsScreen,
  NewProjectModal, EmptyState, timeAgo,
});
