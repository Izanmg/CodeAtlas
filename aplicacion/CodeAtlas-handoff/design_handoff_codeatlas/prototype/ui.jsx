/* ============================================================
   CodeAtlas v2 — UI primitives
   Vibe: GitHub Next / Stripe — denso, técnico, mono protagonista
   ============================================================ */

// -- Icons (Lucide subset) ----------------------------------------
function Icon({ name, size = 14, strokeWidth = 1.75, className = "", style = {} }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">{paths}</svg>
  );
}

const ICONS = {
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  arrowLeft: <><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>,
  arrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  chevronRight: <><path d="m9 18 6-6-6-6"/></>,
  chevronDown: <><path d="m6 9 6 6 6-6"/></>,
  chevronUp: <><path d="m18 15-6-6-6 6"/></>,
  x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></>,
  fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></>,
  trash: <><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  layout: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
  folder: <><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  lock: <><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
  moon: <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></>,
  zoomIn: <><circle cx="11" cy="11" r="7"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></>,
  zoomOut: <><circle cx="11" cy="11" r="7"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></>,
  maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>,
  filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  network: <><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></>,
  monitor: <><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></>,
  workflow: <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h6a3 3 0 0 1 3 3v6"/></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></>,
  server: <><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></>,
  panel: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  alert: <><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>,
  loader: <><path d="M21 12a9 9 0 1 1-6.219-8.56"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
  external: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  more: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  command: <><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></>,
  focus: <><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></>,
  function: <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 11h6"/><path d="M9 15h4"/><path d="M9 3v4h6V3"/></>,
  import: <><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M3 21h18"/></>,
  usedBy: <><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></>,
  copy: <><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>,
  github: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
};

// -- Logo: geometric "C" monogram ---------------------------------
function LogoMark({ size = 28, color }) {
  const c = color || "var(--accent)";
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c}/>
          <stop offset="100%" stopColor={c} stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#lg-${id})`}/>
      {/* Geometric C: thick arc made from straight angles */}
      <path d="M22 9 L13 9 L9 13 L9 19 L13 23 L22 23"
        stroke="white" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
      {/* Small node terminator dots */}
      <circle cx="22" cy="9" r="1.4" fill="white"/>
      <circle cx="22" cy="23" r="1.4" fill="white"/>
    </svg>
  );
}

function Logo({ size = 24, showWordmark = true }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <LogoMark size={size}/>
      {showWordmark && (
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: size * 0.62,
          letterSpacing: "-0.02em",
          fontWeight: 600,
          color: "var(--fg)",
        }}>codeatlas</span>
      )}
    </span>
  );
}

// -- Button --------------------------------------------------------
function Button({ children, variant = "secondary", size = "md", icon, iconRight, onClick, type = "button", disabled, fullWidth, style, ...rest }) {
  const sizes = {
    xs: { padding: "0 8px", fontSize: 12, height: 24, gap: 5 },
    sm: { padding: "0 10px", fontSize: 12.5, height: 28, gap: 6 },
    md: { padding: "0 12px", fontSize: 13, height: 32, gap: 6 },
    lg: { padding: "0 16px", fontSize: 14, height: 38, gap: 8 },
  };
  const variants = {
    primary: { background: "var(--accent)", color: "var(--accent-fg)", border: "1px solid var(--accent)", fontWeight: 500 },
    secondary: { background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)", fontWeight: 500, boxShadow: "var(--shadow-xs)" },
    ghost: { background: "transparent", color: "var(--fg-muted)", border: "1px solid transparent", fontWeight: 500 },
    danger: { background: "var(--surface)", color: "var(--danger)", border: "1px solid var(--border)", fontWeight: 500 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="focus-ring"
      style={{
        ...sizes[size], ...variants[variant],
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--r-md)",
        letterSpacing: "-0.005em",
        transition: "background 100ms, border-color 100ms, color 100ms",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = "var(--accent-hover)";
        else if (variant === "secondary") e.currentTarget.style.background = "var(--bg-muted)";
        else if (variant === "ghost") { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; }
        else if (variant === "danger") { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.background = "var(--danger-bg)"; }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--accent)";
        else if (variant === "secondary") e.currentTarget.style.background = "var(--surface)";
        else if (variant === "ghost") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }
        else if (variant === "danger") { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }
      }}
      {...rest}>
      {icon && <Icon name={icon} size={size === "xs" || size === "sm" ? 13 : 14}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "xs" || size === "sm" ? 13 : 14}/>}
    </button>
  );
}

// -- Field & Input -------------------------------------------------
function Field({ label, hint, error, children, htmlFor, optional }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label htmlFor={htmlFor} style={{
          fontSize: 12, fontWeight: 500, color: "var(--fg)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{label}</span>
          {optional && <span style={{ color: "var(--fg-faint)", fontWeight: 400 }}>opcional</span>}
        </label>
      )}
      {children}
      {error
        ? <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
        : hint ? <span style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{hint}</span> : null}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", id, autoFocus, icon, mono, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{
      position: "relative", display: "flex", alignItems: "center",
      background: "var(--surface)",
      border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "var(--r-md)",
      transition: "border-color 100ms, box-shadow 100ms",
      boxShadow: focused ? "var(--shadow-focus)" : "var(--shadow-xs)",
    }}>
      {icon && <span style={{ paddingLeft: 9, color: "var(--fg-faint)", display: "flex" }}><Icon name={icon} size={14}/></span>}
      <input id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoFocus={autoFocus}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "8px 11px",
          background: "transparent", border: "none", outline: "none",
          fontSize: 13, color: "var(--fg)",
          fontFamily: mono ? "var(--font-mono)" : "inherit",
        }} {...rest}/>
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3, id, mono, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        padding: "9px 11px",
        background: "var(--surface)",
        border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--r-md)",
        outline: "none", resize: "vertical",
        fontSize: 13, color: "var(--fg)",
        boxShadow: focused ? "var(--shadow-focus)" : "var(--shadow-xs)",
        transition: "border-color 100ms, box-shadow 100ms",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      }} {...rest}/>
  );
}

// -- Card ----------------------------------------------------------
function Card({ children, hoverable, onClick, style, padding = 16 }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hoverable && hover ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: "var(--r-lg)",
        padding,
        cursor: hoverable ? "pointer" : undefined,
        transition: "border-color 100ms, box-shadow 100ms, transform 100ms",
        boxShadow: hoverable && hover ? "var(--shadow-md)" : "var(--shadow-xs)",
        ...style,
      }}>{children}</div>
  );
}

// -- Badge ---------------------------------------------------------
function Badge({ children, color = "neutral", icon, mono, style }) {
  const colors = {
    neutral: { bg: "var(--bg-muted)", text: "var(--fg-muted)" },
    accent: { bg: "var(--accent-soft)", text: "var(--accent)" },
    backend: { bg: "var(--kind-backend-bg)", text: "var(--kind-backend)" },
    frontend: { bg: "var(--kind-frontend-bg)", text: "var(--kind-frontend)" },
    screen: { bg: "var(--kind-screen-bg)", text: "var(--kind-screen)" },
    database: { bg: "var(--kind-database-bg)", text: "var(--kind-database)" },
    flow: { bg: "var(--kind-flow-bg)", text: "var(--kind-flow)" },
    rules: { bg: "var(--kind-rules-bg)", text: "var(--kind-rules)" },
    success: { bg: "var(--success-bg)", text: "var(--success)" },
    warning: { bg: "var(--warning-bg)", text: "var(--warning)" },
    danger: { bg: "var(--danger-bg)", text: "var(--danger)" },
  };
  const c = colors[color] || colors.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "1px 7px",
      background: c.bg, color: c.text,
      borderRadius: 4,
      fontSize: 11, fontWeight: 500,
      fontFamily: mono ? "var(--font-mono)" : "inherit",
      letterSpacing: mono ? 0 : "0.005em",
      lineHeight: "18px",
      ...style,
    }}>
      {icon && <Icon name={icon} size={10}/>}
      {children}
    </span>
  );
}

// -- Topbar (replaces Sidebar) ------------------------------------
function Topbar({ current, onNav, theme, onToggleTheme, user, onLogout, onCommand, breadcrumbs }) {
  return (
    <header style={{
      height: 48, flexShrink: 0,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 16px",
      gap: 12,
      position: "sticky", top: 0, zIndex: 30,
    }}>
      <button onClick={() => onNav("dashboard")} style={{ display: "flex", alignItems: "center", padding: 0 }}>
        <Logo size={22}/>
      </button>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <>
          <div style={{ width: 1, height: 18, background: "var(--border)" }}/>
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, minWidth: 0, flex: 1 }}>
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevronRight" size={12} style={{ color: "var(--fg-faint)", flexShrink: 0 }}/>}
                {bc.onClick ? (
                  <button onClick={bc.onClick} style={{
                    color: "var(--fg-muted)", padding: "3px 6px", borderRadius: 4,
                    fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}>
                    {bc.label}
                  </button>
                ) : (
                  <span style={{ color: "var(--fg)", fontWeight: 500, padding: "3px 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {bc.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onCommand} className="focus-ring" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "0 8px 0 10px", height: 30,
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          color: "var(--fg-subtle)", fontSize: 12.5,
          minWidth: 220,
        }}>
          <Icon name="search" size={13}/>
          <span style={{ flex: 1, textAlign: "left" }}>Buscar bloques, diagramas…</span>
          <kbd>⌘K</kbd>
        </button>

        <button onClick={onToggleTheme} title="Cambiar tema" className="focus-ring" style={{
          width: 30, height: 30, display: "grid", placeItems: "center",
          background: "transparent", borderRadius: "var(--r-md)",
          color: "var(--fg-muted)",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}>
          <Icon name={theme === "dark" ? "sun" : "moon"} size={15}/>
        </button>

        <button onClick={() => onNav("settings")} title="Configuración" className="focus-ring" style={{
          width: 30, height: 30, display: "grid", placeItems: "center",
          background: current === "settings" ? "var(--bg-muted)" : "transparent",
          borderRadius: "var(--r-md)",
          color: current === "settings" ? "var(--fg)" : "var(--fg-muted)",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; }}
          onMouseLeave={(e) => { if (current !== "settings") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; } }}>
          <Icon name="settings" size={15}/>
        </button>

        <UserMenu user={user} onLogout={onLogout} onSettings={() => onNav("settings")}/>
      </div>
    </header>
  );
}

function UserMenu({ user, onLogout, onSettings }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} className="focus-ring" style={{
        width: 28, height: 28,
        background: "var(--accent)", color: "var(--accent-fg)",
        borderRadius: "50%",
        fontSize: 11, fontWeight: 600,
        display: "grid", placeItems: "center",
      }}>{user.initials}</button>
      {open && (
        <div style={{
          position: "absolute", top: 36, right: 0,
          minWidth: 220,
          background: "var(--surface-overlay)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-lg)",
          padding: 4,
          zIndex: 50,
        }}>
          <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 4 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{user.email}</div>
          </div>
          <MenuItem icon="user" onClick={() => { setOpen(false); onSettings(); }}>Mi cuenta</MenuItem>
          <MenuItem icon="logout" onClick={() => { setOpen(false); onLogout(); }} danger>Cerrar sesión</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, icon, onClick, danger, kbd }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px",
      borderRadius: "var(--r-sm)",
      fontSize: 12.5,
      color: danger ? "var(--danger)" : "var(--fg)",
      textAlign: "left",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {icon && <Icon name={icon} size={13} style={{ color: danger ? "var(--danger)" : "var(--fg-faint)" }}/>}
      <span style={{ flex: 1 }}>{children}</span>
      {kbd && <kbd>{kbd}</kbd>}
    </button>
  );
}

// -- Modal ---------------------------------------------------------
function Modal({ open, onClose, title, children, footer, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(9, 9, 11, 0.5)",
      backdropFilter: "blur(2px)",
      display: "grid", placeItems: "center",
      animation: "ca-fade 120ms ease-out",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: "calc(100vw - 32px)",
        background: "var(--surface-overlay)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-xl)",
        animation: "ca-scale-in 140ms cubic-bezier(0.2,0.8,0.2,1)",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
          <button onClick={onClose} style={{ color: "var(--fg-muted)", padding: 4, display: "grid", placeItems: "center", borderRadius: 4 }}>
            <Icon name="x" size={15}/>
          </button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
        {footer && <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ca-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ca-scale-in { from { opacity: 0; transform: scale(0.97) translateY(4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}}/>
    </div>
  );
}

// -- Toast ---------------------------------------------------------
function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const colors = {
    success: { bg: "var(--success-bg)", border: "var(--success)", icon: "check" },
    error: { bg: "var(--danger-bg)", border: "var(--danger)", icon: "alert" },
    info: { bg: "var(--surface)", border: "var(--border)", icon: "alert" },
  };
  const c = colors[toast.type] || colors.info;
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 200,
      background: "var(--surface-overlay)",
      border: `1px solid var(--border)`,
      borderLeft: `2px solid ${c.border}`,
      borderRadius: "var(--r-md)",
      padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "var(--shadow-lg)",
      animation: "ca-slide-in 180ms cubic-bezier(0.2,0.8,0.2,1)",
      maxWidth: 380,
    }}>
      <Icon name={c.icon} size={14} style={{ color: c.border }}/>
      <span style={{ fontSize: 12.5 }}>{toast.message}</span>
      <button onClick={onDismiss} style={{ color: "var(--fg-faint)", padding: 2, display: "grid", placeItems: "center" }}>
        <Icon name="x" size={13}/>
      </button>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ca-slide-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }`}}/>
    </div>
  );
}

// -- Page header (used inside main views) -------------------------
function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, flex: "1 1 480px" }}>
        {eyebrow && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11, fontWeight: 500,
            color: "var(--fg-subtle)",
            letterSpacing: "0.04em", textTransform: "uppercase",
            marginBottom: 6,
          }}>{eyebrow}</div>
        )}
        <h1 style={{
          fontFamily: "var(--font-sans)",
          fontSize: 24, fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          margin: 0, color: "var(--fg)",
        }}>{title}</h1>
        {description && (
          <p style={{
            fontSize: 13.5, color: "var(--fg-muted)",
            margin: "6px 0 0", maxWidth: 640, lineHeight: 1.5,
          }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// -- Command Palette (Cmd+K) --------------------------------------
function CommandPalette({ open, onClose, items, onSelect }) {
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return items;
    const ql = q.toLowerCase();
    return items.filter(it => it.label.toLowerCase().includes(ql) || (it.subtitle || "").toLowerCase().includes(ql) || (it.kind || "").toLowerCase().includes(ql));
  }, [q, items]);

  React.useEffect(() => { setIdx(0); }, [q]);

  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); if (filtered[idx]) { onSelect(filtered[idx]); onClose(); } }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, filtered, idx, onClose, onSelect]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 150,
      background: "rgba(9, 9, 11, 0.45)",
      backdropFilter: "blur(3px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh",
      animation: "ca-fade 100ms",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 580, maxWidth: "calc(100vw - 32px)",
        background: "var(--surface-overlay)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        animation: "ca-scale-in 140ms cubic-bezier(0.2,0.8,0.2,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <Icon name="search" size={15} style={{ color: "var(--fg-faint)" }}/>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar bloques, diagramas o acciones…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--fg)" }}/>
          <kbd>esc</kbd>
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--fg-subtle)", fontSize: 13 }}>
              No hay resultados para <span className="mono" style={{ color: "var(--fg)" }}>"{q}"</span>
            </div>
          ) : filtered.map((it, i) => (
            <button key={it.id || i}
              onClick={() => { onSelect(it); onClose(); }}
              onMouseEnter={() => setIdx(i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--r-md)",
                background: i === idx ? "var(--bg-muted)" : "transparent",
                textAlign: "left",
              }}>
              {it.icon && <div style={{
                width: 26, height: 26, borderRadius: 5,
                background: it.iconBg || "var(--bg-muted)",
                color: it.iconColor || "var(--fg-muted)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}><Icon name={it.icon} size={13}/></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{it.label}</div>
                {it.subtitle && <div style={{ fontSize: 11.5, color: "var(--fg-subtle)", fontFamily: it.subtitleMono ? "var(--font-mono)" : "inherit" }}>{it.subtitle}</div>}
              </div>
              {it.kindLabel && <Badge color={it.kindColor || "neutral"} mono>{it.kindLabel}</Badge>}
              {i === idx && <Icon name="arrowRight" size={12} style={{ color: "var(--fg-faint)" }}/>}
            </button>
          ))}
        </div>
        <div style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 14,
          fontSize: 11, color: "var(--fg-subtle)",
          background: "var(--bg-subtle)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><kbd>↵</kbd> seleccionar</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><kbd>esc</kbd> cerrar</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)" }}>{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}

// -- Segmented control --------------------------------------------
function Segmented({ options, value, onChange, size = "sm" }) {
  const h = size === "sm" ? 28 : 32;
  return (
    <div style={{
      display: "inline-flex", padding: 2,
      background: "var(--bg-muted)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      gap: 1,
    }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            style={{
              height: h - 4, padding: "0 10px",
              fontSize: 12, fontWeight: 500,
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-muted)",
              borderRadius: 4,
              boxShadow: active ? "var(--shadow-xs)" : "none",
              display: "inline-flex", alignItems: "center", gap: 5,
              transition: "background 80ms, color 80ms",
            }}>
            {opt.icon && <Icon name={opt.icon} size={12}/>}
            {opt.label}
            {opt.count !== undefined && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: active ? "var(--fg-subtle)" : "var(--fg-faint)" }}>{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon, ICONS, Logo, LogoMark, Button, Input, Textarea, Field,
  Card, Badge, Topbar, Modal, Toast, PageHeader, CommandPalette,
  Segmented, MenuItem,
});
