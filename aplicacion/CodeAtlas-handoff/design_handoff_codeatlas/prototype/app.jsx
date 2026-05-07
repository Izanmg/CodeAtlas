/* ============================================================
   CodeAtlas v2 — Root app & router
   ============================================================ */

function App() {
  const [theme, setTheme] = React.useState("light");
  const [route, setRoute] = React.useState({ name: "login" });
  const [user, setUser] = React.useState(window.CA_DATA.currentUser);
  const [projects, setProjects] = React.useState(window.CA_DATA.projects);
  const [diagrams, setDiagrams] = React.useState(window.CA_DATA.diagrams);
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Cmd+K / Ctrl+K opens palette globally
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const showToast = (type, message) => setToast({ type, message });

  // ---- Routing helpers ----------------------------------------
  const go = (route) => setRoute(route);
  const goDashboard = () => go({ name: "dashboard" });
  const goProject = (project) => go({ name: "project", projectId: project.id });
  const goDiagramNew = (projectId) => go({ name: "diagram-new", projectId });
  const goDiagram = (diagram) => go({ name: "diagram", diagramId: diagram.id });
  const goSettings = () => go({ name: "settings" });

  // ---- Auth -----------------------------------------------------
  const login = () => { goDashboard(); showToast("success", "Bienvenido de vuelta"); };
  const logout = () => { go({ name: "login" }); };
  const register = () => { goDashboard(); showToast("success", "Cuenta creada con éxito"); };

  // ---- CRUD -----------------------------------------------------
  const createProject = ({ name, description }) => {
    const newP = {
      id: "p_" + Math.random().toString(36).slice(2, 8),
      name, description,
      diagramCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newP, ...prev]);
    setNewProjectOpen(false);
    showToast("success", `Proyecto "${name}" creado`);
    goProject(newP);
  };

  const onDiagramGenerated = ({ name }) => {
    const projectId = route.projectId;
    const newDiagram = {
      id: "d_" + Math.random().toString(36).slice(2, 8),
      projectId,
      name,
      description: "Generado a partir de tu documentación",
      createdAt: new Date().toISOString(),
      data: window.CA_DATA.diagrams[0].data,
    };
    setDiagrams((prev) => [...prev, newDiagram]);
    setProjects((prev) => prev.map((p) => p.id === projectId
      ? { ...p, diagramCount: p.diagramCount + 1, updatedAt: new Date().toISOString() }
      : p));
    showToast("success", "Diagrama generado");
    goDiagram(newDiagram);
  };

  // ---- Lookups -------------------------------------------------
  const currentProjectId = route.projectId;
  const currentProject = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null;
  const currentDiagram = route.diagramId
    ? diagrams.find((d) => d.id === route.diagramId)
    : null;
  const projectDiagrams = currentProjectId
    ? diagrams.filter((d) => d.projectId === currentProjectId)
    : [];

  // ---- Breadcrumbs --------------------------------------------
  const breadcrumbs = React.useMemo(() => {
    const crumbs = [{ label: "Atlas", onClick: goDashboard }];
    if (route.name === "project" && currentProject) {
      crumbs.push({ label: currentProject.name });
    } else if (route.name === "diagram-new" && currentProject) {
      crumbs.push({ label: currentProject.name, onClick: () => goProject(currentProject) });
      crumbs.push({ label: "Nuevo diagrama" });
    } else if (route.name === "settings") {
      crumbs.push({ label: "Configuración" });
    }
    return crumbs;
  }, [route, currentProject]);

  // ---- Command palette items ----------------------------------
  const paletteItems = React.useMemo(() => {
    const items = [
      { id: "nav-dash", label: "Ir al dashboard", section: "Navegación", icon: "folder", run: () => { goDashboard(); setPaletteOpen(false); } },
      { id: "nav-settings", label: "Configuración", section: "Navegación", icon: "settings", run: () => { goSettings(); setPaletteOpen(false); } },
      { id: "act-new-proj", label: "Nuevo proyecto", section: "Acciones", icon: "plus", shortcut: "⇧⌘N", run: () => { setPaletteOpen(false); setNewProjectOpen(true); } },
      { id: "act-theme", label: theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro", section: "Acciones", icon: theme === "dark" ? "sun" : "moon", run: () => { toggleTheme(); setPaletteOpen(false); } },
      { id: "act-logout", label: "Cerrar sesión", section: "Acciones", icon: "logout", run: () => { setPaletteOpen(false); logout(); } },
    ];
    projects.forEach((p) => {
      items.push({
        id: "proj-" + p.id, label: p.name, hint: p.description,
        section: "Proyectos", icon: "folder",
        run: () => { goProject(p); setPaletteOpen(false); },
      });
    });
    diagrams.forEach((d) => {
      const proj = projects.find(pp => pp.id === d.projectId);
      items.push({
        id: "diag-" + d.id, label: d.name, hint: proj?.name,
        section: "Diagramas", icon: "network",
        run: () => { goDiagram(d); setPaletteOpen(false); },
      });
    });
    return items;
  }, [projects, diagrams, theme]);

  // ---- Render --------------------------------------------------

  // Auth screens (no shell)
  if (route.name === "login") {
    return <><LoginScreen onSubmit={login} onGoRegister={() => go({ name: "register" })}/><Toast toast={toast} onDismiss={() => setToast(null)}/></>;
  }
  if (route.name === "register") {
    return <><RegisterScreen onSubmit={register} onGoLogin={() => go({ name: "login" })}/><Toast toast={toast} onDismiss={() => setToast(null)}/></>;
  }

  // Diagram view — full bleed, no shell
  if (route.name === "diagram" && currentDiagram) {
    const project = projects.find((p) => p.id === currentDiagram.projectId);
    return (
      <>
        <DiagramViewScreen diagram={currentDiagram} project={project}
          theme={theme} onToggleTheme={toggleTheme}
          onBack={() => goProject(project)}/>
        <Toast toast={toast} onDismiss={() => setToast(null)}/>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems}/>
      </>
    );
  }

  const navTab = route.name === "settings" ? "settings" : "dashboard";

  return (
    <>
      <AppShell
        current={navTab}
        onNav={(id) => id === "dashboard" ? goDashboard() : goSettings()}
        theme={theme} onToggleTheme={toggleTheme}
        user={user} onLogout={logout}
        breadcrumbs={breadcrumbs}
        onCommand={() => setPaletteOpen(true)}
      >
        {route.name === "dashboard" && (
          <DashboardScreen
            user={user}
            projects={projects}
            diagrams={diagrams}
            onOpenProject={goProject}
            onOpenDiagram={goDiagram}
            onNewProject={() => setNewProjectOpen(true)}
          />
        )}
        {route.name === "project" && currentProject && (
          <ProjectDetailScreen
            project={currentProject}
            diagrams={projectDiagrams}
            onBack={goDashboard}
            onOpenDiagram={goDiagram}
            onNewDiagram={() => goDiagramNew(currentProject.id)}
          />
        )}
        {route.name === "diagram-new" && currentProject && (
          <DiagramNewScreen
            project={currentProject}
            onBack={() => goProject(currentProject)}
            onGenerated={onDiagramGenerated}
          />
        )}
        {route.name === "settings" && (
          <SettingsScreen
            user={user}
            theme={theme} onToggleTheme={toggleTheme}
            onUpdateUser={(u) => { setUser((cur) => ({ ...cur, ...u })); showToast("success", "Cambios guardados"); }}
          />
        )}
      </AppShell>

      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={createProject}
      />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems}/>

      <Toast toast={toast} onDismiss={() => setToast(null)}/>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
