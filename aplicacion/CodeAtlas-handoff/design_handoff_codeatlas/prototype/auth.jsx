/* ============================================================
   CodeAtlas v2 — Auth screens (Login + Register)
   ============================================================ */

function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 1.05fr",
      background: "var(--bg)",
    }}>
      {/* Form side */}
      <div style={{
        display: "flex", flexDirection: "column",
        padding: "40px 56px",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <Logo size={22}/>
        </div>
        <div style={{ margin: "auto", width: "100%", maxWidth: 360 }}>
          {children}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: "var(--fg-faint)",
          letterSpacing: "0.04em",
        }}>
          <span>v0.1.0</span>
          <span>codeatlas.dev</span>
        </div>
      </div>

      {/* Visual side */}
      <AuthVisualSide/>
    </div>
  );
}

function AuthVisualSide() {
  return (
    <div className="dot-canvas" style={{
      position: "relative", overflow: "hidden",
      background: "var(--bg-subtle)",
    }}>
      {/* Decorative diagram preview */}
      <svg viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* connecting lines */}
        <g stroke="var(--accent)" strokeWidth="1.2" opacity="0.45" fill="none">
          <path d="M180 380 L 380 320"/>
          <path d="M380 320 L 580 380"/>
          <path d="M180 380 L 380 480"/>
          <path d="M380 480 L 580 480"/>
          <path d="M380 320 L 380 480"/>
          <path d="M580 380 L 580 480"/>
          <path d="M180 580 L 380 580"/>
          <path d="M380 480 L 380 580"/>
        </g>

        {/* nodes */}
        <NodeShape x={140} y={355} w={84} h={50} color="var(--kind-frontend)" bg="var(--kind-frontend-bg)" label="auth.fe"/>
        <NodeShape x={340} y={295} w={84} h={50} color="var(--kind-backend)" bg="var(--kind-backend-bg)" label="auth.be"/>
        <NodeShape x={540} y={355} w={84} h={50} color="var(--kind-screen)" bg="var(--kind-screen-bg)" label="login"/>
        <NodeShape x={340} y={455} w={84} h={50} color="var(--kind-database)" bg="var(--kind-database-bg)" label="users"/>
        <NodeShape x={540} y={455} w={84} h={50} color="var(--kind-flow)" bg="var(--kind-flow-bg)" label="login.flow"/>
        <NodeShape x={140} y={555} w={84} h={50} color="var(--kind-rules)" bg="var(--kind-rules-bg)" label="rules"/>
        <NodeShape x={340} y={555} w={84} h={50} color="var(--kind-frontend)" bg="var(--kind-frontend-bg)" label="dashboard"/>

        {/* corner marks */}
        <g style={{ font: "10px var(--font-mono)", fill: "var(--fg-faint)", letterSpacing: "0.04em" }}>
          <text x="40" y="56" style={{ textTransform: "uppercase" }}>diagram.preview</text>
          <text x="40" y="74" fill="var(--fg-subtle)">authentication subsystem</text>
          <text x="40" y="850">7 nodes · 8 edges</text>
          <text x="660" y="850">fig.01</text>
        </g>
      </svg>
    </div>
  );
}

function NodeShape({ x, y, w, h, color, bg, label }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5"
        fill={bg} stroke={color} strokeWidth="1.2"/>
      <rect x={x} y={y} width={w} height="3" rx="1.5" fill={color}/>
      <text x={x + w/2} y={y + h/2 + 5} textAnchor="middle"
        style={{ font: "11.5px var(--font-mono)", fill: "var(--fg)", fontWeight: 500 }}>
        {label}
      </text>
    </g>
  );
}

// -- Login --------------------------------------------------------
function LoginScreen({ onSubmit, onGoRegister }) {
  const [email, setEmail] = React.useState("marcos@codeatlas.dev");
  const [password, setPassword] = React.useState("••••••••••");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Introduce email y contraseña");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 600);
  };

  return (
    <AuthShell>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--fg-subtle)", letterSpacing: "0.06em",
        textTransform: "uppercase", marginBottom: 12,
      }}>
        Acceso
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1.15,
        margin: "0 0 8px", color: "var(--fg)",
      }}>
        Bienvenido de vuelta
      </h1>
      <p style={{ color: "var(--fg-muted)", margin: "0 0 28px", fontSize: 13.5 }}>
        Accede para continuar mapeando tu arquitectura.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email" htmlFor="login-email">
          <Input id="login-email" type="email" value={email} icon="user"
            onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoFocus/>
        </Field>
        <Field label="Contraseña" htmlFor="login-pw">
          <Input id="login-pw" type="password" value={password} icon="lock"
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
        </Field>

        {error && (
          <div style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--r-md)", padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 8,
            color: "var(--danger)", fontSize: 12.5,
          }}>
            <Icon name="alert" size={13}/>{error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? <><Icon name="loader" size={14} style={{ animation: "ca-spin 0.8s linear infinite", marginRight: 6 }}/>Entrando…</> : "Entrar"}
        </Button>

        <div style={{
          textAlign: "center", fontSize: 12.5,
          color: "var(--fg-muted)", marginTop: 4,
        }}>
          ¿Aún no tienes cuenta?{" "}
          <button type="button" onClick={onGoRegister}
            style={{ color: "var(--accent)", fontWeight: 600, padding: 0, fontSize: 12.5 }}>
            Crear cuenta
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes ca-spin { to { transform: rotate(360deg) } }`}}/>
    </AuthShell>
  );
}

// -- Register -----------------------------------------------------
function RegisterScreen({ onSubmit, onGoLogin }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 600);
  };

  return (
    <AuthShell>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--fg-subtle)", letterSpacing: "0.06em",
        textTransform: "uppercase", marginBottom: 12,
      }}>
        Registro
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1.15,
        margin: "0 0 8px", color: "var(--fg)",
      }}>
        Crea tu cuenta
      </h1>
      <p style={{ color: "var(--fg-muted)", margin: "0 0 28px", fontSize: 13.5 }}>
        Empieza a documentar la arquitectura de tus proyectos.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Nombre" htmlFor="reg-name">
          <Input id="reg-name" value={name} icon="user"
            onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoFocus/>
        </Field>
        <Field label="Email" htmlFor="reg-email">
          <Input id="reg-email" type="email" value={email} icon="user"
            onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com"/>
        </Field>
        <Field label="Contraseña" htmlFor="reg-pw" hint="Mínimo 8 caracteres.">
          <Input id="reg-pw" type="password" value={password} icon="lock"
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
        </Field>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? <><Icon name="loader" size={14} style={{ animation: "ca-spin 0.8s linear infinite", marginRight: 6 }}/>Creando…</> : "Crear cuenta"}
        </Button>

        <div style={{
          textAlign: "center", fontSize: 12.5,
          color: "var(--fg-muted)", marginTop: 4,
        }}>
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={onGoLogin}
            style={{ color: "var(--accent)", fontWeight: 600, padding: 0, fontSize: 12.5 }}>
            Iniciar sesión
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
